import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  PiggyBank,
  Wallet,
  TrendingUp,
  ShieldCheck,
  CreditCard,
  Check,
  Star,
} from "lucide-react";
import logoHorizontal from "@/assets/familia_no_azul_horizontal.png.asset.json";
import step1Img from "@/assets/step-1-renda.jpg";
import step2Img from "@/assets/step-2-gastos.jpg";
import step3Img from "@/assets/step-3-respire.jpg";

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

const ORANGE = "#F97316";
const ORANGE_HOVER = "#EA580C";
const NAVY = "#0F2A47";

const benefits = [
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
  { n: "01", title: "Conte sua renda", desc: "Em 1 minuto, cadastre as entradas do mês.", img: step1Img },
  { n: "02", title: "Registre os gastos", desc: "Categorize cada saída com dois toques.", img: step2Img },
  { n: "03", title: "Respire fundo", desc: "O painel mostra o caminho — e o próximo passo.", img: step3Img },
];

const stats = [
  { value: "R$ 6.400", label: "economizados em média no primeiro ano" },
  { value: "87%", label: "das famílias saem do vermelho em 90 dias" },
  { value: "3x", label: "mais consciência sobre os próprios gastos" },
];

const testimonials = [
  {
    quote:
      "Em três meses parei de me sentir sufocada no fim do mês. O painel me mostrou onde o dinheiro estava indo — e finalmente consegui fazer minha reserva.",
    name: "Camila R.",
    role: "Mãe, professora — Recife",
  },
  {
    quote:
      "A gente já tinha tentado planilha, aplicativo caro, tudo. O Família no Azul foi o primeiro que meu marido também usou. Hoje conversamos sobre dinheiro sem brigar.",
    name: "Juliana e Marcos",
    role: "Casal com dois filhos — Curitiba",
  },
  {
    quote:
      "Quitei R$ 12 mil de dívidas em oito meses seguindo o método. Nunca mais volto para o cheque especial.",
    name: "Rafael S.",
    role: "Autônomo — Belo Horizonte",
  },
];

