import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Component, useEffect, useState, type ErrorInfo, type ReactNode } from "react";
import {
  Cell,
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
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Settings2,
} from "lucide-react";

import {
  qk,
  fetchRenda,
  fetchResumoMensal,
  fetch503020,
  fetchGastosMes,
  formatMes,
  shiftMes,
  type Classificacao,
} from "@/lib/db";
import { useMes } from "@/lib/mes-context";
import { useAuth } from "@/lib/auth-context";

import { formatBRL, formatPct } from "@/lib/format";
import { Skeleton } from "@/components/ui/skeleton";
import {
  PersonalizarPainelSheet,
  PainelExtras,
  usePainelPrefs,
} from "@/components/PainelExtras";
import { LancamentoRapido } from "@/components/LancamentoRapido";
import { ProjecaoMes, DiasNoAzul } from "@/components/PainelInsights";
import { InstalarAppCard } from "@/components/InstalarAppCard";
import { DespesasFixasDisponivel } from "@/components/DespesasFixasDisponivel";

import { PageTitle } from "@/components/PageTitle";

export const Route = createFileRoute("/app")({
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
  return s === "ok" ? "OK" : s === "acima" ? "Passou do limite" : "Dá pra guardar mais";
}
function statusClasses(s: Status): string {
  return s === "ok"
    ? "bg-success/15 text-success"
    : s === "acima"
      ? "bg-danger/15 text-danger"
      : "bg-warning/20 text-warning-foreground";
}

function isClassificacao(value: unknown): value is Classificacao {
  return value === "Essencial" || value === "Estilo de Vida" || value === "Reserva/Dívidas";
}

function numeroSeguro(value: unknown): number {
  const n = Number(value ?? 0);
  return Number.isFinite(n) ? n : 0;
}

function DashboardSectionError({ titulo }: { titulo: string }) {
  return (
    <section className="rounded-2xl border border-warning/30 bg-warning/10 p-4 text-sm shadow-soft">
      <div className="font-semibold text-foreground">{titulo}</div>
      <p className="mt-1 text-xs text-muted-foreground">
        Atualize a página ou continue usando as outras áreas do painel.
      </p>
    </section>
  );
}

class DashboardSectionBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown, info: ErrorInfo) {
    console.error("Erro em seção do dashboard", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}

/** Data e hora atuais, atualizadas a cada minuto — dá noção de "agora" no painel. */
function useAgora(): Date {
  const [agora, setAgora] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setAgora(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);
  return agora;
}

function formatDataHoraAgora(d: Date): string {
  const data = d.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
  const hora = d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  return `${data.charAt(0).toUpperCase()}${data.slice(1)} · ${hora}`;
}

function PainelPage() {
  const { mes, setMes } = useMes();
  const { user } = useAuth();
  const [personalizarOpen, setPersonalizarOpen] = useState(false);
  const agora = useAgora();
  const primeiroNome = (
    (user?.user_metadata as { full_name?: string } | undefined)?.full_name ?? ""
  )
    .trim()
    .split(" ")[0];

  const rendaQ = useQuery({ queryKey: qk.renda(mes), queryFn: () => fetchRenda(mes) });
  const resumoQ = useQuery({ queryKey: qk.resumo(mes), queryFn: () => fetchResumoMensal(mes) });
  const gastosQ = useQuery({ queryKey: qk.gastosMes(mes), queryFn: () => fetchGastosMes(mes) });
  const blocosQ = useQuery({ queryKey: qk.bloco503020(mes), queryFn: () => fetch503020(mes) });

  const { prefs, setPrefs } = usePainelPrefs();

  const carregando = rendaQ.isLoading || resumoQ.isLoading || gastosQ.isLoading || blocosQ.isLoading;

  const rendaRows = Array.isArray(rendaQ.data) ? rendaQ.data : [];
  const blocos = (Array.isArray(blocosQ.data) ? blocosQ.data : []).filter((b) =>
    isClassificacao(b.classificacao),
  );

  const rendaTotal = rendaRows.reduce((acc, r) => acc + numeroSeguro(r.valor), 0);
  const gastosTotal = numeroSeguro(gastosQ.data?.total_comprometido);
  const saldo = rendaTotal - gastosTotal;

  const orcamentoVazio =
    !carregando &&
    Number(resumoQ.data?.total_previsto ?? 0) === 0 &&
    Number(resumoQ.data?.total_real ?? 0) === 0;

  return (
    <div className="space-y-4">
      <header className="space-y-3">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <PageTitle>{primeiroNome ? `Olá, ${primeiroNome}!` : "Olá, família!"}</PageTitle>
            <p className="text-xs text-muted-foreground">{formatDataHoraAgora(agora)}</p>
          </div>
          <div className="flex items-center gap-0.5 rounded-full border border-border bg-card p-1 shadow-soft">
            <button
              type="button"
              onClick={() => setMes(shiftMes(mes, -1))}
              className="grid h-8 w-8 place-items-center rounded-full hover:bg-muted"
              aria-label="Mês anterior"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="tabular px-1 text-xs font-semibold">{formatMes(mes)}</span>
            <button
              type="button"
              onClick={() => setMes(shiftMes(mes, 1))}
              className="grid h-8 w-8 place-items-center rounded-full hover:bg-muted"
              aria-label="Próximo mês"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setPersonalizarOpen(true)}
            className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-xs font-medium hover:bg-muted"
          >
            <Settings2 className="h-4 w-4" />
            Personalizar
          </button>
          <Link
            to="/onboarding"
            className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-medium text-primary-foreground hover:bg-primary/90"
          >
            <RotateCcw className="h-4 w-4" />
            Refazer meu orçamento
          </Link>
        </div>
      </header>

      <PersonalizarPainelSheet
        open={personalizarOpen}
        onOpenChange={setPersonalizarOpen}
        prefs={prefs}
        setPrefs={setPrefs}
      />

      <section
        className="rounded-2xl p-5 text-white shadow-soft"
        style={{ background: "linear-gradient(135deg, #0F2A47 0%, #1E4A78 100%)" }}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-white/70">Livre pra gastar</span>
          <span className="rounded-full bg-white/15 px-2 py-0.5 text-[11px] font-semibold">
            {saldo >= 0 ? "No azul" : "Atenção"}
          </span>
        </div>
        <div className="tabular mt-1 text-3xl font-bold sm:text-4xl">
          {carregando ? <Skeleton className="h-9 w-40 bg-white/10" /> : formatBRL(saldo)}
        </div>
        <div className="mt-3 flex items-center gap-4 text-xs text-white/70">
          <span className="flex items-center gap-1">
            <ArrowUpRight className="h-3.5 w-3.5" /> Renda {formatBRL(rendaTotal)}
          </span>
          <span className="flex items-center gap-1">
            <ArrowDownRight className="h-3.5 w-3.5" /> Gastos {formatBRL(gastosTotal)}
          </span>
        </div>
      </section>

      <InstalarAppCard />

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
              Monte seu orçamento inicial em apenas 1 minuto.
            </div>
          </div>
          <ArrowUpRight className="h-4 w-4 text-primary" />
        </Link>
      )}

      <DashboardSectionBoundary
        fallback={<DashboardSectionError titulo="Não foi possível carregar os insights do mês." />}
      >
        <section className="grid gap-3 sm:grid-cols-2">
          <ProjecaoMes
            mes={mes}
            totalReal={numeroSeguro(gastosQ.data?.total_real)}
            totalPrevisto={numeroSeguro(resumoQ.data?.total_previsto)}
            rendaTotal={rendaTotal}
            carregando={carregando}
          />
          <DiasNoAzul />
        </section>
      </DashboardSectionBoundary>

      <DashboardSectionBoundary
        fallback={<DashboardSectionError titulo="Não foi possível carregar o lançamento rápido." />}
      >
        <LancamentoRapido />
      </DashboardSectionBoundary>


      <DashboardSectionBoundary
        fallback={<DashboardSectionError titulo="Não foi possível carregar despesas fixas." />}
      >
        <DespesasFixasDisponivel mes={mes} />
      </DashboardSectionBoundary>

      <DashboardSectionBoundary
        fallback={<DashboardSectionError titulo="Não foi possível carregar os gráficos do mês." />}
      >
      <section className="rounded-2xl border border-border bg-card p-5 shadow-soft">
        <h2 className="text-sm font-semibold">Para onde foi seu dinheiro</h2>
        <p className="text-xs text-muted-foreground">Veja a divisão e se cada parte está dentro do combinado.</p>
        <div className="mt-4 grid gap-5 sm:grid-cols-2 sm:items-center">
          <div>
            <div className="h-40" role="img" aria-label={
              (() => {
                const total = blocos.reduce((a, b) => a + numeroSeguro(b.realizado), 0);
                if (total === 0) return "Sem gastos registrados neste mês.";
                return "Divisão por classificação: " + blocos.map((b) => {
                  const v = numeroSeguro(b.realizado);
                  const pct = total > 0 ? Math.round((v / total) * 100) : 0;
                  return `${b.classificacao} ${formatBRL(v)} (${pct}%)`;
                }).join(", ") + ".";
              })()
            }>
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
                        valor: numeroSeguro(b.realizado),
                        cor: CHART_COLORS[b.classificacao],
                      }))}
                      dataKey="valor"
                      nameKey="nome"
                      innerRadius={42}
                      outerRadius={64}
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
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
            {!carregando && blocos.some((b) => Number(b.realizado) > 0) && (
              <ul className="mt-2 flex flex-wrap justify-center gap-x-3 gap-y-1 text-[11px]">
                {blocos.map((b) => (
                  <li key={b.classificacao} className="flex items-center gap-1.5">
                    <span
                      className="inline-block h-2 w-2 rounded-full"
                      style={{ backgroundColor: CHART_COLORS[b.classificacao] }}
                      aria-hidden="true"
                    />
                    <span className="text-muted-foreground">{b.classificacao}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="space-y-3">
            {(["Essencial", "Estilo de Vida", "Reserva/Dívidas"] as Classificacao[]).map((cls) => {
              const linha = blocos.find((b) => b.classificacao === cls);
              const realizado = numeroSeguro(linha?.realizado);
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
                      até {formatBRL(limite)} · {formatPct(LIMITE_PCT[cls] * 100)} da renda
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
      </DashboardSectionBoundary>

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

      <DashboardSectionBoundary
        fallback={<DashboardSectionError titulo="Não foi possível carregar os cards extras." />}
      >
        <PainelExtras mes={mes} prefs={prefs} />
      </DashboardSectionBoundary>
    </div>
  );
}
