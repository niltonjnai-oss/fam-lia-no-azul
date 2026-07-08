// Endpoint público para webhooks da Kiwify.
// Configure o segredo em KIWIFY_WEBHOOK_SECRET (ou KIWIFY_WEBHOOK_TOKEN — este arquivo
// aceita os dois nomes) e aponte a Kiwify para:
//   https://SEU-DOMINIO/api/public/kiwify/webhook
//
// A Kiwify envia o header X-Kiwify-Secret com o segredo configurado no dashboard.
//
// IMPORTANTE sobre o payload:
// A Kiwify não publica um schema fixo de webhook. O corpo varia por evento, mas
// costuma trazer dados do pedido (order_id/id, order_status), do cliente
// (Customer/customer.email) e, quando aplicável, da assinatura (Subscription). O nome
// do evento pode chegar por query string (?event=...), por um campo no corpo
// (event/webhook_event_type/trigger) ou só implícito no status do pedido. Este handler
// tenta as três formas (ver `resolveEventType` e `extractPayload`). Antes de ativar em
// produção: dispare um "Test Webhook" pelo painel da Kiwify (Apps → Webhooks → ver
// logs), confira o payload real e ajuste os helpers abaixo se os nomes de campo forem
// diferentes do que assumimos aqui.
//
// Tabelas Supabase esperadas — crie com supabase/sql/kiwify_webhook.sql (ainda não
// existiam no schema do projeto):
//   - assinaturas: 1 linha por cliente (email), com o status de acesso atual.
//   - pagamentos: 1 linha por evento de pagamento recebido (auditoria + idempotência).

import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { timingSafeEqual } from "crypto";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// ---------- Segurança (mantido do arquivo original) ----------

function safeEqual(a: string, b: string) {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ba.length !== bb.length) return false;
  return timingSafeEqual(ba, bb);
}

// ---------- Cliente admin (service role) ----------
// Nunca importar este helper de código client-side: SUPABASE_SERVICE_ROLE_KEY
// ignora RLS e só pode ser lido em runtime de servidor (rotas /api/*.ts).

function getSupabaseAdmin(): SupabaseClient {
  const url =
    process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL ?? process.env.APP_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error(
      "Supabase admin não configurado. Defina SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY nas variáveis de ambiente do servidor.",
    );
  }
  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}

// ---------- Normalização de evento ----------

type EventoInterno =
  | "pagamento_aprovado"
  | "pagamento_recusado"
  | "pagamento_reembolsado"
  | "chargeback"
  | "assinatura_renovada"
  | "assinatura_atrasada"
  | "assinatura_cancelada"
  | "ignorado";

// Cobre os triggers oficiais da Kiwify (docs.kiwify.com.br/api-reference/webhooks) em
// pt-BR e variantes genéricas em inglês (payment.approved, subscription.created etc.),
// caso o evento chegue traduzido por algum middleware ou configurado manualmente.
const EVENT_ALIASES: Record<string, EventoInterno> = {
  // compra aprovada / primeira cobrança
  compra_aprovada: "pagamento_aprovado",
  order_approved: "pagamento_aprovado",
  "payment.approved": "pagamento_aprovado",
  "order.paid": "pagamento_aprovado",
  "subscription.created": "pagamento_aprovado",
  paid: "pagamento_aprovado",

  // compra recusada
  compra_recusada: "pagamento_recusado",
  order_refused: "pagamento_recusado",
  "payment.refused": "pagamento_recusado",
  "payment.declined": "pagamento_recusado",
  refused: "pagamento_recusado",

  // reembolso
  compra_reembolsada: "pagamento_reembolsado",
  order_refunded: "pagamento_reembolsado",
  "payment.refunded": "pagamento_reembolsado",
  refunded: "pagamento_reembolsado",

  // chargeback
  chargeback: "chargeback",
  "payment.chargeback": "chargeback",
  chargedback: "chargeback",

  // renovação de assinatura
  subscription_renewed: "assinatura_renovada",
  "subscription.renewed": "assinatura_renovada",

  // assinatura atrasada (cobrança falhou, ainda em retry)
  subscription_late: "assinatura_atrasada",
  "subscription.late": "assinatura_atrasada",
  "subscription.past_due": "assinatura_atrasada",

  // cancelamento
  subscription_canceled: "assinatura_cancelada",
  subscription_cancelled: "assinatura_cancelada",
  "subscription.canceled": "assinatura_cancelada",
  "subscription.cancelled": "assinatura_cancelada",

  // eventos informativos, sem impacto em acesso — apenas reconhecidos (200 OK)
  boleto_gerado: "ignorado",
  pix_gerado: "ignorado",
  carrinho_abandonado: "ignorado",
};

function pick(...values: unknown[]): string | undefined {
  for (const v of values) {
    if (typeof v === "string" && v.trim()) return v.trim();
  }
  return undefined;
}

