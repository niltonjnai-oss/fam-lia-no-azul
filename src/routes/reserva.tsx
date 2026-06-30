import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  PiggyBank,
  Target,
  CalendarClock,
  ShieldCheck,
  Info,
  ChevronDown,
  ChevronUp,
  Check,
  Circle,
  MapPin,
  Sparkles,
  Calculator,
  Plus,
  AlertTriangle,
  PartyPopper,
} from "lucide-react";

import {
  qk,
  fetchReservaConfig,
  atualizarReservaConfig,
  fetch503020,
  mesAtual,
} from "@/lib/db";
import { formatBRL } from "@/lib/format";
import { Skeleton } from "@/components/ui/skeleton";
import { PageTitle } from "@/components/PageTitle";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/EmptyState";
import { CurrencyInput } from "@/components/CurrencyInput";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/reserva")({
  head: () => ({
    meta: [
      { title: "Reserva de Emergência — Família no Azul" },
      {
        name: "description",
        content:
          "Monte a reserva da sua família com uma linguagem simples: meta, prazo e quanto guardar por mês.",
      },
    ],
  }),
  component: ReservaPage,
});

type Modo = "gasto" | "alvo" | "prazo";

const PRAZOS: ReadonlyArray<{ meses: number; rotulo: string; sub: string; destaque?: boolean }> = [
  { meses: 3, rotulo: "3 meses", sub: "renda estável" },
  { meses: 6, rotulo: "6 meses", sub: "recomendado", destaque: true },
  { meses: 12, rotulo: "12 meses", sub: "renda variável" },
];

const QUICK_ADD: ReadonlyArray<number> = [50, 100, 200];

