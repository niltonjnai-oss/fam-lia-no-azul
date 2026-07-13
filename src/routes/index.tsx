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
  Users,
  BellRing,
} from "lucide-react";
import logoHorizontal from "@/assets/familia_no_azul_horizontal.png.asset.json";
import heroPhoto from "@/assets/lp/foto_banner.jpg.asset.json";
import step1Photo from "@/assets/lp/img-03-step2.jpg.asset.json";
import step2Photo from "@/assets/lp/img-02-step1.jpg.asset.json";
import step3Photo from "@/assets/lp/img-04-step3.jpg.asset.json";
import familiaLineart from "@/assets/lp/img-05-familia.png.asset.json";
import jantarPhoto from "@/assets/lp/img-06-jantar.webp.asset.json";
import ogImage from "@/assets/lp/img-07-og.webp.asset.json";
import seloGarantia from "@/assets/lp/selo-garantia.png.asset.json";
import { assetUrl } from "@/lib/asset-url";
import { useLucideDrawerAnimation } from "@/components/ui/lucide-icon-drawer";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Família no Azul · Termine o mês sabendo pra onde foi cada real" },
      {
        name: "description",
        content:
          "Método 50-30-20 no automático, reserva de emergência e dívidas sob controle. 3 minutos por dia, sua família volta pro azul.",
      },
      { property: "og:title", content: "Família no Azul · Termine o mês sabendo pra onde foi cada real" },
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

const benefits = [
  {
    icon: Wallet,
    title: "Veja pra onde vai o dinheiro",
    desc: "Renda, gastos e saldo do mês numa tela só - sem planilha pra manter.",
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
    desc: "Descubra o custo real de cada dívida, saiba qual pagar primeiro e chegue preparado na negociação.",
  },
  {
    icon: Users,
    title: "Vocês dois no mesmo time",
    desc: "Convide seu cônjuge: cada um com sua conta, os dois vendo o mesmo orçamento. Sem gasto escondido, sem briga no fim do mês.",
  },
  {
    icon: BellRing,
    title: "Nunca mais esqueça um boleto",
    desc: "Cadastre suas contas fixas e receba um aviso por e-mail 2 dias antes e no dia do vencimento.",
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
    desc: "O painel mostra onde você está e qual o próximo passo — e o casal acompanha tudo junto. Só isso já muda o clima lá em casa.",
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
    image: "/lp/app/painel.png",
    alt: "Tela do Painel do mês do app Família no Azul, mostrando o saldo do mês e a divisão entre Essencial, Estilo de vida e Futuro.",
  },
  {
    title: "Método 50-30-20",
    desc: "Suas três fatias, sempre atualizadas. Verde quando tá no azul, alerta quando precisa segurar.",
    image: "/lp/app/metodo.png",
    alt: "Tela do Método 50-30-20 do app Família no Azul, com três barras de progresso: Essencial, Estilo de vida e Reserva & Dívidas.",
  },
  {
    title: "Reserva de emergência",
    desc: "A barrinha que mais dá orgulho de ver crescer.",
    image: "/lp/app/reserva.png",
    alt: "Tela da Reserva de emergência do app Família no Azul, mostrando R$ 4.320 de R$ 12.000 e o progresso ao longo dos meses.",
  },
  {
    title: "Modo Casal",
    desc: "Você e seu cônjuge no mesmo orçamento, cada um com sua conta. Os dois registram, os dois enxergam tudo — nada de gasto escondido.",
    image: "/lp/app/casal.png",
    alt: "Tela do Modo Casal do app Família no Azul, com os avatares de Ana e João no mesmo orçamento e os lançamentos de cada um.",
  },
];