function resolveEventType(
  request: Request,
  body: Record<string, unknown>,
): { raw: string; tipo: EventoInterno } {
  const url = new URL(request.url);
  const fromQuery = url.searchParams.get("event") ?? url.searchParams.get("trigger");
  const fromBody = pick(body.webhook_event_type, body.event, body.trigger);

  let raw = fromQuery ?? fromBody ?? "";

  if (!raw) {
    // Sem nome de evento explícito: infere a partir do status do pedido.
    const status = pick(body.order_status, body.status)?.toLowerCase() ?? "";
    if (status === "paid" || status === "approved") raw = "compra_aprovada";
    else if (status === "refused" || status === "declined") raw = "compra_recusada";
    else if (status === "refunded") raw = "compra_reembolsada";
    else if (status === "chargedback" || status === "chargeback") raw = "chargeback";
  }

  const tipo = EVENT_ALIASES[raw.toLowerCase()] ?? "ignorado";
  return { raw: raw || "desconhecido", tipo };
}

// ---------- Extração defensiva do payload ----------
// Sem schema público fixo, tentamos vários caminhos comuns (incluindo o formato antigo
// {event, data} que este arquivo usava). Ajuste aqui se o payload real da sua conta
// vier com nomes de campo diferentes.

function asRecord(v: unknown): Record<string, unknown> {
  return v && typeof v === "object" ? (v as Record<string, unknown>) : {};
}

interface KiwifyPayload {
  orderId?: string;
  subscriptionId?: string;
  customerEmail?: string;
  customerName?: string;
  productId?: string;
  productName?: string;
  plano?: string;
  amountCents?: number;
  currency?: string;
  nextPaymentAt?: string;
}

function extractPayload(body: Record<string, unknown>): KiwifyPayload {
  const data = asRecord(body.data); // compat com o formato antigo {event, data}
  const customer = asRecord(body.Customer ?? body.customer ?? data.customer);
  const product = asRecord(body.Product ?? body.product ?? data.product);
  const subscription = asRecord(body.Subscription ?? body.subscription ?? data.subscription);
  const payment = asRecord(body.payment ?? data.payment);

  const amountRaw =
    payment.charge_amount ?? payment.net_amount ?? body.net_amount ?? data.net_amount ?? body.amount;
  const amountCents = typeof amountRaw === "number" ? amountRaw : Number(amountRaw);

  const email = pick(customer.email, body.email, data.email);

  return {
    orderId: pick(body.order_id, body.id, data.order_id, data.id, body.reference),
    subscriptionId: pick(subscription.id, subscription.subscription_id),
    customerEmail: email?.toLowerCase(),
    customerName: pick(customer.name, customer.full_name, body.customer_name),
    productId: pick(product.id, product.product_id, body.product_id, data.product_id),
    productName: pick(product.name, product.product_name, body.product_name, data.product_name),
    plano: pick(subscription.plan_name, product.name, body.product_name),
    amountCents: Number.isFinite(amountCents) ? amountCents : undefined,
    currency: pick(body.currency, payment.charge_currency, data.currency) ?? "BRL",
    nextPaymentAt: pick(subscription.next_payment, subscription.next_payment_date),
  };
}

// ---------- Regras de acesso ----------

const DURACAO_PADRAO_DIAS = 365; // plano anual único hoje — ver src/routes/assinatura.tsx

function addDays(date: Date, days: number): string {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

async function findUserIdByEmail(admin: SupabaseClient, email: string): Promise<string | null> {
  // supabase-js não tem um "getUserByEmail" direto; pagina o admin.listUsers até achar.
  // Para bases grandes de usuários, prefira uma tabela `profiles` (email, user_id)
  // sincronizada por trigger em auth.users — mais barato que paginar a cada webhook.
  try {
    for (let page = 1; page <= 5; page++) {
      const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });
      if (error || !data) return null;
      const found = data.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
      if (found) return found.id;
      if (data.users.length < 200) break;
    }
  } catch {
    return null;
  }
  return null;
}

