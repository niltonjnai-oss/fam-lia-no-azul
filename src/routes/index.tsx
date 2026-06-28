import { createFileRoute, Link } from "@tanstack/react-router";
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
  Flame,
  PiggyBank,
  CreditCard,
  Trophy,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

import { resumoMes, distribuicao, conquistas } from "@/lib/mockData";
import { formatBRL, formatPct } from "@/lib/format";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Painel — Família no Azul" },
      {
        name: "description",
        content: "Resumo do mês: renda, gastos, saldo, método 50-30-20 e conquistas da família.",
      },
    ],
  }),
  component: PainelPage,
});

type Status = "ok" | "atencao" | "estourou";
const statusLabel: Record<Status, string> = {
  ok: "OK",
  atencao: "Atenção",
  estourou: "Acima do limite",
};
const statusClasses: Record<Status, string> = {
  ok: "bg-success/15 text-success",
  atencao: "bg-warning/20 text-warning-foreground",
  estourou: "bg-danger/15 text-danger",
};
const statusIcon: Record<Status, typeof CheckCircle2> = {
  ok: CheckCircle2,
  atencao: AlertTriangle,
  estourou: AlertTriangle,
};

function getStatus(real: number, meta: number): Status {
  const pct = (real / meta) * 100;
  if (pct > 100) return "estourou";
  if (pct > 85) return "atencao";
  return "ok";
}

function PainelPage() {
  const totalRenda = resumoMes.renda;
  const cards = [
    {
      label: "Renda",
      valor: resumoMes.renda,
      Icon: ArrowUpRight,
      tone: "text-success",
      bg: "bg-success/10",
    },
    {
      label: "Gastos",
      valor: resumoMes.gastos,
      Icon: ArrowDownRight,
      tone: "text-danger",
      bg: "bg-danger/10",
    },
    {
      label: "Saldo",
      valor: resumoMes.saldo,
      Icon: Sparkles,
      tone: "text-primary",
      bg: "bg-primary/10",
    },
  ];

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="text-sm text-muted-foreground">{resumoMes.mes}</p>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Olá, família!
          </h1>
        </div>
        <Link
          to="/onboarding"
          className="text-xs font-medium text-primary hover:underline"
        >
          Refazer onboarding
        </Link>
      </header>

      {/* Resumo cards */}
      <section className="grid grid-cols-3 gap-3">
        {cards.map(({ label, valor, Icon, tone, bg }) => (
          <div
            key={label}
            className="rounded-2xl border border-border bg-card p-3 shadow-soft sm:p-4"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground sm:text-sm">
                {label}
              </span>
              <span className={`grid h-7 w-7 place-items-center rounded-lg ${bg}`}>
                <Icon className={`h-4 w-4 ${tone}`} />
              </span>
            </div>
            <div className="tabular mt-2 text-base font-bold sm:text-xl">
              {formatBRL(valor)}
            </div>
          </div>
        ))}
      </section>

      {/* Gamificação */}
      <section className="flex items-center gap-3 rounded-2xl border border-border bg-gradient-to-r from-primary/8 to-primary-glow/8 p-4">
        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-warning/20">
          <Flame className="h-6 w-6 text-warning-foreground" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold">
            {conquistas.streakMeses} meses no azul seguidos
          </div>
          <div className="text-xs text-muted-foreground">
            Continue revisando o orçamento toda semana.
          </div>
        </div>
        <div className="hidden items-center gap-1 sm:flex">
          {conquistas.badges.map((b) => (
            <span
              key={b.id}
              title={b.titulo}
              className={[
                "grid h-9 w-9 place-items-center rounded-xl border",
                b.ativo
                  ? "border-primary/30 bg-primary/10 text-primary"
                  : "border-border bg-muted text-muted-foreground opacity-50",
              ].join(" ")}
            >
              <Trophy className="h-4 w-4" />
            </span>
          ))}
        </div>
      </section>

      {/* Donut + 50-30-20 */}
      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
          <h2 className="text-sm font-semibold">Divisão por classificação</h2>
          <p className="text-xs text-muted-foreground">
            Como sua renda foi alocada este mês.
          </p>
          <div className="mt-3 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={distribuicao}
                  dataKey="valor"
                  nameKey="nome"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={2}
                  stroke="var(--color-background)"
                  strokeWidth={3}
                >
                  {distribuicao.map((d) => (
                    <Cell key={d.nome} fill={d.cor} />
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
                <Legend
                  iconType="circle"
                  wrapperStyle={{ fontSize: 12, color: "var(--color-muted-foreground)" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
          <h2 className="text-sm font-semibold">Método 50-30-20</h2>
          <p className="text-xs text-muted-foreground">
            Compare o realizado vs. a meta de cada bloco.
          </p>
          <div className="mt-4 space-y-4">
            {distribuicao.map((d) => {
              const pct = Math.min(150, (d.valor / d.meta) * 100);
              const status = getStatus(d.valor, d.meta);
              const StatusIcon = statusIcon[status];
              return (
                <div key={d.nome}>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="font-medium">{d.nome}</span>
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${statusClasses[status]}`}
                    >
                      <StatusIcon className="h-3 w-3" />
                      {statusLabel[status]}
                    </span>
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full transition-[width] duration-300"
                      style={{
                        width: `${Math.min(100, pct)}%`,
                        backgroundColor: d.cor,
                      }}
                    />
                  </div>
                  <div className="tabular mt-1 flex justify-between text-[11px] text-muted-foreground">
                    <span>{formatBRL(d.valor)}</span>
                    <span>meta {formatBRL(d.meta)} · {formatPct((d.meta / totalRenda) * 100)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Atalhos */}
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
    </div>
  );
}
