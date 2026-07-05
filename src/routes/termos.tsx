import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/termos")({
  head: () => ({
    meta: [
      { title: "Termos de Uso — Família no Azul" },
      { name: "description", content: "Termos de Uso do Família no Azul." },
      { property: "og:title", content: "Termos de Uso — Família no Azul" },
      { property: "og:description", content: "Termos de Uso do Família no Azul." },
    ],
    links: [{ rel: "canonical", href: "/termos" }],
  }),
  component: TermosPage,
});

function TermosPage() {
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
          Termos de Uso
        </h1>
        <p className="mt-2 text-sm text-[#0F2A47]/60">
          Última atualização: [INSERIR DATA]
        </p>
        <div className="prose prose-slate mt-8 max-w-none text-[#0F2A47]/80">
          <p>[INSERIR CONTEÚDO DOS TERMOS DE USO]</p>
          <p>
            O Família no Azul é uma marca do Grupo Romana (CNPJ [INSERIR CNPJ]). Ao usar o serviço,
            você concorda com estes Termos.
          </p>
        </div>
      </article>
    </div>
  );
}
