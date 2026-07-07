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
} from "lucide-react";
import logoHorizontal from "@/assets/familia_no_azul_horizontal.png.asset.json";
import heroPhoto from "@/assets/lp/img-01-hero.webp.asset.json";
import step1Photo from "@/assets/lp/img-02-step1.webp.asset.json";
import step2Photo from "@/assets/lp/img-03-step2.webp.asset.json";
import step3Photo from "@/assets/lp/img-04-step3.webp.asset.json";
import familiaLineart from "@/assets/lp/img-05-familia-lineart.png.asset.json";
import jantarPhoto from "@/assets/lp/img-06-jantar.webp.asset.json";
import ogImage from "@/assets/lp/img-07-og.webp.asset.json";
import { assetUrl } from "@/lib/asset-url";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const Route = createFileRoute("/inicio")({
  head: () => ({
    meta: [
      { title: "Família no Azul — Termine o mês sabendo pra onde foi cada real" },
      {
        name: "description",
        content:
          "Método 50-30-20 no automático, reserva de emergência e dívidas sob controle. 3 minutos por dia, sua família volta pro azul.",
      },
      { property: "og:title", content: "Família no Azul — Termine o mês sabendo pra onde foi cada real" },
      {
        property: "og:description",
        content:
          "Método 50-30-20 no automático, reserva de emergência e dívidas sob controle. 3 minutos por dia, sua família volta pro azul.",
      },
      { property: "og:type", content: "website" },
      { property: "og:image", content: assetUrl(ogImage) },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: assetUrl(ogImage) },
    ],
  }),
  component: LandingPage,
});

const ORANGE = "#F97316";
const ORANGE_HOVER = "#EA580C";
const NAVY = "#0F2A47";

const KIWIFY_URL = "https://pay.kiwify.com.br/4FFlpa2";

const CTA_PRIMARY = "Quero ver meu dinheiro no azul";
const CTA_ASSINAR = "Assinar por R$ 67,90/ano";
const logoHorizontalUrl = assetUrl(logoHorizontal);
const heroPhotoUrl = assetUrl(heroPhoto);
const familiaLineartUrl = assetUrl(familiaLineart);
const jantarPhotoUrl = assetUrl(jantarPhoto);

// Data dinâmica do mockup (pt-BR), ex.: "julho 2026"
const MES_ATUAL = new Date()
  .toLocaleDateString("pt-BR", { month: "long", year: "numeric" })
  .replace(/^./, (c) => c.toUpperCase());

const benefits = [
  {
    icon: Wallet,
    title: "Veja pra onde vai o dinheiro",
    desc: "Renda, gastos e saldo do mês numa tela só — sem planilha pra manter.",
  },
  {
    icon: TrendingUp,
    title: "Saiba quanto pode gastar sem culpa",
    desc: "O app divide sua renda automaticamente: essencial, vida e futuro. Você não decide no chute.",
  },
  {
    icon: PiggyBank,
    title: "Monte sua reserva sem sofrer",
    desc: "O app mostra quanto guardar por mês e você acompanha o valor crescer.",
  },
  {
    icon: CreditCard,
    title: "Saia das dívidas com um plano",
    desc: "Organize o que deve, defina a ordem de pagamento e veja quitar uma por uma.",
  },
];

const steps = [
  {
    n: "01",
    title: "Conte sua renda",
    desc: "Um minuto. Salário, bico, pensão: tudo que entra no mês.",
    image: assetUrl(step1Photo),
    alt: "Mãos de uma mulher registrando a renda mensal em um aplicativo de finanças no celular",
  },
  {
    n: "02",
    title: "Registre os gastos",
    desc: "Dois toques por gasto. Mercado, escola, aquele delivery de sexta (sem julgamento).",
    image: assetUrl(step2Photo),
    alt: "Mãe brasileira registrando um gasto de supermercado no celular durante as compras",
  },
  {
    n: "03",
    title: "Respire fundo",
    desc: "O painel mostra onde você está e qual o próximo passo. Só isso já muda o clima lá em casa.",
    image: assetUrl(step3Photo),
    alt: "Pai sorrindo aliviado enquanto olha para o painel financeiro no celular em casa",
  },
];

