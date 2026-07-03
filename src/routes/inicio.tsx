import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  PiggyBank,
  Wallet,
  TrendingUp,
  ShieldCheck,
  Sparkles,
  CreditCard,
} from "lucide-react";

export const Route = createFileRoute("/inicio")({
  head: () => ({
    meta: [
      { title: "Família no Azul — Organize as finanças da sua família" },
      {
        name: "description",
        content:
          "O jeito simples e humano de organizar o orçamento familiar. Método 50-30-20, reserva de emergência e controle de dívidas em um só lugar.",
      },
      { property: "og:title", content: "Família no Azul — Organize as finanças da sua família" },
      {
        property: "og:description",
        content: "Orçamento familiar claro, sem planilhas complicadas. Comece grátis.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LandingPage,
});

const highlights = [
  {
    icon: Wallet,
    title: "Orçamento vivo",
    desc: "Acompanhe renda, gastos e saldo do mês em tempo real — sem planilhas.",
  },
  {
    icon: TrendingUp,
    title: "Método 50-30-20",
    desc: "Sua renda dividida em essencial, estilo de vida e futuro. Simples de seguir.",
  },
  {
    icon: PiggyBank,
    title: "Reserva de emergência",
    desc: "Veja seu progresso mês a mês e nunca mais adie a tranquilidade.",
  },
  {
    icon: CreditCard,
    title: "Dívidas sob controle",
    desc: "Priorize, negocie e quite. Cada passo aproxima a família do azul.",
  },
];

const steps = [
  {
    n: "01",
    title: "Conte sua renda",
    desc: "Em 1 minuto, cadastre as entradas do mês.",
  },
  {
    n: "02",
    title: "Registre os gastos",
    desc: "Categorize cada saída com dois toques.",
  },
  {
    n: "03",
    title: "Respire fundo",
    desc: "O painel mostra o caminho — e o próximo passo.",
  },
];

function LandingPage() {
  return (
    <div className="min-h-screen bg-[#F7F3EC] text-[#1B2A3A] font-sans antialiased">
      {/* Nav */}
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-[#1B2A3A] text-[#F7F3EC]">
            <Sparkles className="h-4 w-4" />
          </div>
          <span className="text-lg font-semibold tracking-tight">Família no Azul</span>
        </div>
        <nav className="hidden items-center gap-8 text-sm text-[#1B2A3A]/70 md:flex">
          <a href="#recursos" className="hover:text-[#1B2A3A]">Recursos</a>
          <a href="#como-funciona" className="hover:text-[#1B2A3A]">Como funciona</a>
          <a href="#planos" className="hover:text-[#1B2A3A]">Planos</a>
        </nav>
        <Link
          to="/auth"
          className="rounded-full bg-[#1B2A3A] px-4 py-2 text-sm font-medium text-[#F7F3EC] transition-colors hover:bg-[#1B2A3A]/90"
        >
          Entrar
        </Link>
      </header>

      {/* Hero */}
      <section className="mx-auto grid max-w-6xl gap-10 px-6 pt-8 pb-20 md:grid-cols-[1.1fr_1fr] md:items-center md:pt-14">
        <div>
          <span className="inline-flex items-center rounded-full border border-[#1B2A3A]/15 bg-white/60 px-3 py-1 text-xs font-medium uppercase tracking-wider text-[#1B2A3A]/70">
            Orçamento familiar humano
          </span>
          <h1
            className="mt-6 text-5xl leading-[1.05] tracking-tight text-[#1B2A3A] md:text-6xl lg:text-7xl"
            style={{ fontFamily: "'Fraunces', Georgia, serif" }}
          >
            A calma de saber<br />
            <em className="font-normal italic text-[#2E5A88]">o seu azul.</em>
          </h1>
          <p className="mt-6 max-w-lg text-base text-[#1B2A3A]/70 md:text-lg">
            Além de contas e planilhas, existe um jeito mais leve de cuidar do dinheiro
            da família. Um painel que respeita seu tempo, sua renda e seus sonhos.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              to="/auth"
              className="inline-flex items-center gap-2 rounded-full bg-[#B24A2E] px-6 py-3 text-sm font-medium text-white shadow-sm transition-transform hover:-translate-y-0.5 hover:bg-[#9d3f27]"
            >
              Começar agora
              <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="#como-funciona"
              className="inline-flex items-center gap-2 rounded-full border border-[#1B2A3A]/15 bg-white/60 px-6 py-3 text-sm font-medium text-[#1B2A3A] hover:bg-white"
            >
              Como funciona
            </a>
          </div>
          <div className="mt-8 flex items-center gap-2 text-xs text-[#1B2A3A]/60">
            <ShieldCheck className="h-4 w-4" />
            Seus dados ficam com você. Sem venda, sem propaganda.
          </div>
        </div>

        <div className="relative">
          <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-[#E8DFCE] to-[#D9CDB5] blur-2xl opacity-70" />
          <div className="relative overflow-hidden rounded-[2rem] border border-[#1B2A3A]/10 bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between text-xs text-[#1B2A3A]/60">
              <span>Novembro 2026</span>
              <span className="rounded-full bg-[#E8F3EA] px-2 py-0.5 text-[10px] font-semibold text-[#2F7A3E]">
                No azul
              </span>
            </div>
            <div className="mt-4">
              <div className="text-xs text-[#1B2A3A]/60">Saldo do mês</div>
              <div className="mt-1 text-4xl font-semibold tracking-tight">R$ 2.480,00</div>
            </div>
            <div className="mt-6 space-y-3">
              {[
                { label: "Essencial", pct: 46, color: "#2E5A88" },
                { label: "Estilo de vida", pct: 24, color: "#B24A2E" },
                { label: "Reserva & Dívidas", pct: 22, color: "#2F7A3E" },
              ].map((r) => (
                <div key={r.label}>
                  <div className="mb-1 flex justify-between text-xs">
                    <span className="text-[#1B2A3A]/70">{r.label}</span>
                    <span className="font-medium tabular-nums">{r.pct}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-[#1B2A3A]/5">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${r.pct}%`, backgroundColor: r.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 grid grid-cols-2 gap-3 text-xs">
              <div className="rounded-xl bg-[#F7F3EC] p-3">
                <div className="text-[#1B2A3A]/60">Reserva</div>
                <div className="mt-1 text-base font-semibold">4,2 meses</div>
              </div>
              <div className="rounded-xl bg-[#F7F3EC] p-3">
                <div className="text-[#1B2A3A]/60">Dívidas</div>
                <div className="mt-1 text-base font-semibold">R$ 1.120</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Recursos */}
      <section id="recursos" className="border-t border-[#1B2A3A]/10 bg-white/40">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="max-w-2xl">
            <span className="text-xs font-medium uppercase tracking-wider text-[#1B2A3A]/60">
              Recursos
            </span>
            <h2
              className="mt-3 text-3xl tracking-tight md:text-4xl"
              style={{ fontFamily: "'Fraunces', Georgia, serif" }}
            >
              Tudo que uma família precisa,<br />
              <em className="italic text-[#2E5A88]">nada que ela não precise.</em>
            </h2>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {highlights.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="rounded-2xl border border-[#1B2A3A]/10 bg-white p-6 transition-shadow hover:shadow-md"
              >
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#F7F3EC] text-[#B24A2E]">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="mt-4 text-base font-semibold">{title}</div>
                <p className="mt-2 text-sm text-[#1B2A3A]/70">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Como funciona */}
      <section id="como-funciona" className="mx-auto max-w-6xl px-6 py-24">
        <div className="max-w-2xl">
          <span className="text-xs font-medium uppercase tracking-wider text-[#1B2A3A]/60">
            Como funciona
          </span>
          <h2
            className="mt-3 text-3xl tracking-tight md:text-4xl"
            style={{ fontFamily: "'Fraunces', Georgia, serif" }}
          >
            Três passos até <em className="italic text-[#2E5A88]">respirar aliviado.</em>
          </h2>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {steps.map((s) => (
            <div key={s.n} className="rounded-2xl border border-[#1B2A3A]/10 bg-white p-8">
              <div
                className="text-4xl text-[#B24A2E]"
                style={{ fontFamily: "'Fraunces', Georgia, serif" }}
              >
                {s.n}
              </div>
              <div className="mt-4 text-lg font-semibold">{s.title}</div>
              <p className="mt-2 text-sm text-[#1B2A3A]/70">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA final */}
      <section id="planos" className="mx-auto max-w-6xl px-6 pb-24">
        <div className="overflow-hidden rounded-[2rem] bg-[#1B2A3A] p-10 text-[#F7F3EC] md:p-14">
          <div className="grid gap-8 md:grid-cols-[1.3fr_1fr] md:items-center">
            <div>
              <h2
                className="text-3xl leading-tight tracking-tight md:text-4xl"
                style={{ fontFamily: "'Fraunces', Georgia, serif" }}
              >
                Comece hoje.<br />
                <em className="italic text-[#E8DFCE]">A família agradece amanhã.</em>
              </h2>
              <p className="mt-4 max-w-lg text-sm text-[#F7F3EC]/70">
                Um plano anual, sem surpresas. Cancele quando quiser.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <Link
                to="/auth"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#B24A2E] px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-[#9d3f27]"
              >
                Criar minha conta
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/auth"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-[#F7F3EC]/20 px-6 py-3 text-sm font-medium text-[#F7F3EC] hover:bg-white/5"
              >
                Já tenho conta
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#1B2A3A]/10">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-8 text-xs text-[#1B2A3A]/60">
          <div>© {new Date().getFullYear()} Família no Azul. Feito com carinho.</div>
          <div className="flex items-center gap-6">
            <a href="#recursos" className="hover:text-[#1B2A3A]">Recursos</a>
            <a href="#como-funciona" className="hover:text-[#1B2A3A]">Como funciona</a>
            <Link to="/auth" className="hover:text-[#1B2A3A]">Entrar</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