async function aplicarEventoNaAssinatura(
  admin: SupabaseClient,
  evento: EventoInterno,
  payload: KiwifyPayload,
): Promise<void> {
  if (evento === "pagamento_recusado") {
    // Nunca chegou a ter acesso — o registro em `pagamentos` já é suficiente.
    return;
  }

  const email = payload.customerEmail!;
  const userId = await findUserIdByEmail(admin, email);
  const agora = new Date();

  const base = {
    email,
    user_id: userId,
    nome: payload.customerName ?? null,
    produto_id: payload.productId ?? null,
    produto_nome: payload.productName ?? null,
    plano: payload.plano ?? null,
    kiwify_order_id: payload.orderId ?? null,
    kiwify_subscription_id: payload.subscriptionId ?? null,
    atualizado_em: agora.toISOString(),
  };

  if (evento === "pagamento_aprovado") {
    const { error } = await admin.from("assinaturas").upsert(
      {
        ...base,
        status: "ativa",
        data_inicio: agora.toISOString(),
        data_expiracao: addDays(agora, DURACAO_PADRAO_DIAS),
      },
      { onConflict: "email" },
    );
    if (error) throw new Error(`assinaturas (aprovado): ${error.message}`);
    return;
  }

  if (evento === "assinatura_renovada") {
    const expiracao = payload.nextPaymentAt
      ? new Date(payload.nextPaymentAt).toISOString()
      : addDays(agora, DURACAO_PADRAO_DIAS);
    const { error } = await admin
      .from("assinaturas")
      .upsert({ ...base, status: "ativa", data_expiracao: expiracao }, { onConflict: "email" });
    if (error) throw new Error(`assinaturas (renovada): ${error.message}`);
    return;
  }

  if (evento === "assinatura_atrasada") {
    const { error } = await admin
      .from("assinaturas")
      .upsert({ ...base, status: "atrasada" }, { onConflict: "email" });
    if (error) throw new Error(`assinaturas (atrasada): ${error.message}`);
    return;
  }

  // assinatura_cancelada, pagamento_reembolsado, chargeback: revoga o acesso.
  const { error } = await admin
    .from("assinaturas")
    .upsert({ ...base, status: "cancelada" }, { onConflict: "email" });
  if (error) throw new Error(`assinaturas (cancelada): ${error.message}`);
}

export const Route = createFileRoute("/api/public/kiwify/webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        // Aceita os dois nomes: seu .env usa KIWIFY_WEBHOOK_TOKEN, o comentário no topo
        // deste arquivo (e outros exemplos) usam KIWIFY_WEBHOOK_SECRET.
        const secret = process.env.KIWIFY_WEBHOOK_SECRET ?? process.env.KIWIFY_WEBHOOK_TOKEN;
        if (!secret) return new Response("Not configured", { status: 500 });

        const provided = request.headers.get("x-kiwify-secret") ?? "";
        if (!safeEqual(provided, secret)) {
          return new Response("Unauthorized", { status: 401 });
        }

        let rawBody: unknown;
        try {
          rawBody = await request.json();
        } catch {
          return new Response("Invalid JSON", { status: 400 });
        }

        const parsed = z.record(z.string(), z.unknown()).safeParse(rawBody);
        if (!parsed.success) {
          return Response.json({ error: parsed.error.flatten() }, { status: 400 });
        }
        const body = parsed.data;

        const { raw: eventoRaw, tipo: evento } = resolveEventType(request, body);
        const payload = extractPayload(body);

        // Eventos informativos (boleto/pix gerado, carrinho abandonado): só confirma
        // recebimento, sem gravar nada.
        if (evento === "ignorado") {
          return Response.json({ ok: true, event: eventoRaw, handled: false });
        }

        if (!payload.customerEmail && !payload.orderId) {
          // Sem como identificar cliente/pedido: loga e responde 200 para a Kiwify não
          // ficar reenviando um evento que nunca vai casar com ninguém.
          console.error("[kiwify-webhook] payload sem email/order_id", { eventoRaw, body });
          return Response.json({ ok: true, event: eventoRaw, warning: "missing_identifiers" });
        }

        let admin: SupabaseClient;
        try {
          admin = getSupabaseAdmin();
        } catch (e) {
          console.error("[kiwify-webhook] supabase admin indisponível", e);
          return Response.json(
            { error: e instanceof Error ? e.message : "supabase admin unavailable" },
            { status: 500 },
          );
        }

        try {
          // 1) Registra o evento de pagamento (auditoria + idempotência). O unique
          //    constraint (kiwify_order_id, evento) faz reenvios da Kiwify virarem
          //    upsert em vez de linha duplicada.
          if (payload.orderId) {
            const { error: pagamentoError } = await admin.from("pagamentos").upsert(
              {
                kiwify_order_id: payload.orderId,
                kiwify_subscription_id: payload.subscriptionId ?? null,
                evento: eventoRaw,
                evento_tipo: evento,
                email: payload.customerEmail ?? null,
                produto_id: payload.productId ?? null,
                produto_nome: payload.productName ?? null,
                valor_centavos: payload.amountCents ?? null,
                moeda: payload.currency ?? null,
                payload_bruto: body,
              },
              { onConflict: "kiwify_order_id,evento" },
            );
            if (pagamentoError) throw new Error(`pagamentos: ${pagamentoError.message}`);
          }

          // 2) Atualiza (ou cria) a assinatura do cliente e libera/revoga o acesso.
          if (payload.customerEmail) {
            await aplicarEventoNaAssinatura(admin, evento, payload);
          }
        } catch (e) {
          console.error("[kiwify-webhook] falha ao processar evento", { eventoRaw, error: e });
          // 500 faz a Kiwify reenviar o webhook mais tarde — correto para falhas
          // transitórias (rede, banco fora do ar). Se o problema for dado malformado
          // recorrente, prefira responder 200 + log para não entrar em loop de reenvio.
          return Response.json(
            { error: e instanceof Error ? e.message : "processing failed" },
            { status: 500 },
          );
        }

        return Response.json({ ok: true, event: eventoRaw });
      },
    },
  },
});
