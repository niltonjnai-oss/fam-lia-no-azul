// Templates de email (marketing/onboarding/lembretes/educacionais).
// Emails transacionais de auth continuam no Supabase.
//
// Layout padronizado (mesma identidade do template de boas-vindas do Supabase):
// header em degradê azul com o logotipo, card branco arredondado, CTA em bloco,
// nota de apoio e assinatura "Equipe Família no Azul".

const BRAND = {
  name: "Família no Azul",
  primary: "#1E40AF",
  primaryDark: "#1E3A8A",
  gradient: "linear-gradient(135deg,#1E3A8A 0%,#2563EB 60%,#3B82F6 100%)",
  pageBg: "#F1F5F9",
  cardBg: "#FFFFFF",
  footerBg: "#F8FAFC",
  text: "#0F172A",
  muted: "#64748B",
  border: "#E2E8F0",
  url: "https://azul.educarbem.com.br",
};

function botao(texto: string, href: string) {
  return `<table role="presentation" cellpadding="0" cellspacing="0" align="center" style="margin:28px auto;">
    <tr><td style="border-radius:10px;background:${BRAND.primaryDark};">
      <a href="${href}" style="display:inline-block;padding:14px 32px;font-size:16px;font-weight:700;color:#ffffff;text-decoration:none;border-radius:10px;">${texto}</a>
    </td></tr>
  </table>`;
}

function shell({ title, bodyHtml }: { title: string; bodyHtml: string }) {
  return `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>${title}</title>
</head>
<body style="margin:0;padding:0;background:${BRAND.pageBg};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:${BRAND.text};">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BRAND.pageBg};padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:${BRAND.cardBg};border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(15,23,42,0.08);">

        <!-- Header degradê com logomarca (versão para fundo escuro) -->
        <tr><td align="center" style="background-color:${BRAND.primary};background-image:${BRAND.gradient};padding:28px 24px;">
          <img src="${BRAND.url}/brand/familia-vertical-dark.png" width="150" alt="${BRAND.name}" style="display:block;width:150px;max-width:60%;height:auto;border:0;" />
        </td></tr>

        <!-- Corpo -->
        <tr><td style="padding:36px 40px 28px;font-size:16px;line-height:1.65;color:${BRAND.text};">
          ${bodyHtml}
        </td></tr>

        <!-- Assinatura -->
        <tr><td align="center" style="background:${BRAND.footerBg};border-top:1px solid ${BRAND.border};padding:20px 24px;font-size:14px;color:${BRAND.muted};">
          Um abra&ccedil;o,<br/>
          <strong style="color:${BRAND.primary};">Equipe ${BRAND.name}</strong>
        </td></tr>
      </table>

      <!-- Rodapé legal -->
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;">
        <tr><td align="center" style="padding:20px 24px 0;font-size:12px;line-height:1.6;color:${BRAND.muted};">
          Voc&ecirc; recebeu este email porque tem conta em ${BRAND.name}.<br/>
          <a href="${BRAND.url}" style="color:${BRAND.muted};">${BRAND.url}</a>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

/** Boas-vindas pós-compra: convida o comprador a criar a conta com o email
 *  da compra (é o email que o gate de cadastro valida). */
export function boasVindas({ nome, emailCompra }: { nome?: string; emailCompra?: string }) {
  const saudacao = nome ? `${nome.split(" ")[0]}, seu` : "Seu";
  const linhaEmail = emailCompra
    ? `<strong>Importante:</strong> use o mesmo e-mail desta compra (<strong>${emailCompra}</strong>) no cadastro — é ele que libera sua entrada.`
    : `<strong>Importante:</strong> use o mesmo e-mail da compra no cadastro — é ele que libera sua entrada.`;
  return {
    subject: "Compra aprovada — seu acesso está liberado 🎉",
    html: shell({
      title: "Seu acesso está liberado",
      bodyHtml: `
        <h1 style="margin:0 0 16px;font-size:24px;line-height:1.3;color:${BRAND.primaryDark};">${saudacao} acesso est&aacute; liberado 🎉</h1>
        <p style="margin:0 0 16px;">Sua compra foi aprovada! Agora falta s&oacute; um passo: <strong>criar sua conta de acesso</strong> e come&ccedil;ar a planejar a vida financeira da sua fam&iacute;lia.</p>
        <p style="margin:0 0 8px;">${linhaEmail}</p>
        ${botao("Criar minha conta e entrar", `${BRAND.url}/auth`)}
        <p style="margin:0;text-align:center;font-size:13px;color:${BRAND.muted};">Leva menos de 1 minuto. Seus dados ficam protegidos — cada fam&iacute;lia s&oacute; enxerga o que &eacute; seu.</p>
      `,
    }),
  };
}

export function onboardingDia1({ nome }: { nome?: string }) {
  const saudacao = nome ? `Olá, ${nome.split(" ")[0]}!` : "Olá!";
  return {
    subject: "Seu primeiro passo para sair do vermelho 💙",
    html: shell({
      title: "Bem-vindo(a)",
      bodyHtml: `
        <h1 style="margin:0 0 16px;font-size:24px;line-height:1.3;color:${BRAND.primaryDark};">${saudacao}</h1>
        <p style="margin:0 0 16px;">Que bom ter voc&ecirc; aqui. O <strong>${BRAND.name}</strong> foi feito para tirar sua fam&iacute;lia do vermelho — sem planilha, sem briga, sem susto.</p>
        <p style="margin:0 0 8px;"><strong>Seu primeiro passo:</strong> montar o or&ccedil;amento da fam&iacute;lia. Leva menos de 10 minutos e j&aacute; muda a forma como voc&ecirc; enxerga o m&ecirc;s.</p>
        ${botao("Montar meu orçamento", `${BRAND.url}/orcamento`)}
        <p style="margin:0;font-size:14px;color:${BRAND.muted};">Qualquer d&uacute;vida, &eacute; s&oacute; responder este email — a gente l&ecirc; pessoalmente.</p>
      `,
    }),
  };
}

export function lembreteSemanal({ nome }: { nome?: string }) {
  const saudacao = nome ? `Oi, ${nome.split(" ")[0]}!` : "Oi!";
  return {
    subject: "Como foi sua semana financeira?",
    html: shell({
      title: "Lembrete semanal",
      bodyHtml: `
        <h1 style="margin:0 0 16px;font-size:22px;line-height:1.3;color:${BRAND.primaryDark};">${saudacao}</h1>
        <p style="margin:0 0 8px;">Semana nova come&ccedil;ando — bora colocar o or&ccedil;amento em dia? <strong>5 minutos agora</strong> evitam surpresa no fim do m&ecirc;s.</p>
        ${botao("Atualizar meu orçamento", `${BRAND.url}/orcamento`)}
        <p style="margin:0;text-align:center;font-size:13px;color:${BRAND.muted};">Fam&iacute;lia que acompanha junto, sai do vermelho junto. 💙</p>
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
  const cta = ctaTexto && ctaUrl ? botao(ctaTexto, ctaUrl) : "";
  return {
    subject: titulo,
    html: shell({
      title: titulo,
      bodyHtml: `
        <h1 style="margin:0 0 16px;font-size:24px;line-height:1.3;color:${BRAND.primaryDark};">${titulo}</h1>
        ${corpoHtml}
        ${cta}
      `,
    }),
  };
}

export const TEMPLATES = {
  "boas-vindas": boasVindas,
  "onboarding-dia-1": onboardingDia1,
  "lembrete-semanal": lembreteSemanal,
  "marketing-generico": marketingGenerico,
} as const;

export type TemplateId = keyof typeof TEMPLATES;