function ReservaPage() {
  const reservaQ = useQuery({ queryKey: qk.reserva, queryFn: fetchReservaConfig });
  const mes = mesAtual();
  const bloco503020Q = useQuery({
    queryKey: qk.bloco503020(mes),
    queryFn: () => fetch503020(mes),
  });
  const qc = useQueryClient();

  const r = reservaQ.data;

  const [custo, setCusto] = useState("");
  const [mult, setMult] = useState("");
  const [guardado, setGuardado] = useState("");
  const [aporte, setAporte] = useState("");
  const [explanationOpen, setExplanationOpen] = useState(false);
  const [modo, setModo] = useState<Modo>(() => {
    if (typeof window === "undefined") return "gasto";
    const saved = window.localStorage.getItem("reserva_modo_v2") as Modo | null;
    return saved ?? "gasto";
  });
  useEffect(() => {
    if (typeof window !== "undefined") window.localStorage.setItem("reserva_modo_v2", modo);
  }, [modo]);

  useEffect(() => {
    if (!r) return;
    setCusto(String(r.custo_vida_mensal));
    setMult(String(r.multiplicador || 6));
    setGuardado(String(r.valor_guardado));
    setAporte(String(r.aporte_mensal));
  }, [r]);

  const mut = useMutation({
    mutationFn: (patch?: Partial<{ custo: string; mult: string; guardado: string; aporte: string }>) =>
      atualizarReservaConfig(r!.id, {
        custo_vida_mensal: Number(patch?.custo ?? custo) || 0,
        multiplicador: Number(patch?.mult ?? mult) || 0,
        valor_guardado: Number(patch?.guardado ?? guardado) || 0,
        aporte_mensal: Number(patch?.aporte ?? aporte) || 0,
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.reserva }),
  });
  const salvar = () => mut.mutate(undefined);

  const cvNum = Number(custo) || 0;
  const multNum = Number(mult) || 0;
  const guardadoNum = Number(guardado) || 0;
  const aporteNum = Number(aporte) || 0;
  const metaReserva = cvNum * multNum;
  const faltaParaMeta = Math.max(0, metaReserva - guardadoNum);
  const mesesParaMeta = aporteNum > 0 ? Math.ceil(faltaParaMeta / aporteNum) : null;
  const progresso = metaReserva > 0 ? Math.min(1, guardadoNum / metaReserva) : 0;
  const pct = progresso * 100;

  // Etapas
  const etapas = useMemo(() => {
    const e1 = cvNum * 1;
    const mesesMeio = Math.max(1, Math.round(multNum / 2));
    const e2 = cvNum * mesesMeio;
    const e3 = cvNum * multNum;
    const base = [
      { nome: "Primeiro fôlego", sub: "o suficiente para um susto pequeno", valor: e1, chave: "p1" },
      { nome: "Meia reserva", sub: "metade do caminho", valor: e2, chave: "p2" },
      { nome: "Reserva completa", sub: "tranquilidade total", valor: e3, chave: "p3" },
    ];
    let foundAtual = false;
    return base.map((et) => {
      let status: "concluido" | "atual" | "futuro";
      if (guardadoNum >= et.valor && et.valor > 0) status = "concluido";
      else if (!foundAtual) {
        status = "atual";
        foundAtual = true;
      } else status = "futuro";
      return { ...et, status };
    });
  }, [cvNum, multNum, guardadoNum]);

  // Celebração ao bater novo marco
  const [celebrate, setCelebrate] = useState<string | null>(null);
  const prevConcluidos = useRef<Set<string>>(new Set());
  useEffect(() => {
    const atuais = new Set(etapas.filter((e) => e.status === "concluido").map((e) => e.chave));
    const novos = [...atuais].filter((c) => !prevConcluidos.current.has(c));
    if (novos.length > 0 && prevConcluidos.current.size > 0) {
      const last = novos[novos.length - 1];
      const etapa = etapas.find((e) => e.chave === last);
      if (etapa) {
        const msgs: Record<string, string> = {
          p1: "🎉 Você conquistou o seu Primeiro Fôlego!",
          p2: "Você já está na metade do caminho!",
          p3: "Reserva completa! Sua família está protegida.",
        };
        setCelebrate(msgs[last]);
        const id = setTimeout(() => setCelebrate(null), 3200);
        return () => clearTimeout(id);
      }
    }
    prevConcluidos.current = atuais;
  }, [etapas]);

  // Calcular pra mim — soma essenciais do mês atual
  const essenciaisDoMes = useMemo(() => {
    const rows = bloco503020Q.data ?? [];
    const ess = rows.find((x) => x.classificacao === "Essencial");
    if (!ess) return 0;
    return ess.previsto > 0 ? ess.previsto : ess.realizado;
  }, [bloco503020Q.data]);

  const calcularPraMim = () => {
    if (essenciaisDoMes <= 0) return;
    setCusto(String(essenciaisDoMes));
    mut.mutate({ custo: String(essenciaisDoMes) });
  };

  // Aviso gentil: aporte muito baixo para a meta
  const avisoLento = mesesParaMeta !== null && mesesParaMeta > 60 && faltaParaMeta > 0;

  // Quick add
  const adicionarGuardado = (incremento: number) => {
    const novo = guardadoNum + incremento;
    setGuardado(String(novo));
    mut.mutate({ guardado: String(novo) });
  };
  const [outroValor, setOutroValor] = useState("");

  if (reservaQ.isLoading) {
    return (
      <div className="space-y-5">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-40 w-full rounded-2xl" />
        <Skeleton className="h-80 w-full rounded-2xl" />
      </div>
    );
  }

  if (!r) {
    return (
      <div className="space-y-5">
        <header><PageTitle>Reserva de Emergência</PageTitle></header>
        <EmptyState
          title="Configuração da reserva não encontrada"
          description="Complete o onboarding para criar sua linha de configuração."
        />
      </div>
    );
  }

  const radius = 88;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (pct / 100) * circumference;
  const mesesTxt = mesesParaMeta === null ? "Sem aporte" : `${mesesParaMeta}`;
  const recomendarPorMes = multNum > 0 ? faltaParaMeta / multNum : 0;

  return (
    <div className="relative space-y-5">
      {/* Celebração */}
      {celebrate && <Celebration message={celebrate} />}

      <header>
        <PageTitle>Reserva de Emergência</PageTitle>
        <p className="text-sm text-muted-foreground">
          O colchão que protege a sua família dos imprevistos.
        </p>
      </header>

      {/* 1 — Topo: explicação humana */}
      <section className="rounded-2xl border border-border bg-primary/5 border-l-4 border-l-[var(--color-warning)] p-5 shadow-soft">
        <div className="flex items-start gap-3">
          <div className="rounded-full bg-primary/10 p-2 text-primary">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div className="flex-1 space-y-3 text-sm leading-relaxed">
            <h2 className="text-base font-semibold text-primary">O que é a sua reserva</h2>
            <p>
              É um dinheiro guardado <strong>só para emergências de verdade</strong> — o carro
              que quebra, uma consulta urgente ou a perda de uma renda. É o que impede que um
              susto vire dívida. Pense nela como o <strong>colchão que protege a sua família</strong>.
            </p>

            {explanationOpen && (
              <div className="space-y-3">
                <p>
                  <strong>Para que serve:</strong> cobrir os gastos da casa quando a renda falta.
                  Não é para viagem ou compras — para isso, use as metas.
                </p>
                <p>
                  <strong>Quanto guardar:</strong> o ideal é juntar de <strong>3 a 12 meses</strong>{" "}
                  dos seus gastos. <strong>6 meses</strong> é o mais recomendado para a maioria
                  das famílias.
                </p>
                <p>
                  <strong>Onde guardar:</strong> em algo seguro e fácil de sacar (como o Tesouro
                  Selic). O importante é poder pegar o dinheiro na hora da emergência.
                </p>
                <p>
                  <strong>Como começar:</strong> não espere sobrar (nunca sobra). Separe um
                  pouquinho assim que o salário cai. <em>Começar pequeno já vale muito.</em>
                </p>
              </div>
            )}

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setExplanationOpen((v) => !v)}
              className="h-11 -ml-2 text-primary hover:bg-primary/10"
            >
              {explanationOpen ? (
                <><ChevronUp className="h-4 w-4" /> Mostrar menos</>
              ) : (
                <><ChevronDown className="h-4 w-4" /> Ver como funciona</>
              )}
            </Button>
          </div>
        </div>
      </section>

      {/* 2 — Defina sua meta */}
      <DefinaMetaSection
        modo={modo}
        setModo={setModo}
        custo={custo}
        setCusto={setCusto}
        mult={mult}
        setMult={setMult}
        aporte={aporte}
        setAporte={setAporte}
        salvar={salvar}
        salvarPatch={(p) => mut.mutate(p)}
        cvNum={cvNum}
        multNum={multNum}
        metaReserva={metaReserva}
        essenciaisDoMes={essenciaisDoMes}
        calcularPraMim={calcularPraMim}
      />

      {/* 3 — Primeiro passo fácil */}
      <section className="rounded-2xl border-2 border-[var(--color-warning)]/40 bg-[var(--color-warning)]/5 p-5 shadow-soft">
        <div className="flex items-start gap-3">
          <div className="rounded-full bg-[var(--color-warning)]/15 p-2 text-[var(--color-warning-foreground)]">
            <Sparkles className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <h2 className="text-base font-semibold">Dê o primeiro passo</h2>
            <p className="text-xs text-muted-foreground">
              Cada pouquinho conta. O importante é começar hoje.
            </p>

            <div className="mt-3 grid grid-cols-3 gap-2">
              {QUICK_ADD.map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => adicionarGuardado(v)}
                  className="min-h-[44px] rounded-xl border-2 border-[var(--color-warning)]/40 bg-background px-2 py-2 text-sm font-bold transition-colors hover:bg-[var(--color-warning)]/10"
                >
                  + {formatBRL(v).replace(/\u00a0/g, " ")}
                </button>
              ))}
            </div>

            <div className="mt-3 flex items-end gap-2">
              <div className="flex-1">
                <CurrencyInput
                  label="Outro valor"
                  value={outroValor}
                  onChange={setOutroValor}
                  placeholder="R$ 0,00"
                />
              </div>
              <Button
                onClick={() => {
                  const v = Number(outroValor) || 0;
                  if (v > 0) {
                    adicionarGuardado(v);
                    setOutroValor("");
                  }
                }}
                className="h-12 bg-[var(--color-warning)] text-[var(--color-warning-foreground)] hover:bg-[var(--color-warning)]/90"
              >
                <Plus className="h-4 w-4" /> Guardar
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* 4 — Progresso */}
      <section className="rounded-2xl border border-border bg-card p-6 shadow-soft">
        <div className="flex flex-col items-center">
          <div className="relative h-56 w-56">
            <svg viewBox="0 0 200 200" className="h-full w-full -rotate-90">
              <circle cx="100" cy="100" r={radius} fill="none" stroke="var(--color-muted)" strokeWidth="14" />
              <circle
                cx="100" cy="100" r={radius} fill="none"
                stroke="var(--color-primary)" strokeWidth="14" strokeLinecap="round"
                strokeDasharray={circumference} strokeDashoffset={offset}
                style={{ transition: "stroke-dashoffset 300ms ease" }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <PiggyBank className="h-6 w-6 text-primary" />
              <div className="tabular mt-1 text-2xl font-bold">{formatBRL(guardadoNum)}</div>
              <div className="text-xs text-muted-foreground">de {formatBRL(metaReserva)}</div>
              <div className="mt-1 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
                {pct.toFixed(0)}% concluído
              </div>
            </div>
          </div>

          <div className="mt-6 grid w-full grid-cols-3 gap-3">
            <Stat icon={Target} label="Meta" value={formatBRL(metaReserva)} />
            <Stat icon={ShieldCheck} label="Falta" value={formatBRL(faltaParaMeta)} />
            <Stat icon={CalendarClock} label="Meses" value={mesesTxt} />
          </div>

          {recomendarPorMes > 0 && (
            <p className="mt-4 text-center text-xs text-muted-foreground">
              Para chegar na meta em <strong>{multNum} meses</strong>, guarde{" "}
              <strong className="text-primary">{formatBRL(recomendarPorMes)}/mês</strong>.
            </p>
          )}
        </div>
      </section>

      {/* 6 — Aviso gentil */}
      {avisoLento && (
        <section className="rounded-2xl border-2 border-[var(--color-warning)]/40 bg-[var(--color-warning)]/5 p-4 shadow-soft">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-[var(--color-warning-foreground)]" />
            <div className="flex-1 text-sm">
              <p className="font-semibold">No seu ritmo atual, você levaria mais de 5 anos.</p>
              <p className="mt-1 text-muted-foreground">
                Para chegar mais rápido na sua reserva, que tal revisar seus gastos? No
                <strong> 50-30-20</strong> a gente te ajuda a encontrar espaço no orçamento.
              </p>
              <Link
                to="/metodo"
                className="mt-2 inline-flex h-11 items-center rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
              >
                Ver 50-30-20
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* 5 — Plano em etapas */}
      <section className="rounded-2xl border border-border bg-card p-5 shadow-soft">
        <h2 className="text-sm font-semibold">Seu plano em etapas</h2>
        <p className="text-xs text-muted-foreground">
          Comemore cada conquista no caminho até a meta completa.
        </p>

        <ol className="mt-4 space-y-3">
          {etapas.map((et, i) => (
            <li
              key={i}
              className={cn(
                "flex items-start gap-3 rounded-xl border p-3",
                et.status === "concluido" && "border-[var(--color-success)]/30 bg-[var(--color-success)]/5",
                et.status === "atual" && "border-[var(--color-warning)] bg-[var(--color-warning)]/10",
                et.status === "futuro" && "border-border bg-background",
              )}
            >
              <div
                className={cn(
                  "mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full",
                  et.status === "concluido" && "bg-[var(--color-success)] text-[var(--color-success-foreground)]",
                  et.status === "atual" && "bg-[var(--color-warning)] text-[var(--color-warning-foreground)]",
                  et.status === "futuro" && "bg-muted text-muted-foreground",
                )}
                aria-hidden
              >
                {et.status === "concluido" ? <Check className="h-4 w-4" />
                  : et.status === "atual" ? <MapPin className="h-4 w-4" />
                  : <Circle className="h-4 w-4" />}
              </div>
              <div className="flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <div className="text-sm font-semibold">Etapa {i + 1} — {et.nome}</div>
                  <div className="tabular text-sm font-bold">{formatBRL(et.valor)}</div>
                </div>
                <div className="text-xs text-muted-foreground">{et.sub}</div>
                <div className="mt-1 text-[11px] font-medium">
                  {et.status === "concluido" && <span className="text-[var(--color-success)]">✓ Concluído</span>}
                  {et.status === "atual" && <span className="text-[var(--color-warning-foreground)]">Você está aqui</span>}
                  {et.status === "futuro" && <span className="text-muted-foreground">A conquistar</span>}
                </div>
              </div>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}

function Stat({
  icon: Icon, label, value,
}: { icon: typeof Target; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-background p-3 text-center">
      <Icon className="mx-auto h-4 w-4 text-muted-foreground" />
      <div className="mt-1 text-[11px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="tabular mt-0.5 text-sm font-bold">{value}</div>
    </div>
  );
}

type PatchT = Partial<{ custo: string; mult: string; guardado: string; aporte: string }>;

function DefinaMetaSection(props: {
  modo: Modo;
  setModo: (m: Modo) => void;
  custo: string;
  setCusto: (v: string) => void;
  mult: string;
  setMult: (v: string) => void;
  aporte: string;
  setAporte: (v: string) => void;
  salvar: () => void;
  salvarPatch: (p: PatchT) => void;
  cvNum: number;
  multNum: number;
  metaReserva: number;
  essenciaisDoMes: number;
  calcularPraMim: () => void;
}) {
  const {
    modo, setModo, custo, setCusto, mult, setMult, aporte, setAporte,
    salvar, salvarPatch, cvNum, multNum, metaReserva, essenciaisDoMes, calcularPraMim,
  } = props;

  // Modo B (alvo) e Modo C (prazo): estado local
  const [alvo, setAlvo] = useState("");
  const [prazoMeses, setPrazoMeses] = useState("");
  const [prazoAlvo, setPrazoAlvo] = useState("");

  const alvoNum = Number(alvo) || 0;
  const prazoAlvoNum = Number(prazoAlvo) || 0;
  const prazoMesesNum = Math.max(0, Math.floor(Number(prazoMeses) || 0));

  // Aplica modo B (valor-alvo + meses): define custo = alvo/m, mult = m, aporte = alvo/m
  const aplicarAlvoPrazo = (valor: number, m: number) => {
    if (valor <= 0 || m <= 0) return;
    const porMes = +(valor / m).toFixed(2);
    setCusto(String(porMes));
    setMult(String(m));
    setAporte(String(porMes));
    salvarPatch({ custo: String(porMes), mult: String(m), aporte: String(porMes) });
  };

  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-soft space-y-4">
      <div>
        <h2 className="text-sm font-semibold">Defina sua meta</h2>
        <p className="text-xs text-muted-foreground">
          Escolha a forma que faz mais sentido para a sua família.
        </p>
      </div>

      {/* Toggle de 3 modos */}
      <div className="grid grid-cols-3 gap-1 rounded-xl bg-muted p-1" role="tablist">
        {([
          { key: "gasto", label: "Pelo gasto" },
          { key: "alvo", label: "Por valor" },
          { key: "prazo", label: "Por prazo" },
        ] as const).map((opt) => {
          const ativo = modo === opt.key;
          return (
            <button
              key={opt.key}
              type="button"
              role="tab"
              aria-selected={ativo}
              onClick={() => setModo(opt.key)}
              className={cn(
                "min-h-[44px] rounded-lg px-2 py-2 text-xs font-semibold transition-colors",
                ativo
                  ? "bg-[var(--color-warning)] text-[var(--color-warning-foreground)] shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {opt.label}
            </button>
          );
        })}
      </div>

      {/* MODO A — Pelo meu gasto mensal */}
      {modo === "gasto" && (
        <div className="space-y-4">
          <div>
            <CurrencyInput
              label="Quanto sua família gasta por mês?"
              value={custo}
              onChange={setCusto}
              onBlur={salvar}
              placeholder="R$ 0,00"
            />
            <p className="mt-1 text-[11px] text-muted-foreground">
              É tudo o que sai por mês: aluguel, luz, água, mercado, transporte, escola.
              Não é o quanto você ganha — é o quanto você gasta.
            </p>

            {essenciaisDoMes > 0 && (
              <button
                type="button"
                onClick={calcularPraMim}
                className="mt-2 inline-flex h-11 items-center gap-2 rounded-lg border border-primary/40 bg-primary/5 px-3 text-xs font-semibold text-primary hover:bg-primary/10"
              >
                <Calculator className="h-4 w-4" />
                Não sabe quanto gasta? Calcular pra mim
              </button>
            )}
          </div>

          <div>
            <div className="mb-2 text-xs font-medium text-muted-foreground">
              Por quantos meses você quer ficar protegido?
            </div>
            <div className="grid grid-cols-3 gap-2">
              {PRAZOS.map((a) => {
                const ativo = multNum === a.meses;
                return (
                  <button
                    key={a.meses}
                    type="button"
                    onClick={() => {
                      setMult(String(a.meses));
                      salvarPatch({ mult: String(a.meses) });
                    }}
                    className={cn(
                      "min-h-[44px] rounded-xl border-2 px-2 py-2 text-center transition-colors",
                      ativo
                        ? "border-[var(--color-warning)] bg-[var(--color-warning)]/15"
                        : a.destaque
                          ? "border-[var(--color-warning)]/50 bg-background hover:bg-[var(--color-warning)]/5"
                          : "border-border bg-background hover:bg-muted",
                    )}
                  >
                    <div className="text-sm font-bold">{a.rotulo}</div>
                    <div className="text-[10px] text-muted-foreground">{a.sub}</div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-xl border-2 border-[var(--color-warning)] bg-[var(--color-warning)]/10 p-4">
            <div className="text-[11px] font-semibold uppercase tracking-wide text-[var(--color-warning-foreground)]/80">
              Quanto você precisa guardar
            </div>
            <div className="tabular mt-1 text-2xl font-bold text-foreground">
              {formatBRL(metaReserva)}
            </div>
            <div className="text-xs text-muted-foreground">
              {cvNum > 0 && multNum > 0
                ? `Para a sua família ficar protegida por ${multNum} meses caso falte renda.`
                : "Informe seu gasto e escolha um prazo."}
            </div>
          </div>
        </div>
      )}

      {/* MODO B — Por valor que quero juntar */}
      {modo === "alvo" && (
        <div className="space-y-4">
          <CurrencyInput
            label="Quanto você quer guardar de reserva?"
            value={alvo}
            onChange={setAlvo}
            placeholder="Ex.: R$ 1.800,00"
          />

          {alvoNum > 0 ? (
            <div>
              <div className="mb-2 text-xs font-medium text-muted-foreground">
                Escolha em quanto tempo quer juntar:
              </div>
              <div className="grid grid-cols-3 gap-2">
                {PRAZOS.map((p) => {
                  const valorMes = alvoNum / p.meses;
                  const ativo = multNum === p.meses && Math.abs(cvNum * multNum - alvoNum) < 0.5;
                  return (
                    <button
                      key={p.meses}
                      type="button"
                      onClick={() => aplicarAlvoPrazo(alvoNum, p.meses)}
                      className={cn(
                        "min-h-[44px] rounded-xl border-2 px-2 py-2 text-center transition-colors",
                        ativo
                          ? "border-[var(--color-warning)] bg-[var(--color-warning)]/15"
                          : p.destaque
                            ? "border-[var(--color-warning)]/50 bg-background hover:bg-[var(--color-warning)]/5"
                            : "border-border bg-background hover:bg-muted",
                      )}
                    >
                      <div className="text-sm font-bold">Em {p.meses} meses</div>
                      <div className="tabular text-xs font-semibold text-primary">
                        {formatBRL(valorMes)}/mês
                      </div>
                      {p.destaque && (
                        <div className="text-[10px] text-muted-foreground">recomendado</div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-border bg-background p-4 text-center text-xs text-muted-foreground">
              Informe quanto você quer guardar para ver os prazos.
            </div>
          )}

          {multNum > 0 && cvNum > 0 && (
            <div className="rounded-xl border-2 border-[var(--color-warning)] bg-[var(--color-warning)]/10 p-4">
              <div className="text-[11px] font-semibold uppercase tracking-wide text-[var(--color-warning-foreground)]/80">
                Meta atual
              </div>
              <div className="tabular mt-1 text-2xl font-bold text-foreground">
                {formatBRL(metaReserva)}
              </div>
              <div className="text-xs text-muted-foreground">
                Guardando {formatBRL(Number(aporte) || 0)}/mês por {multNum} meses.
              </div>
            </div>
          )}
        </div>
      )}

      {/* MODO C — Por prazo (valor + meses) */}
      {modo === "prazo" && (
        <div className="space-y-4">
          <CurrencyInput
            label="Quanto você quer juntar?"
            value={prazoAlvo}
            onChange={setPrazoAlvo}
            placeholder="Ex.: R$ 5.000,00"
          />

          <label className="block">
            <span className="block text-xs font-medium text-muted-foreground">
              Em quantos meses?
            </span>
            <input
              value={prazoMeses}
              inputMode="numeric"
              onChange={(e) => setPrazoMeses(e.target.value.replace(/\D/g, ""))}
              placeholder="Ex.: 10"
              className="tabular mt-1 w-full rounded-xl border-2 border-primary/30 bg-background px-4 py-3 text-lg font-semibold outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </label>

          {prazoAlvoNum > 0 && prazoMesesNum > 0 ? (
            <div className="rounded-xl border-2 border-[var(--color-warning)] bg-[var(--color-warning)]/10 p-4">
              <div className="text-[11px] font-semibold uppercase tracking-wide text-[var(--color-warning-foreground)]/80">
                Você precisa guardar
              </div>
              <div className="tabular mt-1 text-2xl font-bold text-foreground">
                {formatBRL(prazoAlvoNum / prazoMesesNum)}
                <span className="text-sm font-normal text-muted-foreground">/mês</span>
              </div>
              <div className="text-xs text-muted-foreground">
                Para juntar {formatBRL(prazoAlvoNum)} em {prazoMesesNum} meses.
              </div>
              <Button
                onClick={() => aplicarAlvoPrazo(prazoAlvoNum, prazoMesesNum)}
                className="mt-3 h-11 bg-[var(--color-warning)] text-[var(--color-warning-foreground)] hover:bg-[var(--color-warning)]/90"
              >
                Aplicar
              </Button>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-border bg-background p-4 text-center text-xs text-muted-foreground">
              Informe quanto quer juntar e em quantos meses.
            </div>
          )}
        </div>
      )}
    </section>
  );
}

function Celebration({ message }: { message: string }) {
  const cores = [
    "var(--color-primary)",
    "var(--color-warning)",
    "var(--color-success)",
    "var(--color-primary-glow)",
  ];
  const particulas = Array.from({ length: 28 });
  return (
    <div className="pointer-events-none fixed inset-0 z-50 flex items-start justify-center pt-20">
      <div className="pointer-events-auto rounded-2xl border-2 border-[var(--color-warning)] bg-card px-5 py-4 shadow-elevated animate-scale-in">
        <div className="flex items-center gap-2">
          <PartyPopper className="h-5 w-5 text-[var(--color-warning-foreground)]" />
          <p className="text-sm font-semibold">{message}</p>
        </div>
      </div>
      <div className="absolute inset-0 overflow-hidden">
        {particulas.map((_, i) => {
          const left = (i * 97) % 100;
          const delay = (i % 10) * 60;
          const duration = 1400 + (i % 5) * 200;
          const cor = cores[i % cores.length];
          return (
            <span
              key={i}
              className="absolute top-10 h-2 w-2 rounded-sm"
              style={{
                left: `${left}%`,
                background: cor,
                animation: `confetti-fall ${duration}ms ease-out ${delay}ms forwards`,
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
