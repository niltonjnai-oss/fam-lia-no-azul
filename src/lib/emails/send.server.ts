// Wrapper server-only para envio via Resend através do gateway Lovable.
// Nunca importar do cliente. NÃO usado para emails de auth (Supabase cuida).

const GATEWAY_URL = "https://connector-gateway.lovable.dev/resend";

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
  const LOVABLE_API_KEY = process.env.LOVABLE_API_KEY;
  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY não configurado");
  if (!RESEND_API_KEY) throw new Error("RESEND_API_KEY não configurado");

  const res = await fetch(`${GATEWAY_URL}/emails`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      "X-Connection-Api-Key": RESEND_API_KEY,
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
    throw new Error(`Resend gateway ${res.status}: ${body}`);
  }
  try {
    const parsed = JSON.parse(body) as { id?: string };
    return { id: parsed.id ?? "" };
  } catch {
    return { id: "" };
  }
}