const faqs = [
  {
    q: "Preciso entender de finanças ou montar planilha?",
    a: "Não. O Família no Azul foi feito pra quem nunca conseguiu manter uma planilha. Você registra os gastos em segundos e o app organiza o resto pelo método 50-30-20.",
  },
  {
    q: "Funciona no celular e no computador?",
    a: "Sim — celular, tablet e computador, Android e iPhone. E você pode instalar como aplicativo direto do navegador (sem loja de apps): ele fica com ícone na tela inicial e abre em 1 toque, sempre atualizado.",
  },
  {
    q: "Quantas pessoas da família podem usar?",
    a: "Duas: você e seu cônjuge, cada um com sua própria conta e senha — é só convidar pelo app. Os dois veem e registram no mesmo orçamento, de qualquer aparelho. Organizar o dinheiro a dois é justamente a ideia.",
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
    a: "Sim. O app apenas registra o que você digita — não conecta na sua conta bancária e nunca movimenta dinheiro (no máximo, você importa um arquivo de extrato, se quiser). Cada família só enxerga os próprios dados, e a gente nunca vende nem compartilha suas informações. Tratamos tudo conforme a LGPD.",
  },
  {
    q: "Quais as formas de pagamento?",
    a: "O pagamento é processado com segurança pela Kiwify, que aceita cartão de crédito, Pix e boleto.",
  },
];

