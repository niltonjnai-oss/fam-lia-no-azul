// Templates de email (marketing/onboarding/lembretes/educacionais).
// Emails transacionais de auth continuam no Supabase.

const BRAND = {
  name: "Família no Azul",
  primary: "#1E40AF",
  bg: "#F8FAFC",
  text: "#0F172A",
  muted: "#64748B",
  url: "https://azul.educarbem.com.br",
};

function shell({ title, bodyHtml }: { title: string; bodyHtml: string }) {
  return `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#ffffff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:${BRAND.text};">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#ffffff;padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;background:${BRAND.bg};border-radius:16px;padding:32px;">
        <tr><td style="padding-bottom:24px;border-bottom:1px solid #E2E8F0;">
          <div style="font-size:20px;font-weight:700;color:${BRAND.primary};">${BRAND.name}</div>
        </td></tr>
        <tr><td style="padding-top:24px;font-size:16px;line-height:1.6;">
          ${bodyHtml}
        </td></tr>
        <tr><td style="padding-top:32px;border-top:1px solid #E2E8F0;font-size:12px;color:${BRAND.muted};text-align:center;">
          Você recebeu este email porque tem conta em ${BRAND.name}.<br/>
          <a href="${BRAND.url}" style="color:${BRAND.muted};">${BRAND.url}</a>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export function onboardingDia1({ nome }: { nome?: string }) {
  const saudacao = nome ? `Olá, ${nome}!` : "Olá!";
  return {
    subject: "Bem-vindo(a) ao Família no Azul 💙",
    html: shell({
      title: "Bem-vindo(a)",
      bodyHtml: `
        <h1 style="margin:0 0 16px;font-size:24px;color:${BRAND.text};">${saudacao}</h1>
        <p>Que bom ter você aqui. O <strong>Família no Azul</strong> foi feito pra tirar sua família do vermelho e organizar as finanças de um jeito simples.</p>
        <p><strong>Seu primeiro passo:</strong> montar seu orçamento em menos de 10 minutos.</p>
        <p style="text-align:center;margin:32px 0;">
          <a href="${BRAND.url}/orcamento" style="background:${BRAND.primary};color:#fff;text-decoration:none;padding:12px 24px;border-radius:8px;display:inline-block;font-weight:600;">Começar meu orçamento</a>
        </p>
        <p style="color:${BRAND.muted};font-size:14px;">Qualquer dúvida, responda este email — leio pessoalmente.</p>
      `,
    }),
  };
}

export function lembreteSemanal({ nome }: { nome?: string }) {
  return {
    subject: "Como foi sua semana financeira?",
    html: shell({
      title: "Lembrete semanal",
      bodyHtml: `
        <h1 style="margin:0 0 16px;font-size:22px;">${nome ? `Oi ${nome},` : "Oi!"}</h1>
        <p>Passou uma semana — bora atualizar seu orçamento? 5 minutos agora evitam surpresa no fim do mês.</p>
        <p style="text-align:center;margin:32px 0;">
          <a href="${BRAND.url}/orcamento" style="background:${BRAND.primary};color:#fff;text-decoration:none;padding:12px 24px;border-radius:8px;display:inline-block;font-weight:600;">Atualizar orçamento</a>
        </p>
      `,
    }),
  };
}

export function marketingGenerico({
  titulo,
  corpoHtml,
  ctaTexto,
  ctaUrl,
}: {
  titulo: string;
  corpoHtml: string;
  ctaTexto?: string;
  ctaUrl?: string;
}) {
  const cta =
    ctaTexto && ctaUrl
      ? `<p style="text-align:center;margin:32px 0;">
           <a href="${ctaUrl}" style="background:${BRAND.primary};color:#fff;text-decoration:none;padding:12px 24px;border-radius:8px;display:inline-block;font-weight:600;">${ctaTexto}</a>
         </p>`
      : "";
  return {
    subject: titulo,
    html: shell({
      title: titulo,
      bodyHtml: `
        <h1 style="margin:0 0 16px;font-size:24px;">${titulo}</h1>
        ${corpoHtml}
        ${cta}
      `,
    }),
  };
}

export const TEMPLATES = {
  "onboarding-dia-1": onboardingDia1,
  "lembrete-semanal": lembreteSemanal,
  "marketing-generico": marketingGenerico,
} as const;

export type TemplateId = keyof typeof TEMPLATES;
