import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import {
  ArrowDownRight,
  ArrowUpRight,
  PiggyBank,
  CreditCard,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

import {
  qk,
  fetchRenda,
  fetchResumoMensal,
  fetch503020,
  formatMes,
  type Classificacao,
} from "@/lib/db";
import { useMes } from "@/lib/mes-context";
import { formatBRL, formatPct } from "@/lib/format";
import { MesSelector } from "@/components/MesSelector";
import { Skeleton } from "@/components/ui/skeleton";
import {
  PersonalizarPainelButton,
  PainelExtras,
  usePainelPrefs,
} from "@/components/PainelExtras";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Painel — Família no Azul" },
      {
        name: "description",
        content: "Resumo do mês: renda, gastos, saldo e método 50-30-20 da família.",
      },
    ],
  }),
  component: PainelPage,
});

const CHART_COLORS: Record<Classificacao, string> = {
  Essencial: "var(--color-chart-1)",
  "Estilo de Vida": "var(--color-chart-2)",
  "Reserva/Dívidas": "var(--color-chart-3)",
};

const LIMITE_PCT: Record<Classificacao, number> = {
  Essencial: 0.5,
  "Estilo de Vida": 0.3,
  "Reserva/Dívidas": 0.2,
};

type Status = "ok" | "acima" | "abaixo";
function statusBloco(classificacao: Classificacao, pctRenda: number): Status {
  if (classificacao === "Reserva/Dívidas") return pctRenda < 0.2 ? "abaixo" : "ok";
  const limite = LIMITE_PCT[classificacao];
  return pctRenda > limite ? "acima" : "ok";
}
function statusLabel(s: Status): string {
  return s === "ok" ? "OK" : s === "acima" ? "Acima do Limite" : "Abaixo da Meta";
}
function statusClasses(s: Status): string {
  return s === "ok"
    ? "bg-success/15 text-success"
    : s === "acima"
      ? "bg-danger/15 text-danger"
      : "bg-warning/20 text-warning-foreground";
}

