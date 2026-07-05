import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/privacidade")({
  head: () => ({
    meta: [
      { title: "Política de Privacidade — Família no Azul" },
      {
        name: "description",
        content: "Como o Família no Azul trata seus dados pessoais, em conformidade com a LGPD.",
      },
      { property: "og:title", content: "Política de Privacidade — Família no Azul" },
      {
        property: "og:description",
        content: "Como o Família no Azul trata seus dados pessoais, em conformidade com a LGPD.",
      },
    ],
    links: [{ rel: "canonical", href: "/privacidade" }],
  }),
  component: PrivacidadePage,
});

function PrivacidadePage() {
  return (
    <div className="min-h-screen bg-[#EAF4FC] px-6 py-16 text-[#0F2A47]">
      <article className="mx-auto max-w-3xl">
        <Link to="/inicio" className="text-sm text-[#0F2A47]/60 hover:text-[#0F2A47]">
          ← Voltar ao início
        </Link>
        <h1
          className="mt-6 text-4xl tracking-tight md:text-5xl"
          style={{ fontFamily: "'Fraunces', Georgia, serif" }}
        >
          Política de Privacidade
        </h1>
        <p className="mt-2 text-sm text-[#0F2A47]/60">
          Última atualização: [INSERIR DATA]
        </p>
        <div className="prose prose-slate mt-8 max-w-none text-[#0F2A47]/80">
          <p>
            O Família no Azul, marca do Grupo Romana (CNPJ 48.570.356/0001-97), trata seus dados

            pessoais em conformidade com a Lei Geral de Proteção de Dados (LGPD — Lei nº
            13.709/2018).
          </p>
          <p>[INSERIR CONTEÚDO COMPLETO DA POLÍTICA DE PRIVACIDADE]</p>
          <p>
            <strong>Seus direitos.</strong> Você pode solicitar acesso, correção, exclusão e
            portabilidade dos seus dados a qualquer momento pelo e-mail [INSERIR E-MAIL].
          </p>
          <p>
            <strong>Compartilhamento.</strong> Não vendemos nem compartilhamos seus dados
            financeiros com terceiros para fins comerciais.
          </p>
        </div>
      </article>
    </div>
  );
}