function LandingPage() {
  const beneficiosDrawerRef = useLucideDrawerAnimation<HTMLDivElement>();
  return (

    <div
      className="min-h-screen text-[#0F2A47] font-sans antialiased motion-safe:[&_section]:animate-fade-in"
      style={{
        backgroundImage: "linear-gradient(180deg, #E6F2FB 0%, #D6EAF8 40%, #EAF4FC 100%)",
      }}
    >
      {/* Nav */}
      <header className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
        <Link to="/" className="flex items-center">
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
          <a
            href="#planos"
            className="hidden text-sm font-medium text-[#0F2A47] hover:opacity-70 sm:block"
          >
            Assinar
          </a>
          <Link
            to="/auth"
            className="min-h-[48px] rounded-full px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors inline-flex items-center"
            style={{ backgroundColor: ORANGE }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = ORANGE_HOVER)}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = ORANGE)}
          >
            Entrar
          </Link>
        </div>
      </header>

      {/* HERO */}
      <section className="mx-auto max-w-5xl px-6 pt-3 pb-20 text-center md:pt-12 md:pb-28">
        <h1 className="font-display mx-auto mt-1 max-w-4xl text-4xl leading-[1.05] tracking-tight md:mt-4 md:text-6xl lg:text-7xl">
          Termine o mês sabendo pra onde foi cada real.
          <br />
          <em className="font-normal italic" style={{ color: ORANGE }}>
            Sem planilha. Sem briga. Sem susto.
          </em>
        </h1>
        <p className="mx-auto mt-8 max-w-2xl text-base text-[#0F2A47]/75 md:text-xl">
          Todo dia 28 bate aquela sensação:{" "}
          <em className="font-display text-[1.2em] italic font-bold" style={{ color: "#1d69ad" }}>"o dinheiro entrou... e sumiu".</em>{" "}
          O Família no Azul divide sua renda no método 50-30-20 automaticamente -{" "}
          <em className="font-display text-[1.2em] italic font-bold" style={{ color: "#1d69ad" }}>3 minutos por dia e sua família volta pro azul.</em>
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <a
            href="#planos"
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
        <div className="mx-auto mt-6 flex max-w-2xl flex-row flex-nowrap items-center justify-center gap-2 text-[10px] text-[#0F2A47]/70 sm:gap-8 sm:text-xs">
          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
            <Lock className="h-3.5 w-3.5 shrink-0 text-[#0F2A47]/60 sm:h-4 sm:w-4" />
            <span className="whitespace-nowrap">Dados protegidos</span>
          </div>
          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
            <BadgeCheck className="h-3.5 w-3.5 shrink-0 text-[#0F2A47]/60 sm:h-4 sm:w-4" />
            <span className="whitespace-nowrap">Garantia de 7 dias</span>
          </div>
          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
            <CreditCard className="h-3.5 w-3.5 shrink-0 text-[#0F2A47]/60 sm:h-4 sm:w-4" />
            <span className="whitespace-nowrap">Pagamento seguro</span>
          </div>
        </div>

        {/* Foto ambiente + app no celular lado a lado (desktop) / empilhados (mobile) */}
        <div className="mx-auto mt-10 md:mt-16 grid max-w-6xl gap-8 md:grid-cols-2 md:items-center md:gap-10">
          {/* Foto da família */}
          <div className="relative overflow-hidden rounded-[2rem] border border-white/60 shadow-2xl">
            <img
              src={heroPhotoUrl}
              alt="Família brasileira em casa olhando junto para o celular, aliviada"
              loading="eager"
              width={1600}
              height={900}
              className="h-full w-full object-cover"
            />
          </div>

          {/* App no notebook e no celular */}
          <div className="flex justify-center">
            <img
              src="/lp/app/hero.png"
              alt="App Família no Azul aberto num notebook e num celular ao mesmo tempo, mostrando o painel do mês com o saldo e a divisão 50-30-20."
              loading="eager"
              width={1200}
              height={801}
              className="w-full max-w-[560px] drop-shadow-2xl"
            />
          </div>
        </div>
      </section>

      {/* POR QUE FUNCIONA */}
      <section className="border-y border-white/60 bg-white/40 backdrop-blur">
        <div className="mx-auto max-w-6xl px-6 py-14 md:py-20">
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
      <section id="beneficios" className="mx-auto max-w-6xl px-6 py-16 md:py-28">
        <div className="mx-auto max-w-2xl text-center">
          <span className="t-eyebrow">Benefícios</span>
          <h2 className="font-display mt-3 text-4xl tracking-tight md:text-5xl">
            Seis coisas que o App Família no Azul <span className="italic text-orange-500">resolve pra você.</span>
          </h2>
        </div>
        <div
          ref={beneficiosDrawerRef}
          className="mt-10 md:mt-16 grid gap-2 sm:grid-cols-2 lg:grid-cols-3"
        >
          {benefits.map(({ icon: Icon, title, desc }, i) => {
            // Padrão bento: alterna azul preenchido e cinza claro
            const filled = i % 2 === 1;
            const bg = filled ? "#0F2A47" : "#F1F3F5";
            const titleColor = filled ? "#FFFFFF" : "#0F2A47";
            const descColor = filled ? "rgba(255,255,255,0.85)" : "rgba(15,42,71,0.72)";
            const iconWrap = filled ? "bg-white/15 text-white" : "text-[#0F2A47]";
            const iconStyle = filled ? {} : { backgroundColor: "#E6F2FB" };
            return (
              <div
                key={title}
                className="flex min-h-[240px] flex-col p-8 transition-transform hover:-translate-y-0.5"
                style={{ backgroundColor: bg }}
              >
                <div
                  className={`grid h-11 w-11 place-items-center rounded-lg ${iconWrap}`}
                  style={iconStyle}
                >
                  <Icon className="h-5 w-5" strokeLinecap="round" strokeLinejoin="round" />
                </div>
                <div
                  className="mt-6 text-xl font-semibold leading-snug"
                  style={{ color: titleColor }}
                >
                  {title}
                </div>
                <p
                  className="mt-3 text-sm leading-relaxed"
                  style={{ color: descColor }}
                >
                  {desc}
                </p>
              </div>
            );
          })}
        </div>

        <div className="mt-12 text-center">
          <a
            href="#planos"
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
        <div className="mx-auto max-w-6xl px-6 py-16 md:py-28">
          <div className="mx-auto max-w-2xl text-center">
            <span className="t-eyebrow">Como funciona</span>
            <h2 className="font-display mt-3 text-4xl tracking-tight md:text-5xl">
              Três passos até <em className="italic" style={{ color: ORANGE }}>respirar aliviado.</em>
            </h2>
          </div>
          <div className="mt-12 md:mt-20 grid gap-8 md:grid-cols-3">
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
      <section id="app" className="mx-auto max-w-6xl px-6 py-16 md:py-28">
        <div className="mx-auto max-w-2xl text-center">
          <span className="t-eyebrow">Por dentro do app</span>
          <h2 className="font-display mt-3 text-4xl tracking-tight md:text-5xl">
            Tudo o que importa, <em className="italic" style={{ color: ORANGE }}>numa tela só.</em>
          </h2>
        </div>
        <div className="mt-10 md:mt-16 space-y-12 md:space-y-16">
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
              <div className="flex justify-center">
                <img
                  src={screen.image}
                  alt={screen.alt}
                  loading="lazy"
                  className="w-full max-w-[360px] drop-shadow-xl"
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* NOSSA HISTÓRIA */}
      <section id="historia" className="border-t border-white/60 bg-white/30 backdrop-blur">
        <div className="mx-auto max-w-6xl px-6 py-16 md:py-28">
          <div className="mx-auto max-w-2xl text-center">
            <span className="t-eyebrow">De família pra família</span>
            <h2 className="font-display mt-3 text-4xl tracking-tight md:text-5xl">
              Por que criamos o <em className="italic text-orange-500">Família no Azul.</em>
            </h2>
          </div>
          <div className="mx-auto mt-14 max-w-4xl rounded-[2rem] border border-white/70 bg-white/90 p-8 shadow-xl md:p-12">
            <div className="grid gap-10 md:grid-cols-[auto_1fr] md:items-center md:gap-12">
              <div className="order-1 flex justify-center md:justify-start">
                <img
                  src={familiaLineartUrl}
                  alt="Ilustração 3D de uma família sorrindo com um coração laranja acima"
                  loading="lazy"
                  width={720}
                  height={960}
                  className="w-full max-w-[220px] md:max-w-[280px]"
                />
              </div>
              <div className="order-2">
                <p className="font-display text-xl leading-snug tracking-tight md:text-2xl">
                  A gente sabe como é terminar o mês sem saber pra onde o dinheiro foi. Já passamos pelo
                  caderninho, pela planilha que durou três semanas, pelo aplicativo complicado demais.
                  O Família no Azul é o app que a gente queria ter tido em casa: leve, simples e sem
                  julgamento.
                </p>
                <div className="mt-6 text-sm italic text-[#0F2A47]/60">
                  — Equipe Família no Azul, Grupo Romana
                </div>
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
      <section className="mx-auto max-w-6xl px-6 py-14 md:py-20">
        <div className="mx-auto max-w-4xl rounded-[2rem] border border-white/70 bg-white/85 p-10 shadow-xl md:p-14">
          <div className="grid gap-8 md:grid-cols-[auto_1fr] md:items-center md:gap-10">
            <img
              src={assetUrl(seloGarantia)}
              alt="Selo de 7 dias de garantia"
              className="mx-auto h-40 w-40 md:mx-0"
              loading="lazy"
            />
            <div className="text-center md:text-left">
              <span className="t-eyebrow">Sem risco</span>
              <h2 className="font-display mt-2 text-3xl tracking-tight md:text-4xl">
                Faça o teste por 7 dias.
              </h2>
              <p className="mt-4 text-base text-[#0F2A47]/70">
                Experimente sem riscos. Se em 7 dias achar que não é o ideal para sua família,
                devolvemos o seu dinheiro.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* PLANOS */}
      <section id="planos" className="border-t border-white/60 bg-white/30 backdrop-blur">
        <div className="mx-auto max-w-6xl px-6 py-16 md:py-28">
          <div className="mx-auto max-w-2xl text-center">
            <span className="t-eyebrow">Plano</span>
            <h2 className="font-display mt-3 text-4xl tracking-tight md:text-5xl">
              Um ano inteiro no azul <em className="italic text-orange-500">por menos que uma pizza.</em>
            </h2>
            <p className="mt-4 text-base text-[#0F2A47]/70">
              R$ 67,90 pelo ano todo - dá R$ 5,66 por mês. Sem surpresa na fatura.
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
                  "Modo Casal: 2 contas, um orçamento só — sem pagar a mais",
                  "Assistente de dívidas: entenda os juros e avalie propostas de acordo",
                  "Reserva de emergência com plano em etapas",
                  "Avisos por e-mail antes das contas vencerem",
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
                Pagamento único e seguro · 7 dias de garantia total · Sem renovação automática
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-4xl px-6 py-16 md:py-28">
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