function PainelPage() {
  const { mes } = useMes();

  const rendaQ = useQuery({ queryKey: qk.renda(mes), queryFn: () => fetchRenda(mes) });
  const resumoQ = useQuery({ queryKey: qk.resumo(mes), queryFn: () => fetchResumoMensal(mes) });
  const blocosQ = useQuery({ queryKey: qk.bloco503020(mes), queryFn: () => fetch503020(mes) });

  const { prefs, setPrefs } = usePainelPrefs();

  const carregando = rendaQ.isLoading || resumoQ.isLoading || blocosQ.isLoading;

  const rendaTotal = (rendaQ.data ?? []).reduce((acc, r) => acc + Number(r.valor), 0);
  const gastosTotal = Number(resumoQ.data?.total_real ?? 0);
  const saldo = rendaTotal - gastosTotal;

  const blocos = blocosQ.data ?? [];

  const cards = [
    { label: "Renda", valor: rendaTotal, Icon: ArrowUpRight, tone: "text-success", bg: "bg-success/10" },
    { label: "Gastos", valor: gastosTotal, Icon: ArrowDownRight, tone: "text-danger", bg: "bg-danger/10" },
    { label: "Saldo", valor: saldo, Icon: Sparkles, tone: "text-primary", bg: "bg-primary/10" },
  ];

  const orcamentoVazio =
    !carregando &&
    Number(resumoQ.data?.total_previsto ?? 0) === 0 &&
    Number(resumoQ.data?.total_real ?? 0) === 0;

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="text-sm capitalize text-muted-foreground">{formatMes(mes)}</p>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Olá, família!</h1>
        </div>
        <div className="flex items-center gap-2">
          <PersonalizarPainelButton prefs={prefs} setPrefs={setPrefs} />
          <Link to="/onboarding" className="text-xs font-medium text-primary hover:underline">
            Refazer onboarding
          </Link>
        </div>
      </header>

      <MesSelector />

      {orcamentoVazio && (
        <Link
          to="/onboarding"
          className="flex items-center gap-3 rounded-2xl border border-primary/30 bg-primary/5 p-4 transition-colors hover:bg-primary/10"
        >
          <div className="grid h-11 w-11 place-items-center rounded-xl bg-primary text-primary-foreground">
            <Sparkles className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-semibold">Comece aqui</div>
            <div className="text-xs text-muted-foreground">
              Em 1 minuto seu orçamento inicial fica montado.
            </div>
          </div>
          <ArrowUpRight className="h-4 w-4 text-primary" />
        </Link>
      )}


      <section className="grid grid-cols-3 gap-3">
        {cards.map(({ label, valor, Icon, tone, bg }) => (
          <div key={label} className="rounded-2xl border border-border bg-card p-3 shadow-soft sm:p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground sm:text-sm">{label}</span>
              <span className={`grid h-7 w-7 place-items-center rounded-lg ${bg}`}>
                <Icon className={`h-4 w-4 ${tone}`} />
              </span>
            </div>
            <div className="tabular mt-2 text-base font-bold sm:text-xl">
              {carregando ? <Skeleton className="h-6 w-24" /> : formatBRL(valor)}
            </div>
          </div>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
          <h2 className="text-sm font-semibold">Divisão por classificação</h2>
          <p className="text-xs text-muted-foreground">Como sua renda foi gasta este mês.</p>
          <div className="mt-3 h-56">
            {carregando ? (
              <Skeleton className="h-full w-full rounded-xl" />
            ) : blocos.every((b) => Number(b.realizado) === 0) ? (
              <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                Nenhum gasto registrado neste mês ainda.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={blocos.map((b) => ({
                      nome: b.classificacao,
                      valor: Number(b.realizado),
                      cor: CHART_COLORS[b.classificacao],
                    }))}
                    dataKey="valor"
                    nameKey="nome"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={2}
                    stroke="var(--color-background)"
                    strokeWidth={3}
                  >
                    {blocos.map((b) => (
                      <Cell key={b.classificacao} fill={CHART_COLORS[b.classificacao]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(v: number) => formatBRL(v)}
                    contentStyle={{
                      background: "var(--color-popover)",
                      border: "1px solid var(--color-border)",
                      borderRadius: 12,
                      fontSize: 12,
                    }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: 12, color: "var(--color-muted-foreground)" }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
          <h2 className="text-sm font-semibold">Método 50-30-20</h2>
          <p className="text-xs text-muted-foreground">Compare o realizado com a meta de cada bloco.</p>
          <div className="mt-4 space-y-4">
            {(["Essencial", "Estilo de Vida", "Reserva/Dívidas"] as Classificacao[]).map((cls) => {
              const linha = blocos.find((b) => b.classificacao === cls);
              const realizado = Number(linha?.realizado ?? 0);
              const limite = rendaTotal * LIMITE_PCT[cls];
              const pctRenda = rendaTotal > 0 ? realizado / rendaTotal : 0;
              const st = statusBloco(cls, pctRenda);
              const Icon = st === "ok" ? CheckCircle2 : AlertTriangle;
              const widthPct = limite > 0 ? Math.min(100, (realizado / limite) * 100) : 0;
              return (
                <div key={cls}>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="font-medium">{cls}</span>
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${statusClasses(st)}`}>
                      <Icon className="h-3 w-3" />
                      {statusLabel(st)}
                    </span>
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full transition-[width] duration-300"
                      style={{ width: `${widthPct}%`, backgroundColor: CHART_COLORS[cls] }}
                    />
                  </div>
                  <div className="tabular mt-1 flex justify-between text-[11px] text-muted-foreground">
                    <span>{formatBRL(realizado)}</span>
                    <span>
                      limite {formatBRL(limite)} · {formatPct(LIMITE_PCT[cls] * 100)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2">
        <Link
          to="/reserva"
          className="group flex items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-soft transition-all duration-200 hover:border-primary/40 hover:shadow-elevated"
        >
          <div className="grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary">
            <PiggyBank className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-semibold">Reserva de Emergência</div>
            <div className="text-xs text-muted-foreground">Veja seu progresso</div>
          </div>
          <ArrowUpRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </Link>
        <Link
          to="/dividas"
          className="group flex items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-soft transition-all duration-200 hover:border-primary/40 hover:shadow-elevated"
        >
          <div className="grid h-11 w-11 place-items-center rounded-xl bg-danger/10 text-danger">
            <CreditCard className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-semibold">Dívidas</div>
            <div className="text-xs text-muted-foreground">Acompanhe e priorize</div>
          </div>
          <ArrowUpRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </Link>
      </section>

      <PainelExtras mes={mes} prefs={prefs} />
    </div>
  );
}