function LandingPage() {
  return (
    <div
      className="min-h-screen text-[#0F2A47] font-sans antialiased"
      style={{
        backgroundImage: "linear-gradient(180deg, #E6F2FB 0%, #D6EAF8 40%, #EAF4FC 100%)",
      }}
    >
      {/* Nav */}
      <header className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
        <Link to="/inicio" className="flex items-center">
          <img src={logoHorizontal.url} alt="Família no Azul" className="h-10 w-auto" />
        </Link>
        <nav className="hidden items-center gap-8 text-sm font-medium text-[#0F2A47]/70 md:flex">
          <a href="#beneficios" className="hover:text-[#0F2A47]">Benefícios</a>
          <a href="#como-funciona" className="hover:text-[#0F2A47]">Como funciona</a>
          <a href="#depoimentos" className="hover:text-[#0F2A47]">Depoimentos</a>
          <a href="#planos" className="hover:text-[#0F2A47]">Planos</a>
        </nav>
        <div className="flex items-center gap-3">
          <Link
            to="/auth"
            className="hidden text-sm font-medium text-[#0F2A47] hover:opacity-70 sm:block"
          >
            Entrar
          </Link>
          <a
            href="https://pay.kiwify.com.br/4FFlpa2"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors"
            style={{ backgroundColor: ORANGE }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = ORANGE_HOVER)}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = ORANGE)}
          >
            Assinar
          </a>
        </div>
      </header>

      {/* HERO — YNAB style: massive centered headline */}
      <section className="mx-auto max-w-5xl px-6 pt-16 pb-24 text-center md:pt-24 md:pb-32">
        <span
          className="inline-flex items-center rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-white"
          style={{ backgroundColor: ORANGE }}
        >
          Orçamento familiar humano
        </span>
        <h1
          className="mx-auto mt-8 max-w-4xl text-5xl leading-[1.02] tracking-tight md:text-7xl lg:text-[88px]"
          style={{ fontFamily: "'Fraunces', Georgia, serif" }}
        >
          A calma de saber{" "}
          <em className="font-normal italic" style={{ color: ORANGE }}>
            o seu azul.
          </em>
        </h1>
        <p className="mx-auto mt-8 max-w-2xl text-lg text-[#0F2A47]/70 md:text-xl">
          Além de contas e planilhas, existe um jeito mais leve de cuidar do dinheiro da família.
          Um painel que respeita seu tempo, sua renda e seus sonhos.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <a
            href="https://pay.kiwify.com.br/4FFlpa2"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full px-8 py-4 text-base font-semibold text-white shadow-md transition-all hover:-translate-y-0.5"
            style={{ backgroundColor: ORANGE }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = ORANGE_HOVER)}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = ORANGE)}
          >
            Começar agora
            <ArrowRight className="h-4 w-4" />
          </a>
          <a
            href="#como-funciona"
            className="inline-flex items-center gap-2 rounded-full border border-[#0F2A47]/15 bg-white/70 px-8 py-4 text-base font-medium text-[#0F2A47] hover:bg-white"
          >
            Como funciona
          </a>
        </div>
        <div className="mt-8 flex items-center justify-center gap-2 text-xs text-[#0F2A47]/60">
          <ShieldCheck className="h-4 w-4" />
          Seus dados ficam com você. Sem venda, sem propaganda.
        </div>

        {/* Painel mockup abaixo do hero */}
        <div className="relative mx-auto mt-16 max-w-3xl">
          <div className="absolute -inset-6 rounded-[2.5rem] bg-gradient-to-br from-white/60 to-[#B8DCF3]/60 blur-3xl" />
          <div className="relative overflow-hidden rounded-[2rem] border border-white/60 bg-white/95 p-8 text-left shadow-2xl backdrop-blur">
            <div className="flex items-center justify-between text-xs text-[#0F2A47]/60">
              <span>Novembro 2026</span>
              <span className="rounded-full bg-[#E8F3EA] px-2.5 py-0.5 text-[10px] font-semibold text-[#2F7A3E]">
                No azul
              </span>
            </div>
            <div className="mt-5">
              <div className="text-xs text-[#0F2A47]/60">Saldo do mês</div>
              <div className="mt-1 text-5xl font-semibold tracking-tight tabular-nums">R$ 2.480,00</div>
            </div>
            <div className="mt-8 space-y-4">
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
          </div>
        </div>
      </section>

      {/* STATS — YNAB style big numbers */}
      <section className="border-y border-white/60 bg-white/40 backdrop-blur">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: ORANGE }}>
              Resultados reais
            </span>
            <h2
              className="mt-3 text-3xl tracking-tight md:text-4xl"
              style={{ fontFamily: "'Fraunces', Georgia, serif" }}
            >
              Quem organiza, <em className="italic" style={{ color: ORANGE }}>vive diferente.</em>
            </h2>
          </div>
          <div className="mt-14 grid gap-10 md:grid-cols-3">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <div
                  className="text-6xl font-semibold tracking-tight md:text-7xl"
                  style={{ fontFamily: "'Fraunces', Georgia, serif", color: NAVY }}
                >
                  {s.value}
                </div>
                <p className="mx-auto mt-4 max-w-xs text-sm text-[#0F2A47]/70">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BENEFÍCIOS */}
      <section id="beneficios" className="mx-auto max-w-6xl px-6 py-28">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: ORANGE }}>
            Benefícios
          </span>
          <h2
            className="mt-3 text-4xl tracking-tight md:text-5xl"
            style={{ fontFamily: "'Fraunces', Georgia, serif" }}
          >
            Tudo que uma família precisa,<br />
            <em className="italic" style={{ color: ORANGE }}>nada que ela não precise.</em>
          </h2>
        </div>
        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="rounded-2xl border border-white/70 bg-white/80 p-7 shadow-sm transition-shadow hover:shadow-md"
            >
              <div
                className="grid h-12 w-12 place-items-center rounded-xl text-white"
                style={{ backgroundColor: ORANGE }}
              >
                <Icon className="h-5 w-5" />
              </div>
              <div className="mt-5 text-lg font-semibold">{title}</div>
              <p className="mt-2 text-sm leading-relaxed text-[#0F2A47]/70">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* COMO FUNCIONA — YNAB style: alternating rows */}
      <section id="como-funciona" className="border-t border-white/60 bg-white/30 backdrop-blur">
        <div className="mx-auto max-w-6xl px-6 py-28">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: ORANGE }}>
              Como funciona
            </span>
            <h2
              className="mt-3 text-4xl tracking-tight md:text-5xl"
              style={{ fontFamily: "'Fraunces', Georgia, serif" }}
            >
              Três passos até <em className="italic" style={{ color: ORANGE }}>respirar aliviado.</em>
            </h2>
          </div>
          <div className="mt-20 space-y-20">
            {steps.map((s, i) => (
              <div
                key={s.n}
                className={`grid gap-10 md:grid-cols-2 md:items-center ${
                  i % 2 === 1 ? "md:[&>div:first-child]:order-2" : ""
                }`}
              >
                <div>
                  <div
                    className="text-7xl leading-none"
                    style={{ fontFamily: "'Fraunces', Georgia, serif", color: ORANGE }}
                  >
                    {s.n}
                  </div>
                  <h3
                    className="mt-4 text-3xl tracking-tight md:text-4xl"
                    style={{ fontFamily: "'Fraunces', Georgia, serif" }}
                  >
                    {s.title}
                  </h3>
                  <p className="mt-4 max-w-md text-base text-[#0F2A47]/70">{s.desc}</p>
                </div>
                <div className="overflow-hidden rounded-3xl border border-white/70 bg-white/80 p-3 shadow-sm">
                  <img
                    src={s.img}
                    alt={s.title}
                    width={1024}
                    height={768}
                    loading="lazy"
                    className="aspect-[4/3] w-full rounded-2xl object-cover"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DEPOIMENTOS — YNAB style: destaque grande */}
      <section id="depoimentos" className="mx-auto max-w-6xl px-6 py-28">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: ORANGE }}>
            Depoimentos
          </span>
          <h2
            className="mt-3 text-4xl tracking-tight md:text-5xl"
            style={{ fontFamily: "'Fraunces', Georgia, serif" }}
          >
            Famílias que voltaram <em className="italic" style={{ color: ORANGE }}>para o azul.</em>
          </h2>
        </div>

        {/* Depoimento em destaque */}
        <div className="mx-auto mt-16 max-w-4xl rounded-[2rem] border border-white/70 bg-white/90 p-10 shadow-xl md:p-16">
          <div className="flex gap-1" style={{ color: ORANGE }}>
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="h-5 w-5 fill-current" />
            ))}
          </div>
          <blockquote
            className="mt-6 text-2xl leading-snug tracking-tight md:text-3xl"
            style={{ fontFamily: "'Fraunces', Georgia, serif" }}
          >
            "{testimonials[0].quote}"
          </blockquote>
          <div className="mt-8 flex items-center gap-4">
            <div
              className="grid h-12 w-12 place-items-center rounded-full text-white font-semibold"
              style={{ backgroundColor: NAVY }}
            >
              {testimonials[0].name.charAt(0)}
            </div>
            <div>
              <div className="font-semibold">{testimonials[0].name}</div>
              <div className="text-sm text-[#0F2A47]/60">{testimonials[0].role}</div>
            </div>
          </div>
        </div>

        {/* Grid secundário */}
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {testimonials.slice(1).map((t) => (
            <div
              key={t.name}
              className="rounded-2xl border border-white/70 bg-white/80 p-8 shadow-sm"
            >
              <div className="flex gap-1" style={{ color: ORANGE }}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-current" />
                ))}
              </div>
              <blockquote className="mt-4 text-lg leading-relaxed text-[#0F2A47]/85">
                "{t.quote}"
              </blockquote>
              <div className="mt-6 flex items-center gap-3">
                <div
                  className="grid h-10 w-10 place-items-center rounded-full text-white text-sm font-semibold"
                  style={{ backgroundColor: NAVY }}
                >
                  {t.name.charAt(0)}
                </div>
                <div>
                  <div className="text-sm font-semibold">{t.name}</div>
                  <div className="text-xs text-[#0F2A47]/60">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* PLANOS */}
      <section id="planos" className="border-t border-white/60 bg-white/30 backdrop-blur">
        <div className="mx-auto max-w-6xl px-6 py-28">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: ORANGE }}>
              Plano
            </span>
            <h2
              className="mt-3 text-4xl tracking-tight md:text-5xl"
              style={{ fontFamily: "'Fraunces', Georgia, serif" }}
            >
              Um plano <em className="italic" style={{ color: ORANGE }}>simples e acessível.</em>
            </h2>
            <p className="mt-4 text-base text-[#0F2A47]/70">
              Acesso completo ao Família no Azul por um ano inteiro.
            </p>
          </div>

          <div className="mx-auto mt-14 max-w-md">
            <div className="relative overflow-hidden rounded-3xl border border-white/70 bg-white/95 p-10 shadow-xl backdrop-blur">
              <div
                className="absolute right-6 top-6 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white"
                style={{ backgroundColor: ORANGE }}
              >
                Anual
              </div>
              <div className="text-sm font-semibold text-[#0F2A47]/70">Família no Azul</div>
              <div className="mt-4 flex items-baseline gap-1">
                <span
                  className="text-6xl font-bold tracking-tight"
                  style={{ fontFamily: "'Fraunces', Georgia, serif" }}
                >
                  R$ 67,90
                </span>
                <span className="text-sm text-[#0F2A47]/60">/ano</span>
              </div>
              <p className="mt-1 text-xs text-[#0F2A47]/60">Menos de R$ 5,70 por mês</p>

              <ul className="mt-8 space-y-3 text-sm text-[#0F2A47]/80">
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
                      <Check className="h-3 w-3" />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>

              <a
                href="https://pay.kiwify.com.br/4FFlpa2"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-4 text-base font-semibold text-white shadow-md transition-all hover:-translate-y-0.5"
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
        </div>
      </section>

      {/* CTA final */}
      <section className="mx-auto max-w-6xl px-6 py-24">
        <div
          className="overflow-hidden rounded-[2rem] p-12 text-center text-white md:p-20"
          style={{ backgroundImage: `linear-gradient(135deg, ${NAVY} 0%, #1E4A78 100%)` }}
        >
          <h2
            className="mx-auto max-w-3xl text-4xl leading-tight tracking-tight md:text-6xl"
            style={{ fontFamily: "'Fraunces', Georgia, serif" }}
          >
            Comece hoje.<br />
            <em className="italic" style={{ color: ORANGE }}>A família agradece amanhã.</em>
          </h2>
          <p className="mx-auto mt-6 max-w-lg text-base text-white/70">
            Um plano anual, sem surpresas. Cancele quando quiser.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <a
              href="https://pay.kiwify.com.br/4FFlpa2"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-full px-8 py-4 text-base font-semibold text-white shadow-md transition-colors"
              style={{ backgroundColor: ORANGE }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = ORANGE_HOVER)}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = ORANGE)}
            >
              Assinar por R$ 67,90/ano
              <ArrowRight className="h-4 w-4" />
            </a>
            <Link
              to="/auth"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/25 px-8 py-4 text-base font-medium text-white hover:bg-white/10"
            >
              Já tenho conta
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/60">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-8 text-xs text-[#0F2A47]/60">
          <div>© {new Date().getFullYear()} Família no Azul. Feito com carinho.</div>
          <div className="flex items-center gap-6">
            <a href="#beneficios" className="hover:text-[#0F2A47]">Benefícios</a>
            <a href="#como-funciona" className="hover:text-[#0F2A47]">Como funciona</a>
            <a href="#depoimentos" className="hover:text-[#0F2A47]">Depoimentos</a>
            <Link to="/auth" className="hover:text-[#0F2A47]">Entrar</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
