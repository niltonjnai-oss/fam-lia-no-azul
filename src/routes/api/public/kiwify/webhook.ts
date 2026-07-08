// Endpoint público para webhooks da Kiwify.
// Configure o segredo em KIWIFY_WEBHOOK_SECRET (ou KIWIFY_WEBHOOK_TOKEN — este arquivo
// aceita os dois nomes) e aponte a Kiwify para:
//   https://SEU-DOMINIO/api/public/kiwify/webhook
//
// A Kiwify assina o webhook com HMAC-SHA1 do corpo (chave = token do dashboard) e envia
// o resultado no parâmetro ?signature= da URL. Ver verifyKiwifySignature abaixo.
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
// PERSISTÊNCIA — grava em public.kiwify_pedidos, a MESMA tabela que o restante do app
// já lê:
//   - verificar_compra_kiwify (Auth Hook "before user created") libera o cadastro quando
//     existe linha com email_cliente = <email> e evento in ('compra_aprovada',
//     'subscription_renewed').
//   - get_minha_assinatura (tela "Sua assinatura") lê os pedidos do usuário.
// Por isso o evento é normalizado para os valores canônicos que o gate reconhece
// (ver EVENTO_TO_PEDIDO), independentemente de a Kiwify mandar o nome em inglês ou só
// o status do pedido.

import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { createHmac, timingSafeEqual } from "crypto";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// ---------- Segurança ----------

function safeEqual(a: string, b: string) {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ba.length !== bb.length) return false;
  return timingSafeEqual(ba, bb);
}

// A Kiwify assina cada webhook com HMAC-SHA1 do corpo cru, usando o token como chave,
// e envia o resultado (hex) no parâmetro ?signature= da URL. Validamos recalculando o
// mesmo HMAC sobre o corpo recebido e comparando em tempo constante.
function verifyKiwifySignature(rawBody: string, signature: string, token: string): boolean {
  const expected = createHmac("sha1", token).update(rawBody, "utf8").digest("hex");
  return safeEqual(expected, signature);
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

// Valor gravado em kiwify_pedidos.evento por tipo interno. Os dois primeiros são os que
// o gate de cadastro (verificar_compra_kiwify) reconhece como "compra válida".
const EVENTO_TO_PEDIDO: Record<Exclude<EventoInterno, "ignorado">, string> = {
  pagamento_aprovado: "compra_aprovada",
  assinatura_renovada: "subscription_renewed",
  pagamento_recusado: "compra_recusada",
  pagamento_reembolsado: "compra_reembolsada",
  chargeback: "chargeback",
  assinatura_atrasada: "subscription_late",
  assinatura_cancelada: "subscription_canceled",
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

export const Route = createFileRoute("/api/public/kiwify/webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        // Aceita os dois nomes: o .env usa KIWIFY_WEBHOOK_TOKEN, alguns exemplos usam
        // KIWIFY_WEBHOOK_SECRET. Este valor é a chave que a Kiwify usa para assinar.
        const secret = process.env.KIWIFY_WEBHOOK_SECRET ?? process.env.KIWIFY_WEBHOOK_TOKEN;
        if (!secret) return new Response("Not configured", { status: 500 });

        // Lê o corpo cru ANTES de parsear — a Kiwify assina exatamente os bytes enviados.
        const rawText = await request.text();

        // Autenticação: HMAC-SHA1 no parâmetro ?signature= (como a Kiwify manda de fato).
        // Mantém o header x-kiwify-secret como alternativa para testes manuais.
        const url = new URL(request.url);
        const signature = url.searchParams.get("signature") ?? "";
        const headerSecret = request.headers.get("x-kiwify-secret") ?? "";
        const okSignature = signature !== "" && verifyKiwifySignature(rawText, signature, secret);
        const okHeader = headerSecret !== "" && safeEqual(headerSecret, secret);
        if (!okSignature && !okHeader) {
          return new Response("Unauthorized", { status: 401 });
        }

        let rawBody: unknown;
        try {
          rawBody = JSON.parse(rawText);
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

        if (!payload.customerEmail) {
          // Sem e-mail não há como o gate de cadastro casar o pedido com o usuário.
          // Loga e responde 200 para a Kiwify não ficar reenviando indefinidamente.
          console.error("[kiwify-webhook] payload sem email do cliente", { eventoRaw, body });
          return Response.json({ ok: true, event: eventoRaw, warning: "missing_email" });
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

        // Grava o pedido em kiwify_pedidos com o evento normalizado. O upsert por
        // (order_id, evento) faz reenvios da Kiwify virarem no-op em vez de duplicar
        // linhas (requer o índice único kiwify_pedidos_order_evento_uniq — ver
        // supabase/sql/kiwify_pedidos_idempotencia.sql).
        const eventoPedido = EVENTO_TO_PEDIDO[evento];
        try {
          const { error } = await admin.from("kiwify_pedidos").upsert(
            {
              order_id: payload.orderId ?? null,
              evento: eventoPedido,
              email_cliente: payload.customerEmail,
              nome_cliente: payload.customerName ?? null,
              produto_id: payload.productId ?? null,
              produto_nome: payload.productName ?? null,
              valor_centavos: payload.amountCents ?? null,
              payload: body,
            },
            { onConflict: "order_id,evento" },
          );
          if (error) throw new Error(`kiwify_pedidos: ${error.message}`);
        } catch (e) {
          console.error("[kiwify-webhook] falha ao gravar pedido", { eventoRaw, error: e });
          // 500 faz a Kiwify reenviar mais tarde — correto para falhas transitórias.
          return Response.json(
            { error: e instanceof Error ? e.message : "processing failed" },
            { status: 500 },
          );
        }

        return Response.json({ ok: true, event: eventoRaw, evento_gravado: eventoPedido });
      },
    },
  },
});
