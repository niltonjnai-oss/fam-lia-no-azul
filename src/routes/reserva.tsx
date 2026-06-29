import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  PiggyBank,
  Target,
  CalendarClock,
  ShieldCheck,
  Save,
  Info,
  ChevronDown,
  ChevronUp,
  Check,
  Circle,
  MapPin,
} from "lucide-react";

import { qk, fetchReservaConfig, atualizarReservaConfig } from "@/lib/db";
import { formatBRL } from "@/lib/format";
import { Skeleton } from "@/components/ui/skeleton";
import { PageTitle } from "@/components/PageTitle";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/EmptyState";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/reserva")({
  head: () => ({
    meta: [
      { title: "Reserva de Emergência — Família no Azul" },
      {
        name: "description",
        content: "Acompanhe sua reserva: meta, valor guardado e meses para atingir.",
      },
    ],
  }),
  component: ReservaPage,
});

const ATALHOS: ReadonlyArray<{ meses: number; rotulo: string; destaque?: boolean }> = [
  { meses: 3, rotulo: "renda estável" },
  { meses: 6, rotulo: "recomendado", destaque: true },
  { meses: 12, rotulo: "renda variável" },
];

function ReservaPage() {
  const reservaQ = useQuery({ queryKey: qk.reserva, queryFn: fetchReservaConfig });
  const qc = useQueryClient();

  const r = reservaQ.data;

  const [custo, setCusto] = useState("");
  const [mult, setMult] = useState("");
  const [guardado, setGuardado] = useState("");
  const [aporte, setAporte] = useState("");
  const [explanationOpen, setExplanationOpen] = useState(false);

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
  const metaSugerida = cvNum * multNum;

  const etapas = useMemo(() => {
    const e1 = cvNum * 1;
    const e2 = cvNum * Math.max(1, Math.round(multNum / 2));
    const e3 = cvNum * multNum;
    const base = [
      { nome: "Primeiro fôlego", sub: "o suficiente para um susto pequeno", meses: 1, valor: e1 },
      { nome: "Meia reserva", sub: "metade do caminho", meses: Math.max(1, Math.round(multNum / 2)), valor: e2 },
      { nome: "Reserva completa", sub: "tranquilidade total", meses: multNum, valor: e3 },
    ];
    // status: concluído / atual / a conquistar
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

  const selecionarMeses = (m: number) => {
    setMult(String(m));
    if (r) mut.mutate({ mult: String(m) });
  };

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
        <header>
          <PageTitle>Reserva de Emergência</PageTitle>
        </header>
        <EmptyState
          title="Configuração da reserva não encontrada"
          description="Complete o onboarding para criar sua linha de configuração."
        />
      </div>
    );
  }

  const aporteNum = Number(aporte) || 0;
  const metaReserva = metaSugerida;
  const faltaParaMeta = Math.max(0, metaReserva - guardadoNum);
  const mesesParaMeta = aporteNum > 0 ? Math.ceil(faltaParaMeta / aporteNum) : null;
  const progresso = metaReserva > 0 ? Math.min(1, guardadoNum / metaReserva) : 0;
  const pct = progresso * 100;
  const radius = 88;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (pct / 100) * circumference;
  const mesesTxt = mesesParaMeta === null ? "Sem aporte" : `${mesesParaMeta}`;

  return (
    <div className="space-y-5">
      <header>
        <PageTitle>Reserva de Emergência</PageTitle>
        <p className="text-sm text-muted-foreground">Seu colchão de segurança para imprevistos.</p>
      </header>

      {/* Bloco 1 — Explicação */}
      <section className="rounded-2xl border border-border bg-primary/5 border-l-4 border-l-[var(--color-warning)] p-5 shadow-soft">
        <div className="flex items-start gap-3">
          <div className="rounded-full bg-primary/10 p-2 text-primary">
            <Info className="h-5 w-5" />
          </div>
          <div className="flex-1 space-y-3 text-sm leading-relaxed">
            <h2 className="text-base font-semibold text-primary">O que é e por que importa</h2>

            <p>
              <strong>O que é a reserva de emergência?</strong> É um dinheiro guardado só para
              emergências de verdade — o carro que quebra, uma consulta médica urgente, um conserto
              inesperado em casa ou a perda de uma fonte de renda. Não é para viagem, troca de
              celular ou compras: para esses sonhos, use as metas. A reserva tem uma função só:
              proteger a sua família quando a vida surpreende.
            </p>

            <p>
              <strong>Por que ela é tão importante?</strong> Sem reserva, qualquer imprevisto vira
              dívida — normalmente no cartão ou no cheque especial, que cobram os juros mais altos.
              Com reserva, o mesmo imprevisto é só um susto. Ela é o que separa uma família que
              vive no aperto de uma que dorme tranquila.
            </p>

            {explanationOpen && (
              <div className="space-y-3">
                <div>
                  <p>
                    <strong>Quanto guardar?</strong> A regra é juntar de 3 a 12 meses do seu custo
                    de vida mensal:
                  </p>
                  <ul className="ml-5 mt-1 list-disc space-y-1">
                    <li>
                      <strong>3 meses</strong> — para quem tem renda estável (servidor, CLT antigo).
                    </li>
                    <li>
                      <strong>6 meses</strong> — o recomendado para a maioria das famílias.
                    </li>
                    <li>
                      <strong>12 meses</strong> — para quem tem renda variável, é autônomo ou tem
                      filhos pequenos.
                    </li>
                  </ul>
                </div>
                <p>
                  <strong>Onde guardar?</strong> Em um lugar seguro e de resgate fácil (como Tesouro
                  Selic ou um CDB com liquidez diária). Aqui o objetivo é segurança e
                  disponibilidade, não rentabilidade — você precisa poder sacar na hora da
                  emergência.
                </p>
                <p>
                  <strong>Como começar?</strong> Não espere sobrar dinheiro (nunca sobra). Separe um
                  valor assim que o salário cai — o "pague-se primeiro". Comece pequeno se precisar:
                  o importante é a constância, não o tamanho do primeiro depósito.
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
                <>
                  <ChevronUp className="h-4 w-4" /> Mostrar menos
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4" /> Ver como funciona
                </>
              )}
            </Button>
          </div>
        </div>
      </section>

      {/* Card de progresso (anel) */}
      <section className="rounded-2xl border border-border bg-card p-6 shadow-soft">
        <div className="flex flex-col items-center">
          <div className="relative h-56 w-56">
            <svg viewBox="0 0 200 200" className="h-full w-full -rotate-90">
              <circle cx="100" cy="100" r={radius} fill="none" stroke="var(--color-muted)" strokeWidth="14" />
              <circle
                cx="100"
                cy="100"
                r={radius}
                fill="none"
                stroke="var(--color-primary)"
                strokeWidth="14"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                style={{ transition: "stroke-dashoffset 300ms ease" }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <PiggyBank className="h-6 w-6 text-primary" />
              <div className="tabular mt-1 text-2xl font-bold">
                {formatBRL(guardadoNum)}
              </div>
              <div className="text-xs text-muted-foreground">
                de {formatBRL(metaReserva)}
              </div>
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
        </div>
      </section>

      {/* Bloco 2 — Meta sugerida com atalhos */}
      <DefinaMetaSection
        modo={modo}
        setModo={setModo}
        custo={custo}
        setCusto={setCusto}
        mult={mult}
        setMult={setMult}
        guardado={guardado}
        setGuardado={setGuardado}
        aporte={aporte}
        setAporte={setAporte}
        salvar={salvar}
        salvarPatch={(p) => mut.mutate(p)}
        cvNum={cvNum}
        multNum={multNum}
        metaSugerida={metaSugerida}
        mutPending={mut.isPending}
      />

      {/* Bloco 3 — Plano em etapas */}
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
                {et.status === "concluido" ? (
                  <Check className="h-4 w-4" />
                ) : et.status === "atual" ? (
                  <MapPin className="h-4 w-4" />
                ) : (
                  <Circle className="h-4 w-4" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <div className="text-sm font-semibold">
                    Etapa {i + 1} — {et.nome}
                  </div>
                  <div className="tabular text-sm font-bold">{formatBRL(et.valor)}</div>
                </div>
                <div className="text-xs text-muted-foreground">{et.sub}</div>
                <div className="mt-1 text-[11px] font-medium">
                  {et.status === "concluido" && (
                    <span className="text-[var(--color-success)]">✓ Concluído</span>
                  )}
                  {et.status === "atual" && (
                    <span className="text-[var(--color-warning-foreground)]">Você está aqui</span>
                  )}
                  {et.status === "futuro" && (
                    <span className="text-muted-foreground">A conquistar</span>
                  )}
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
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Target;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-background p-3 text-center">
      <Icon className="mx-auto h-4 w-4 text-muted-foreground" />
      <div className="mt-1 text-[11px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="tabular mt-0.5 text-sm font-bold">{value}</div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block">
      <span className="block text-xs font-medium text-muted-foreground">{label}</span>
      <input
        value={value}
        inputMode="decimal"
        onChange={(e) => onChange(e.target.value)}
        className="tabular mt-1 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
      />
    </label>
  );
}
