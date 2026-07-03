import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  PiggyBank,
  Wallet,
  TrendingUp,
  ShieldCheck,
  CreditCard,
} from "lucide-react";
import logoHorizontal from "@/assets/familia_no_azul_horizontal.png.asset.json";

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
  { n: "01", title: "Conte sua renda", desc: "Em 1 minuto, cadastre as entradas do mês." },
  { n: "02", title: "Registre os gastos", desc: "Categorize cada saída com dois toques." },
  { n: "03", title: "Respire fundo", desc: "O painel mostra o caminho — e o próximo passo." },
];

const ORANGE = "#F97316";
const ORANGE_HOVER = "#EA580C";
const NAVY = "#0F2A47";

function LandingPage() {
  return (
    <div
      className="min-h-screen text-[#0F2A47] font-sans antialiased"
      style={{
        backgroundImage:
          "linear-gradient(180deg, #E6F2FB 0%, #D6EAF8 40%, #EAF4FC 100%)",
      }}
    >
      {/* Nav */}
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <Link to="/inicio" className="flex items-center">
          <img
            src={logoHorizontal.url}
            alt="Família no Azul"
            className="h-10 w-auto"
          />
        </Link>
        <nav className="hidden items-center gap-8 text-sm text-[#0F2A47]/70 md:flex">
          <a href="#recursos" className="hover:text-[#0F2A47]">Recursos</a>
          <a href="#como-funciona" className="hover:text-[#0F2A47]">Como funciona</a>
          <a href="#planos" className="hover:text-[#0F2A47]">Planos</a>
        </nav>
        <Link
          to="/auth"
          className="rounded-full border border-[#0F2A47]/15 bg-white/70 px-4 py-2 text-sm font-medium text-[#0F2A47] transition-colors hover:bg-white"
        >
          Entrar
        </Link>
      </header>

      {/* Hero */}
      <section className="mx-auto grid max-w-6xl gap-10 px-6 pt-8 pb-20 md:grid-cols-[1.1fr_1fr] md:items-center md:pt-14">
        <div>
          <span
            className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white"
            style={{ backgroundColor: ORANGE }}
          >
            Orçamento familiar humano
          </span>
          <h1
            className="mt-6 text-5xl leading-[1.05] tracking-tight md:text-6xl lg:text-7xl"
            style={{ fontFamily: "'Fraunces', Georgia, serif" }}
          >
            A calma de saber<br />
            <em className="font-normal italic" style={{ color: ORANGE }}>o seu azul.</em>
          </h1>
          <p className="mt-6 max-w-lg text-base text-[#0F2A47]/70 md:text-lg">
            Além de contas e planilhas, existe um jeito mais leve de cuidar do dinheiro
            da família. Um painel que respeita seu tempo, sua renda e seus sonhos.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              to="/auth"
              className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white shadow-md transition-all hover:-translate-y-0.5"
              style={{ backgroundColor: ORANGE }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = ORANGE_HOVER)}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = ORANGE)}
            >
              Começar agora
              <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="#como-funciona"
              className="inline-flex items-center gap-2 rounded-full border border-[#0F2A47]/15 bg-white/70 px-6 py-3 text-sm font-medium text-[#0F2A47] hover:bg-white"
            >
              Como funciona
            </a>
          </div>
          <div className="mt-8 flex items-center gap-2 text-xs text-[#0F2A47]/60">
            <ShieldCheck className="h-4 w-4" />
            Seus dados ficam com você. Sem venda, sem propaganda.
          </div>
        </div>

        <div className="relative">
          <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-white/60 to-[#B8DCF3]/60 blur-2xl" />
          <div className="relative overflow-hidden rounded-[2rem] border border-white/60 bg-white/90 p-6 shadow-xl backdrop-blur">
            <div className="flex items-center justify-between text-xs text-[#0F2A47]/60">
              <span>Novembro 2026</span>
              <span className="rounded-full bg-[#E8F3EA] px-2 py-0.5 text-[10px] font-semibold text-[#2F7A3E]">
                No azul
              </span>
            </div>
            <div className="mt-4">
              <div className="text-xs text-[#0F2A47]/60">Saldo do mês</div>
              <div className="mt-1 text-4xl font-semibold tracking-tight">R$ 2.480,00</div>
            </div>
            <div className="mt-6 space-y-3">
              {[
                { label: "Essencial", pct: 46, color: NAVY },
                { label: "Estilo de vida", pct: 24, color: ORANGE },
                { label: "Reserva & Dívidas", pct: 22, color: "#2F7A3E" },
              ].map((r) => (
                <div key={r.label}>
                  <div className="mb-1 flex justify-between text-xs">
                    <span className="text-[#0F2A47]/70">{r.label}</span>
                    <span className="font-medium tabular-nums">{r.pct}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-[#0F2A47]/5">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${r.pct}%`, backgroundColor: r.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 grid grid-cols-2 gap-3 text-xs">
              <div className="rounded-xl bg-[#EAF4FC] p-3">
                <div className="text-[#0F2A47]/60">Reserva</div>
                <div className="mt-1 text-base font-semibold">4,2 meses</div>
              </div>
              <div className="rounded-xl bg-[#EAF4FC] p-3">
                <div className="text-[#0F2A47]/60">Dívidas</div>
                <div className="mt-1 text-base font-semibold">R$ 1.120</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Recursos */}
      <section id="recursos" className="border-t border-white/60 bg-white/30 backdrop-blur">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="max-w-2xl">
            <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: ORANGE }}>
              Recursos
            </span>
            <h2
              className="mt-3 text-3xl tracking-tight md:text-4xl"
              style={{ fontFamily: "'Fraunces', Georgia, serif" }}
            >
              Tudo que uma família precisa,<br />
              <em className="italic" style={{ color: ORANGE }}>nada que ela não precise.</em>
            </h2>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {highlights.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="rounded-2xl border border-white/70 bg-white/80 p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                <div
                  className="grid h-10 w-10 place-items-center rounded-xl text-white"
                  style={{ backgroundColor: ORANGE }}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div className="mt-4 text-base font-semibold">{title}</div>
                <p className="mt-2 text-sm text-[#0F2A47]/70">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Como funciona */}
      <section id="como-funciona" className="mx-auto max-w-6xl px-6 py-24">
        <div className="max-w-2xl">
          <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: ORANGE }}>
            Como funciona
          </span>
          <h2
            className="mt-3 text-3xl tracking-tight md:text-4xl"
            style={{ fontFamily: "'Fraunces', Georgia, serif" }}
          >
            Três passos até <em className="italic" style={{ color: ORANGE }}>respirar aliviado.</em>
          </h2>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {steps.map((s) => (
            <div key={s.n} className="rounded-2xl border border-white/70 bg-white/80 p-8 shadow-sm">
              <div className="text-4xl" style={{ fontFamily: "'Fraunces', Georgia, serif", color: ORANGE }}>
                {s.n}
              </div>
              <div className="mt-4 text-lg font-semibold">{s.title}</div>
              <p className="mt-2 text-sm text-[#0F2A47]/70">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Planos */}
      <section id="planos" className="mx-auto max-w-6xl px-6 pb-16">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: ORANGE }}>
            Plano
          </span>
          <h2
            className="mt-3 text-3xl tracking-tight md:text-4xl"
            style={{ fontFamily: "'Fraunces', Georgia, serif" }}
          >
            Um plano <em className="italic" style={{ color: ORANGE }}>simples e acessível.</em>
          </h2>
          <p className="mt-3 text-sm text-[#0F2A47]/70">
            Acesso completo ao Família no Azul por um ano inteiro.
          </p>
        </div>

        <div className="mx-auto mt-10 max-w-md">
          <div className="relative overflow-hidden rounded-3xl border border-white/70 bg-white/90 p-8 shadow-xl backdrop-blur">
            <div
              className="absolute right-6 top-6 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white"
              style={{ backgroundColor: ORANGE }}
            >
              Anual
            </div>
            <div className="text-sm font-semibold text-[#0F2A47]/70">Família no Azul</div>
            <div className="mt-4 flex items-baseline gap-1">
              <span className="text-5xl font-bold tracking-tight" style={{ fontFamily: "'Fraunces', Georgia, serif" }}>
                R$ 67,90
              </span>
              <span className="text-sm text-[#0F2A47]/60">/ano</span>
            </div>
            <p className="mt-1 text-xs text-[#0F2A47]/60">
              Menos de R$ 5,70 por mês
            </p>

            <ul className="mt-6 space-y-3 text-sm text-[#0F2A47]/80">
              {[
                "Painel de orçamento completo",
                "Método 50-30-20 automatizado",
                "Reserva de emergência e controle de dívidas",
                "Acesso por 12 meses",
                "Suporte por e-mail",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span
                    className="mt-0.5 grid h-5 w-5 flex-shrink-0 place-items-center rounded-full text-white"
                    style={{ backgroundColor: ORANGE }}
                  >
                    <svg viewBox="0 0 20 20" className="h-3 w-3" fill="currentColor">
                      <path d="M7.5 13.5L4 10l1.4-1.4 2.1 2.1 6-6L14.9 6z" />
                    </svg>
                  </span>
                  {item}
                </li>
              ))}
            </ul>

            <a
              href="https://pay.kiwify.com.br/4FFlpa2"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white shadow-md transition-all hover:-translate-y-0.5"
              style={{ backgroundColor: ORANGE }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = ORANGE_HOVER)}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = ORANGE)}
            >
              Assinar agora
              <ArrowRight className="h-4 w-4" />
            </a>
            <p className="mt-3 text-center text-xs text-[#0F2A47]/50">
              Pagamento seguro via Kiwify
            </p>
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="mx-auto max-w-6xl px-6 pb-24">

        <div
          className="overflow-hidden rounded-[2rem] p-10 text-white md:p-14"
          style={{ backgroundImage: `linear-gradient(135deg, ${NAVY} 0%, #1E4A78 100%)` }}
        >
          <div className="grid gap-8 md:grid-cols-[1.3fr_1fr] md:items-center">
            <div>
              <h2
                className="text-3xl leading-tight tracking-tight md:text-4xl"
                style={{ fontFamily: "'Fraunces', Georgia, serif" }}
              >
                Comece hoje.<br />
                <em className="italic" style={{ color: ORANGE }}>A família agradece amanhã.</em>
              </h2>
              <p className="mt-4 max-w-lg text-sm text-white/70">
                Um plano anual, sem surpresas. Cancele quando quiser.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <Link
                to="/auth"
                className="inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white shadow-md transition-colors"
                style={{ backgroundColor: ORANGE }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = ORANGE_HOVER)}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = ORANGE)}
              >
                Criar minha conta
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/auth"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/25 px-6 py-3 text-sm font-medium text-white hover:bg-white/10"
              >
                Já tenho conta
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/60">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-8 text-xs text-[#0F2A47]/60">
          <div>© {new Date().getFullYear()} Família no Azul. Feito com carinho.</div>
          <div className="flex items-center gap-6">
            <a href="#recursos" className="hover:text-[#0F2A47]">Recursos</a>
            <a href="#como-funciona" className="hover:text-[#0F2A47]">Como funciona</a>
            <Link to="/auth" className="hover:text-[#0F2A47]">Entrar</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
