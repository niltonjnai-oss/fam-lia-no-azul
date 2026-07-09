// Wrapper server-only para envio via API do Resend (chamada direta).
// Nunca importar do cliente. NÃO usado para emails de auth (Supabase cuida).
// Requer RESEND_API_KEY (sua conta Resend) e um domínio verificado no Resend
// que corresponda ao remetente EMAIL_FROM.

const RESEND_API_URL = "https://api.resend.com/emails";
const RESEND_BATCH_URL = "https://api.resend.com/emails/batch";

export const EMAIL_FROM =
  process.env.EMAIL_FROM ??
  "Família no Azul <contato@mail.azul.educarbem.com.br>";

export type SendEmailInput = {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
  tags?: { name: string; value: string }[];
};

export type SendEmailResult = {
  id: string;
};

export async function sendEmail(input: SendEmailInput): Promise<SendEmailResult> {
  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  if (!RESEND_API_KEY) throw new Error("RESEND_API_KEY não configurado");

  const res = await fetch(RESEND_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: EMAIL_FROM,
      to: Array.isArray(input.to) ? input.to : [input.to],
      subject: input.subject,
      html: input.html,
      text: input.text,
      reply_to: input.replyTo,
      tags: input.tags,
    }),
  });

  const body = await res.text();
  if (!res.ok) {
    throw new Error(`Resend ${res.status}: ${body}`);
  }
  try {
    const parsed = JSON.parse(body) as { id?: string };
    return { id: parsed.id ?? "" };
  } catch {
    return { id: "" };
  }
}

/** Envia o mesmo email individualmente para vários destinatários via batch do
 *  Resend (até 100 emails por chamada; um destinatário não vê o outro).
 *  Retorna os ids na ordem de envio. */
export async function sendEmailToMany(
  recipients: string[],
  content: Omit<SendEmailInput, "to">,
): Promise<{ ids: string[] }> {
  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  if (!RESEND_API_KEY) throw new Error("RESEND_API_KEY não configurado");

  const ids: string[] = [];
  for (let i = 0; i < recipients.length; i += 100) {
    const chunk = recipients.slice(i, i + 100);
    const res = await fetch(RESEND_BATCH_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify(
        chunk.map((to) => ({
          from: EMAIL_FROM,
          to: [to],
          subject: content.subject,
          html: content.html,
          text: content.text,
          reply_to: content.replyTo,
        })),
      ),
    });
    const body = await res.text();
    if (!res.ok) {
      throw new Error(
        `Resend batch ${res.status} (após ${ids.length} enviados): ${body}`,
      );
    }
    try {
      const parsed = JSON.parse(body) as { data?: { id?: string }[] };
      for (const d of parsed.data ?? []) ids.push(d.id ?? "");
    } catch {
      // resposta sem ids — segue; o envio do lote já foi aceito (res.ok)
    }
  }
  return { ids };
}
