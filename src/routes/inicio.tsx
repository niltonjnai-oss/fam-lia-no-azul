import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  PiggyBank,
  Wallet,
  TrendingUp,
  ShieldCheck,
  CreditCard,
  Check,
  Lock,
  BadgeCheck,
  Heart,
} from "lucide-react";
import logoHorizontal from "@/assets/familia_no_azul_horizontal.png.asset.json";
import step1Img from "@/assets/step-1-renda.jpg";
import step2Img from "@/assets/step-2-gastos.jpg";
import step3Img from "@/assets/step-3-respire.jpg";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const Route = createFileRoute("/inicio")({
  head: () => ({
    meta: [
      { title: "Família no Azul — Organize as finanças da sua família" },
      {
        name: "description",
        content:
          "O jeito mais leve de cuidar do dinheiro da família: método 50-30-20 automático, reserva de emergência e dívidas sob controle.",
      },
      { property: "og:title", content: "Família no Azul — Organize as finanças da sua família" },
      {
        property: "og:description",
        content:
          "O jeito mais leve de cuidar do dinheiro da família: método 50-30-20 automático, reserva de emergência e dívidas sob controle.",
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

const KIWIFY_URL = "https://pay.kiwify.com.br/4FFlpa2";

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

const pillars = [
  {
    value: "50-30-20",
    title: "Método comprovado",
    desc: "O método de orçamento mais conhecido do mundo, agora no automático pra sua família.",
  },
  {
    value: "3 min",
    title: "Por dia, só isso",
    desc: "O tempo que leva pra registrar os gastos e manter tudo no azul.",
  },
  {
    value: "100%",
    title: "Privado",
    desc: "Seus dados são só seus. A gente nunca vende nem compartilha suas informações.",
  },
];

const appScreens = [
  {
    title: "Painel do mês",
    desc: "Seu saldo e pra onde o dinheiro está indo, num relance.",
    img: step1Img,
  },
  {
    title: "Método 50-30-20",
    desc: "Sua renda dividida entre o essencial, o estilo de vida e o futuro.",
    img: step2Img,
  },
  {
    title: "Reserva de emergência",
    desc: "Acompanhe sua reserva crescer, mês a mês.",
    img: step3Img,
  },
];

const faqs = [
  {
    q: "Preciso entender de finanças ou montar planilha?",
    a: "Não. O Família no Azul foi feito pra quem nunca conseguiu manter uma planilha. Você registra os gastos em segundos e o app organiza o resto pelo método 50-30-20.",
  },
  {
    q: "Funciona no celular e no computador?",
    a: "Sim. É um app web: abre no navegador do celular, tablet ou computador, sem precisar instalar nada.",
  },
  {
    q: "Como recebo meu acesso depois de assinar?",
    a: "Assim que o pagamento é aprovado, você recebe um e-mail com o convite pra criar sua senha e entrar. Costuma chegar em poucos minutos.",
  },
  {
    q: "E se eu não gostar?",
    a: "Você tem 7 dias de garantia. Se achar que não é pra sua família, devolvemos 100% do valor, sem perguntas.",
  },
  {
    q: "Meus dados financeiros estão seguros?",
    a: "Sim. Cada família só enxerga os próprios dados, e a gente nunca vende nem compartilha suas informações. Tratamos tudo conforme a LGPD.",
  },
  {
    q: "Quais as formas de pagamento?",
    a: "O pagamento é processado com segurança pela Kiwify, que aceita cartão de crédito, Pix e boleto.",
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
          <a href="#app" className="hover:text-[#0F2A47]">Por dentro</a>
          <a href="#planos" className="hover:text-[#0F2A47]">Planos</a>
          <a href="#faq" className="hover:text-[#0F2A47]">FAQ</a>
        </nav>
        <div className="flex items-center gap-3">
          <Link
            to="/auth"
            className="hidden text-sm font-medium text-[#0F2A47] hover:opacity-70 sm:block"
          >
            Entrar
          </Link>
          <a
            href={KIWIFY_URL}
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

      {/* HERO */}
      <section className="mx-auto max-w-5xl px-6 pt-16 pb-24 text-center md:pt-24 md:pb-32">
        <span
          className="inline-flex items-center rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-white"
          style={{ backgroundColor: ORANGE }}
        >
          Orçamento familiar humano
        </span>
        <h1
          className="font-display mx-auto mt-8 max-w-4xl text-5xl leading-[1.02] tracking-tight md:text-7xl lg:text-[88px]"
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
            href={KIWIFY_URL}
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

        {/* Faixa de confiança */}
        <div className="mx-auto mt-6 flex max-w-2xl flex-col items-center justify-center gap-3 text-xs text-[#0F2A47]/70 sm:flex-row sm:gap-8">
          <div className="flex items-center gap-2">
            <Lock className="h-4 w-4" style={{ color: ORANGE }} />
            <span>Dados protegidos (LGPD)</span>
          </div>
          <div className="flex items-center gap-2">
            <BadgeCheck className="h-4 w-4" style={{ color: ORANGE }} />
            <span>Garantia de 7 dias</span>
          </div>
          <div className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" style={{ color: ORANGE }} />
            <span>Pagamento seguro via Kiwify</span>
          </div>
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

      {/* POR QUE FUNCIONA (substitui os "resultados") */}
      <section className="border-y border-white/60 bg-white/40 backdrop-blur">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="mx-auto max-w-2xl text-center">
            <span className="t-eyebrow">
              Por que funciona
            </span>
            <h2
              className="font-display mt-3 text-3xl tracking-tight md:text-4xl"
            >
              Simples de manter, <em className="italic" style={{ color: ORANGE }}>feito pra durar.</em>
            </h2>
          </div>
          <div className="mt-14 grid gap-10 md:grid-cols-3">
            {pillars.map((p) => (
              <div key={p.title} className="text-center">
                <div
                  className="font-display text-5xl font-semibold tracking-tight md:text-6xl" style={{ color: NAVY }}
                >
                  {p.value}
                </div>
                <div className="mt-3 text-sm font-semibold uppercase tracking-wider text-[#0F2A47]/70">
                  {p.title}
                </div>
                <p className="mx-auto mt-3 max-w-xs text-sm text-[#0F2A47]/70">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BENEFÍCIOS */}
      <section id="beneficios" className="mx-auto max-w-6xl px-6 py-28">
        <div className="mx-auto max-w-2xl text-center">
          <span className="t-eyebrow">
            Benefícios
          </span>
          <h2
            className="font-display mt-3 text-4xl tracking-tight md:text-5xl"
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

      {/* COMO FUNCIONA */}
      <section id="como-funciona" className="border-t border-white/60 bg-white/30 backdrop-blur">
        <div className="mx-auto max-w-6xl px-6 py-28">
          <div className="mx-auto max-w-2xl text-center">
            <span className="t-eyebrow">
              Como funciona
            </span>
            <h2
              className="font-display mt-3 text-4xl tracking-tight md:text-5xl"
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
                    className="font-display mt-4 text-3xl tracking-tight md:text-4xl"
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

      {/* POR DENTRO DO APP */}
      <section id="app" className="mx-auto max-w-6xl px-6 py-28">
        <div className="mx-auto max-w-2xl text-center">
          <span className="t-eyebrow">
            Por dentro do app
          </span>
          <h2
            className="font-display mt-3 text-4xl tracking-tight md:text-5xl"
          >
            Tudo o que importa, <em className="italic" style={{ color: ORANGE }}>numa tela só.</em>
          </h2>
        </div>
        <div className="mt-16 space-y-16">
          {appScreens.map((screen, i) => (
            <div
              key={screen.title}
              className={`grid gap-10 md:grid-cols-2 md:items-center ${
                i % 2 === 1 ? "md:[&>div:first-child]:order-2" : ""
              }`}
            >
              <div>
                <h3
                  className="font-display text-3xl tracking-tight md:text-4xl"
                >
                  {screen.title}
                </h3>
                <p className="mt-4 max-w-md text-base text-[#0F2A47]/70">{screen.desc}</p>
                <p className="mt-3 text-xs text-[#0F2A47]/50 italic">
                  [SUBIR PRINT REAL — {screen.title}]
                </p>
              </div>
              {/* Moldura de navegador sutil */}
              <div className="overflow-hidden rounded-2xl border border-white/70 bg-white shadow-lg">
                <div className="flex items-center gap-1.5 border-b border-[#0F2A47]/5 bg-[#F5F9FC] px-4 py-2.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#FF5F57]" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[#FEBC2E]" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[#28C840]" />
                </div>
                <img
                  src={screen.img}
                  alt={`Print — ${screen.title}`}
                  loading="lazy"
                  className="aspect-[4/3] w-full object-cover"
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CARTA DO FUNDADOR (substitui depoimentos até haver relatos reais) */}
      <section id="depoimentos" className="border-t border-white/60 bg-white/30 backdrop-blur">
        <div className="mx-auto max-w-6xl px-6 py-28">
          <div className="mx-auto max-w-2xl text-center">
            <span className="t-eyebrow">
              De família pra família
            </span>
            <h2
              className="font-display mt-3 text-4xl tracking-tight md:text-5xl"
            >
              Por que criamos o <em className="italic" style={{ color: ORANGE }}>Família no Azul.</em>
            </h2>
          </div>
          <div className="mx-auto mt-14 max-w-3xl rounded-[2rem] border border-white/70 bg-white/90 p-10 shadow-xl md:p-16">
            <Heart className="h-8 w-8" style={{ color: ORANGE }} />
            <p
              className="font-display mt-6 text-2xl leading-snug tracking-tight md:text-3xl"
            >
              A gente sabe como é terminar o mês sem saber pra onde o dinheiro foi. O Família no Azul
              nasceu pra tornar o controle financeiro leve, simples e possível — sem planilha
              complicada e sem julgamento. É o app que a gente queria ter tido em casa.
            </p>
            <div className="mt-8 text-sm italic text-[#0F2A47]/60">— Equipe Família no Azul</div>
          </div>
        </div>
      </section>

      {/* GARANTIA */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="mx-auto max-w-4xl rounded-[2rem] border border-white/70 bg-white/85 p-10 shadow-xl md:p-14">
          <div className="grid gap-8 md:grid-cols-[auto_1fr] md:items-center md:gap-10">
            <div
              className="mx-auto grid h-32 w-32 place-items-center rounded-full border-4 text-center leading-tight md:mx-0"
              style={{ borderColor: ORANGE, color: NAVY, fontFamily: "'Fraunces', Georgia, serif" }}
            >
              <div>
                <div className="text-3xl font-semibold" style={{ color: ORANGE }}>7</div>
                <div className="text-[10px] font-semibold uppercase tracking-widest">Dias de garantia</div>
              </div>
            </div>
            <div className="text-center md:text-left">
              <span className="t-eyebrow">
                Sem risco
              </span>
              <h2
                className="font-display mt-2 text-3xl tracking-tight md:text-4xl"
              >
                Experimente. Se não for pra sua família,{" "}
                <em className="italic" style={{ color: ORANGE }}>é por nossa conta.</em>
              </h2>
              <p className="mt-4 text-base text-[#0F2A47]/70">
                Você tem 7 dias pra testar o Família no Azul com calma. Se sentir que não é pra
                você, devolvemos 100% do valor — sem perguntas e sem burocracia.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* PLANOS */}
      <section id="planos" className="border-t border-white/60 bg-white/30 backdrop-blur">
        <div className="mx-auto max-w-6xl px-6 py-28">
          <div className="mx-auto max-w-2xl text-center">
            <span className="t-eyebrow">
              Plano
            </span>
            <h2
              className="font-display mt-3 text-4xl tracking-tight md:text-5xl"
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
                  className="font-display text-6xl font-bold tracking-tight"
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
                href={KIWIFY_URL}
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
              <p className="mt-3 text-center text-xs text-[#0F2A47]/60">
                Pagamento seguro via Kiwify · Seus dados protegidos conforme a LGPD · Cancele quando quiser
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-4xl px-6 py-28">
        <div className="mx-auto max-w-2xl text-center">
          <span className="t-eyebrow">
            Perguntas frequentes
          </span>
          <h2
            className="font-display mt-3 text-4xl tracking-tight md:text-5xl"
          >
            Ainda com dúvida? <em className="italic" style={{ color: ORANGE }}>A gente responde.</em>
          </h2>
        </div>
        <div className="mt-12 rounded-3xl border border-white/70 bg-white/85 p-4 shadow-sm md:p-8">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((f, i) => (
              <AccordionItem key={i} value={`faq-${i}`} className="border-[#0F2A47]/10">
                <AccordionTrigger className="text-left text-base font-semibold text-[#0F2A47] hover:no-underline md:text-lg">
                  {f.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm leading-relaxed text-[#0F2A47]/75 md:text-base">
                  {f.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* CTA final */}
      <section className="mx-auto max-w-6xl px-6 py-24">
        <div
          className="overflow-hidden rounded-[2rem] p-12 text-center text-white md:p-20"
          style={{ backgroundImage: `linear-gradient(135deg, ${NAVY} 0%, #1E4A78 100%)` }}
        >
          <h2
            className="font-display mx-auto max-w-3xl text-4xl leading-tight tracking-tight md:text-6xl"
          >
            Comece hoje.<br />
            <em className="italic" style={{ color: ORANGE }}>A família agradece amanhã.</em>
          </h2>
          <p className="mx-auto mt-6 max-w-lg text-base text-white/70">
            Um plano anual, sem surpresas. Cancele quando quiser.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <a
              href={KIWIFY_URL}
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
        <div className="mx-auto max-w-6xl px-6 py-10 text-xs text-[#0F2A47]/70">
          <div className="grid gap-6 md:grid-cols-2 md:items-start">
            <div className="space-y-1.5">
              <div>© {new Date().getFullYear()} Família no Azul. Feito com carinho.</div>
              <div>Família no Azul é uma marca do Grupo Romana.</div>
              <div>CNPJ 48.570.356/0001-97</div>
              <div>Contato: <a href="mailto:sac.familianoazul@educarbem.com.br" className="hover:text-[#0F2A47]">sac.familianoazul@educarbem.com.br</a></div>
            </div>
            <div className="flex flex-wrap gap-x-6 gap-y-2 md:justify-end">
              <a href="#beneficios" className="hover:text-[#0F2A47]">Benefícios</a>
              <a href="#planos" className="hover:text-[#0F2A47]">Planos</a>
              <a href="#faq" className="hover:text-[#0F2A47]">FAQ</a>
              <Link to="/termos" className="hover:text-[#0F2A47]">Termos de Uso</Link>
              <Link to="/privacidade" className="hover:text-[#0F2A47]">Política de Privacidade</Link>
              <Link to="/auth" className="hover:text-[#0F2A47]">Entrar</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