const pillars = [
  {
    value: "50-30-20",
    title: "Método comprovado",
    desc: "Divida sua renda entre necessidades, qualidade de vida e futuro. O app faz isso automaticamente.",
  },
  {
    value: "3 min",
    title: "Minutos por dia",
    desc: "Registrou o gasto, fechou o app e pronto. Organizar as finanças nunca foi tão simples.",
  },
  {
    value: "100%",
    title: "Privado",
    desc: "Somente você e sua família têm acesso às suas informações.",
  },
];

const appScreens = [
  {
    title: "Painel do mês",
    desc: "Saldo e destino de cada real, numa tela. Abriu, entendeu, fechou.",
    variant: "painel" as const,
  },
  {
    title: "Método 50-30-20",
    desc: "Suas três fatias, sempre atualizadas. Verde quando tá no azul, alerta quando precisa segurar.",
    variant: "metodo" as const,
  },
  {
    title: "Reserva de emergência",
    desc: "A barrinha que mais dá orgulho de ver crescer.",
    variant: "reserva" as const,
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
    q: "Quantas pessoas da família podem usar?",
    a: "A assinatura é da família: vocês acessam com a mesma conta no celular, tablet e computador. O orçamento é um só — que é justamente a ideia.",
  },
  {
    q: "A assinatura renova sozinha?",
    a: "Não tem pegadinha: você paga R$ 67,90 e tem 12 meses de acesso. Perto do fim, a gente te avisa por e-mail — você decide se continua.",
  },
  {
    q: "Como recebo meu acesso depois de assinar?",
    a: "Assim que o pagamento é aprovado, você recebe um e-mail com o convite pra criar sua senha e entrar. Costuma chegar em poucos minutos.",
  },
  {
    q: "E se eu não gostar?",
    a: "É pagamento único e você tem 7 dias de garantia. Se achar que não é pra sua família, devolvemos 100% do valor, sem perguntas.",
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

// TODO: substituir por prints reais do app quando disponíveis
function AppMock({ variant }: { variant: "painel" | "metodo" | "reserva" }) {
  if (variant === "painel") {
    return (
      <div className="aspect-[4/3] w-full bg-gradient-to-br from-[#F5F9FC] to-[#EAF4FC] p-6">
        <div className="flex items-center justify-between text-[10px] text-[#0F2A47]/60">
          <span>{MES_ATUAL}</span>
          <span className="rounded-full bg-[#E8F3EA] px-2 py-0.5 font-semibold text-[#2F7A3E]">
            No azul
          </span>
        </div>
        <div className="mt-3 text-[10px] text-[#0F2A47]/60">Saldo do mês</div>
        <div className="text-3xl font-semibold tracking-tight text-[#0F2A47] tabular-nums">
          R$ 2.480,00
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2">
          {[
            { l: "Essencial", v: "R$ 2.100", c: NAVY },
            { l: "Estilo de vida", v: "R$ 1.080", c: ORANGE },
            { l: "Futuro", v: "R$ 990", c: "#2F7A3E" },
          ].map((c) => (
            <div key={c.l} className="rounded-lg bg-white/80 p-2">
              <div className="text-[9px] text-[#0F2A47]/60">{c.l}</div>
              <div className="text-xs font-semibold tabular-nums" style={{ color: c.c }}>
                {c.v}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  if (variant === "metodo") {
    return (
      <div className="aspect-[4/3] w-full bg-gradient-to-br from-[#F5F9FC] to-[#EAF4FC] p-6">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-[#0F2A47]/60">
          Método 50-30-20
        </div>
        <div className="mt-4 space-y-4">
          {[
            { label: "Essencial", pct: 46, meta: 50, color: NAVY, ok: true },
            { label: "Estilo de vida", pct: 32, meta: 30, color: ORANGE, ok: false },
            { label: "Reserva & Dívidas", pct: 22, meta: 20, color: "#2F7A3E", ok: true },
          ].map((r) => (
            <div key={r.label}>
              <div className="mb-1 flex justify-between text-[11px]">
                <span className="text-[#0F2A47]/70">{r.label}</span>
                <span className="font-medium tabular-nums text-[#0F2A47]">
                  {r.pct}% <span className="text-[#0F2A47]/40">/ {r.meta}%</span>
                </span>
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
    );
  }
  // reserva
  return (
    <div className="aspect-[4/3] w-full bg-gradient-to-br from-[#F5F9FC] to-[#EAF4FC] p-6">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-[#0F2A47]/60">
        Reserva de emergência
      </div>
      <div className="mt-3 flex items-baseline justify-between">
        <div className="text-3xl font-semibold tracking-tight text-[#0F2A47] tabular-nums">
          R$ 4.320
        </div>
        <div className="text-xs text-[#0F2A47]/60">meta R$ 12.000</div>
      </div>
      <div className="mt-3 h-3 overflow-hidden rounded-full bg-[#0F2A47]/5">
        <div className="h-full rounded-full bg-[#2F7A3E]" style={{ width: "36%" }} />
      </div>
      <div className="mt-2 text-[11px] font-semibold text-[#2F7A3E]">36% da meta</div>
      <div className="mt-5 grid grid-cols-6 items-end gap-1.5">
        {[20, 28, 32, 30, 34, 36].map((h, i) => (
          <div
            key={i}
            className="rounded-t bg-[#2F7A3E]/70"
            style={{ height: `${h * 1.6}px` }}
          />
        ))}
      </div>
      <div className="mt-1 text-[9px] text-[#0F2A47]/50">6 meses de progresso</div>
    </div>
  );
}

function LandingPage() {
  return (
    <div
      className="min-h-screen text-[#0F2A47] font-sans antialiased motion-safe:[&_section]:animate-fade-in"
      style={{
        backgroundImage: "linear-gradient(180deg, #E6F2FB 0%, #D6EAF8 40%, #EAF4FC 100%)",
      }}
    >
      {/* Nav */}
      <header className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
        <Link to="/inicio" className="flex items-center">
          <img src={logoHorizontalUrl} alt="Família no Azul" className="h-10 w-auto" />
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
            className="min-h-[48px] rounded-full px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors inline-flex items-center"
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
        <span className="inline-flex items-center rounded-full border border-[#0F2A47]/15 bg-white/70 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-[#0F2A47]">
          Pra famílias de verdade, com boleto de verdade
        </span>
        <h1 className="font-display mx-auto mt-8 max-w-4xl text-4xl leading-[1.05] tracking-tight md:text-6xl lg:text-7xl">
          Termine o mês sabendo pra onde foi cada real.
          <br />
          <em className="font-normal italic" style={{ color: ORANGE }}>
            Sem planilha. Sem briga. Sem susto.
          </em>
        </h1>
        <p className="mx-auto mt-8 max-w-2xl text-base text-[#0F2A47]/75 md:text-xl">
          Todo dia 28 bate aquela sensação:{" "}
          <em className="italic font-bold text-orange-500 not-italic-quotes">"o dinheiro entrou... e sumiu".</em>{" "}
          O Família no Azul divide sua renda no método 50-30-20 automaticamente -{" "}
          <em className="italic font-bold text-orange-500">3 minutos por dia e sua família volta pro azul.</em>
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <a
            href={KIWIFY_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-[48px] items-center gap-2 rounded-full px-8 py-4 text-base font-semibold text-white shadow-md transition-all hover:-translate-y-0.5"
            style={{ backgroundColor: ORANGE }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = ORANGE_HOVER)}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = ORANGE)}
          >
            {CTA_PRIMARY}
            <ArrowRight className="h-4 w-4" />
          </a>
          <a
            href="#como-funciona"
            className="inline-flex min-h-[48px] items-center gap-2 rounded-full border border-[#0F2A47]/15 bg-white/70 px-8 py-4 text-base font-medium text-[#0F2A47] hover:bg-white"
          >
            Me mostra como funciona
          </a>
        </div>

        {/* Faixa de confiança */}
        <div className="mx-auto mt-6 flex max-w-2xl flex-col items-center justify-center gap-3 text-xs text-[#0F2A47]/70 sm:flex-row sm:gap-8">
          <div className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-[#0F2A47]/60" />
            <span>Dados protegidos (LGPD)</span>
          </div>
          <div className="flex items-center gap-2">
            <BadgeCheck className="h-4 w-4 text-[#0F2A47]/60" />
            <span>Garantia de 7 dias</span>
          </div>
          <div className="flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-[#0F2A47]/60" />
            <span>Pagamento seguro via Kiwify</span>
          </div>
        </div>

        {/* Painel mockup abaixo do hero, com foto ambiente atrás/à direita (desktop) */}
        <div className="relative mx-auto mt-16 max-w-3xl">
          {/* Foto do casal — só desktop, com overlay do gradiente azul */}
          <div className="pointer-events-none absolute -right-40 -top-10 hidden h-[520px] w-[560px] overflow-hidden rounded-[2rem] md:block lg:-right-56">
            <img
              src={heroPhotoUrl}
              alt="Casal brasileiro em casa, aliviado, olhando junto para o celular"
              loading="eager"
              width={1600}
              height={1200}
              className="h-full w-full object-cover"
            />
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(135deg, rgba(230,242,251,0.65) 0%, rgba(184,220,243,0.75) 60%, rgba(15,42,71,0.35) 100%)",
              }}
            />
          </div>
          <div className="absolute -inset-6 rounded-[2.5rem] bg-gradient-to-br from-white/60 to-[#B8DCF3]/60 blur-3xl" />
          <div className="relative overflow-hidden rounded-[2rem] border border-white/60 bg-white/95 p-8 text-left shadow-2xl backdrop-blur">
            <div className="flex items-center justify-between text-xs text-[#0F2A47]/60">
              <span>{MES_ATUAL}</span>
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
                { label: "Estilo de vida", pct: 24, color: "#5B7C99" },
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

      {/* POR QUE FUNCIONA */}
      <section className="border-y border-white/60 bg-white/40 backdrop-blur">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="mx-auto max-w-2xl text-center">
            <span className="t-eyebrow">Por que funciona</span>
            <h2 className="font-display mt-3 text-3xl tracking-tight md:text-4xl">
              Funciona, <em className="italic text-orange-500">e não dá trabalho.</em>
            </h2>
          </div>
          <div className="mt-14 grid gap-10 md:grid-cols-3">
            {pillars.map((p) => (
              <div key={p.title} className="text-center">
                <div
                  className="font-display text-5xl font-semibold tracking-tight md:text-6xl"
                  style={{ color: NAVY }}
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
          <span className="t-eyebrow">Benefícios</span>
          <h2 className="font-display mt-3 text-4xl tracking-tight md:text-5xl">
            Quatro coisas que o App Família no Azul <span className="italic text-orange-500">resolve pra você.</span>
          </h2>
        </div>
        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="rounded-2xl border border-white/70 bg-white/80 p-7 shadow-sm transition-shadow hover:shadow-md"
            >
              <div
                className="grid h-12 w-12 place-items-center rounded-xl text-[#0F2A47]"
                style={{ backgroundColor: "#E6F2FB" }}
              >
                <Icon className="h-5 w-5" />
              </div>
              <div className="mt-5 text-lg font-semibold">{title}</div>
              <p className="mt-2 text-sm leading-relaxed text-[#0F2A47]/70">{desc}</p>
            </div>
          ))}
        </div>
        <div className="mt-12 text-center">
          <a
            href={KIWIFY_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-[48px] items-center gap-2 rounded-full px-8 py-4 text-base font-semibold text-white shadow-md transition-all hover:-translate-y-0.5"
            style={{ backgroundColor: ORANGE }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = ORANGE_HOVER)}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = ORANGE)}
          >
            {CTA_PRIMARY}
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </section>

      {/* COMO FUNCIONA */}
      <section id="como-funciona" className="border-t border-white/60 bg-white/30 backdrop-blur">
        <div className="mx-auto max-w-6xl px-6 py-28">
          <div className="mx-auto max-w-2xl text-center">
            <span className="t-eyebrow">Como funciona</span>
            <h2 className="font-display mt-3 text-4xl tracking-tight md:text-5xl">
              Três passos até <em className="italic" style={{ color: ORANGE }}>respirar aliviado.</em>
            </h2>
          </div>
          <div className="mt-20 grid gap-8 md:grid-cols-3">
            {steps.map((s) => (
              <div
                key={s.n}
                className="overflow-hidden rounded-3xl border border-white/70 bg-white/80 shadow-sm"
              >
                <div className="aspect-[4/3] overflow-hidden border-b border-white/70">
                  <img
                    src={s.image}
                    alt={s.alt}
                    loading="lazy"
                    width={1280}
                    height={960}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="p-8">
                  <div className="font-display text-6xl leading-none text-[#0F2A47]/20">
                    {s.n}
                  </div>
                  <h3 className="font-display mt-4 text-2xl tracking-tight">{s.title}</h3>
                  <p className="mt-3 text-sm text-[#0F2A47]/70">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* POR DENTRO DO APP */}
      <section id="app" className="mx-auto max-w-6xl px-6 py-28">
        <div className="mx-auto max-w-2xl text-center">
          <span className="t-eyebrow">Por dentro do app</span>
          <h2 className="font-display mt-3 text-4xl tracking-tight md:text-5xl">
            Tudo o que importa, <em className="italic" style={{ color: ORANGE }}>numa tela só.</em>
          </h2>
        </div>
        <div className="mt-16 space-y-16">
          {/* TODO: substituir por prints reais do app */}
          {appScreens.map((screen, i) => (
            <div
              key={screen.title}
              className={`grid gap-10 md:grid-cols-2 md:items-center ${
                i % 2 === 1 ? "md:[&>div:first-child]:order-2" : ""
              }`}
            >
              <div>
                <h3 className="font-display text-3xl tracking-tight md:text-4xl">
                  {screen.title}
                </h3>
                <p className="mt-4 max-w-md text-base text-[#0F2A47]/70">{screen.desc}</p>
              </div>
              {/* Moldura de navegador */}
              <div className="overflow-hidden rounded-2xl border border-white/70 bg-white shadow-lg">
                <div className="flex items-center gap-1.5 border-b border-[#0F2A47]/5 bg-[#F5F9FC] px-4 py-2.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#FF5F57]" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[#FEBC2E]" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[#28C840]" />
                </div>
                <AppMock variant={screen.variant} />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* NOSSA HISTÓRIA */}
      <section id="historia" className="border-t border-white/60 bg-white/30 backdrop-blur">
        <div className="mx-auto max-w-6xl px-6 py-28">
          <div className="mx-auto max-w-2xl text-center">
            <span className="t-eyebrow">De família pra família</span>
            <h2 className="font-display mt-3 text-4xl tracking-tight md:text-5xl">
              Por que criamos o <em className="italic text-[#0F2A47]/80">Família no Azul.</em>
            </h2>
          </div>
          <div className="mx-auto mt-14 max-w-3xl rounded-[2rem] border border-white/70 bg-white/90 p-10 shadow-xl md:p-16">
            <div className="grid gap-8 md:grid-cols-[1fr_auto] md:items-start md:gap-10">
              <div className="order-2 md:order-1">
                <p className="font-display text-2xl leading-snug tracking-tight md:text-3xl">
                  A gente sabe como é terminar o mês sem saber pra onde o dinheiro foi. Já passamos pelo
                  caderninho, pela planilha que durou três semanas, pelo aplicativo complicado demais.
                  O Família no Azul é o app que a gente queria ter tido em casa: leve, simples e sem
                  julgamento.
                </p>
                <div className="mt-8 text-sm italic text-[#0F2A47]/60">
                  — Equipe Família no Azul, Grupo Romana
                </div>
              </div>
              <div className="order-1 flex justify-center md:order-2 md:justify-end">
                <img
                  src={familiaLineartUrl}
                  alt="Ilustração em traço fino de uma família de mãos dadas com um coração acima"
                  loading="lazy"
                  width={800}
                  height={800}
                  className="w-full max-w-[160px] opacity-90 md:max-w-[220px]"
                />
              </div>
            </div>
          </div>
          {/* Bloco de depoimentos reais — ativar quando houver relatos verificados
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[{nome:"", cidade:"", texto:"", estrelas:5}].map((d) => (
              <div key={d.nome} className="rounded-2xl border border-white/70 bg-white/80 p-6 shadow-sm">
                ...avatar, nome, cidade, estrelas, texto...
              </div>
            ))}
          </div>
          */}
        </div>
      </section>

      {/* GARANTIA */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="mx-auto max-w-4xl rounded-[2rem] border border-white/70 bg-white/85 p-10 shadow-xl md:p-14">
          <div className="grid gap-8 md:grid-cols-[auto_1fr] md:items-center md:gap-10">
            <div
              className="mx-auto grid h-32 w-32 place-items-center rounded-full border-4 text-center leading-tight md:mx-0"
              style={{ borderColor: NAVY, color: NAVY, fontFamily: "'Fraunces', Georgia, serif" }}
            >
              <div>
                <div className="text-4xl font-semibold">7</div>
                <div className="text-[10px] font-semibold uppercase tracking-widest">Dias de garantia</div>
              </div>
            </div>
            <div className="text-center md:text-left">
              <span className="t-eyebrow">Sem risco</span>
              <h2 className="font-display mt-2 text-3xl tracking-tight md:text-4xl">
                Teste por 7 dias. Se não for pra sua família,{" "}
                <em className="italic" style={{ color: ORANGE }}>é por nossa conta.</em>
              </h2>
              <p className="mt-4 text-base text-[#0F2A47]/70">
                Entre, cadastre seu mês, veja o painel funcionando. Se em 7 dias você sentir que
                não é pra você, devolvemos 100% do valor. Sem perguntas, sem formulário chato, sem
                "aguarde 15 dias úteis".
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* PLANOS */}
      <section id="planos" className="border-t border-white/60 bg-white/30 backdrop-blur">
        <div className="mx-auto max-w-6xl px-6 py-28">
          <div className="mx-auto max-w-2xl text-center">
            <span className="t-eyebrow">Plano</span>
            <h2 className="font-display mt-3 text-4xl tracking-tight md:text-5xl">
              Um ano inteiro no azul <em className="italic text-[#0F2A47]/80">por menos que uma pizza.</em>
            </h2>
            <p className="mt-4 text-base text-[#0F2A47]/70">
              R$ 67,90 pelo ano todo — dá R$ 5,66 por mês. Sem mensalidade, sem surpresa na fatura.
            </p>
          </div>

          <div className="mx-auto mt-14 max-w-md">
            <div className="relative overflow-hidden rounded-3xl border-2 border-[#F97316]/30 bg-white/95 p-10 shadow-xl backdrop-blur">
              <div
                className="absolute right-6 top-6 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white"
                style={{ backgroundColor: ORANGE }}
              >
                Anual
              </div>
              <div className="text-sm font-semibold text-[#0F2A47]/70">Família no Azul</div>
              <div className="mt-4 flex items-baseline gap-1">
                <span
                  className="font-display text-6xl font-bold tracking-tight tabular-nums"
                  style={{ color: ORANGE }}
                >
                  R$ 67,90
                </span>
                <span className="text-sm text-[#0F2A47]/60">/ano</span>
              </div>
              <p className="mt-1 text-xs text-[#0F2A47]/60 tabular-nums">Dá R$ 5,66 por mês</p>

              <ul className="mt-8 space-y-3 text-sm text-[#0F2A47]/80">
                {[
                  "Painel de orçamento completo, no celular e no computador",
                  "Método 50-30-20 dividindo sua renda no automático",
                  "Reserva de emergência e plano de quitação de dívidas",
                  "12 meses de acesso — paga uma vez, usa o ano inteiro",
                  "Suporte por e-mail que responde gente como gente",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="mt-0.5 grid h-5 w-5 flex-shrink-0 place-items-center rounded-full bg-[#E8F3EA] text-[#2F7A3E]">
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
                className="mt-8 inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-full px-6 py-4 text-base font-semibold text-white shadow-md transition-all hover:-translate-y-0.5"
                style={{ backgroundColor: ORANGE }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = ORANGE_HOVER)}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = ORANGE)}
              >
                {CTA_ASSINAR}
                <ArrowRight className="h-4 w-4" />
              </a>
              <p className="mt-3 text-center text-xs text-[#0F2A47]/60">
                Pagamento único e seguro via Kiwify · 7 dias de garantia total · Sem renovação
                automática surpresa
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-4xl px-6 py-28">
        <div className="mx-auto max-w-2xl text-center">
          <span className="t-eyebrow">Perguntas frequentes</span>
          <h2 className="font-display mt-3 text-4xl tracking-tight md:text-5xl">
            Ainda com dúvida? <em className="italic text-[#0F2A47]/80">A gente responde.</em>
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
      <section className="mx-auto max-w-6xl px-6 pb-24 pt-4 md:pb-32">
        <div
          className="relative overflow-hidden rounded-[2rem] p-12 text-center text-white md:p-20"
          style={{ backgroundColor: NAVY }}
        >
          {/* Foto de fundo */}
          <img
            src={jantarPhotoUrl}
            alt="Família brasileira jantando junto em casa, sorrindo à luz do fim de tarde"
            loading="lazy"
            width={1920}
            height={1088}
            className="pointer-events-none absolute inset-0 h-full w-full object-cover"
            style={{ objectPosition: "70% center" }}
          />
          {/* Overlay navy para manter contraste AA */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background: `linear-gradient(135deg, rgba(15,42,71,0.92) 0%, rgba(30,74,120,0.78) 60%, rgba(15,42,71,0.55) 100%)`,
            }}
          />
          <div className="relative">
            <h2 className="font-display mx-auto max-w-3xl text-4xl leading-tight tracking-tight md:text-6xl">
              Este mês <em className="italic" style={{ color: ORANGE }}>ainda dá tempo.</em>
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-base text-white/85">
              Cadastre a renda hoje, registre os gastos da semana e chegue no dia 30 sabendo — talvez
              pela primeira vez — pra onde foi cada real.
            </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <a
              href={KIWIFY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-full px-8 py-4 text-base font-semibold text-white shadow-md transition-colors"
              style={{ backgroundColor: ORANGE }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = ORANGE_HOVER)}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = ORANGE)}
            >
              Começar agora por R$ 67,90/ano
              <ArrowRight className="h-4 w-4" />
            </a>
            <Link
              to="/auth"
              className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-full border border-white/25 px-8 py-4 text-base font-medium text-white hover:bg-white/10"
            >
              Já tenho conta
            </Link>
          </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/60 pb-24 md:pb-10">
        <div className="mx-auto max-w-6xl px-6 py-10 text-xs text-[#0F2A47]/70">
          <div className="grid gap-6 md:grid-cols-2 md:items-start">
            <div className="space-y-1.5">
              <div>© {new Date().getFullYear()} Família no Azul. Feito com carinho.</div>
              <div>Família no Azul é uma marca do Grupo Romana.</div>
              <div>CNPJ 48.570.356/0001-97</div>
              <div>
                Contato:{" "}
                <a
                  href="mailto:sac.familianoazul@educarbem.com.br"
                  className="hover:text-[#0F2A47]"
                >
                  sac.familianoazul@educarbem.com.br
                </a>
              </div>
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

      {/* Sticky CTA (mobile only) */}
      <div
        className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/10 px-4 py-3 shadow-2xl md:hidden"
        style={{ backgroundColor: NAVY }}
      >
        <a
          href={KIWIFY_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white shadow-md"
          style={{ backgroundColor: ORANGE }}
        >
          Começar agora — R$ 67,90/ano
          <ArrowRight className="h-4 w-4" />
        </a>
      </div>
    </div>
  );
}
