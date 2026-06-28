import { createFileRoute } from "@tanstack/react-router";
import { PiggyBank, Target, CalendarClock, ShieldCheck } from "lucide-react";

import { reserva } from "@/lib/mockData";
import { formatBRL } from "@/lib/format";

export const Route = createFileRoute("/reserva")({
  head: () => ({
    meta: [
      { title: "Reserva de Emergência — Família no Azul" },
      {
        name: "description",
        content: "Acompanhe sua reserva de emergência: meta, valor guardado e meses para atingir.",
      },
    ],
  }),
  component: ReservaPage,
});

function ReservaPage() {
  const pct = Math.min(100, (reserva.guardado / reserva.meta) * 100);
  const falta = Math.max(0, reserva.meta - reserva.guardado);
  const radius = 88;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (pct / 100) * circumference;

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Reserva de Emergência
        </h1>
        <p className="text-sm text-muted-foreground">
          Seu colchão de segurança para imprevistos.
        </p>
      </header>

      {/* Anel grande */}
      <section className="rounded-2xl border border-border bg-card p-6 shadow-soft">
        <div className="flex flex-col items-center">
          <div className="relative h-56 w-56">
            <svg viewBox="0 0 200 200" className="h-full w-full -rotate-90">
              <circle
                cx="100"
                cy="100"
                r={radius}
                fill="none"
                stroke="var(--color-muted)"
                strokeWidth="14"
              />
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
                {formatBRL(reserva.guardado)}
              </div>
              <div className="text-xs text-muted-foreground">
                de {formatBRL(reserva.meta)}
              </div>
              <div className="mt-1 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
                {pct.toFixed(0)}% concluído
              </div>
            </div>
          </div>

          <div className="mt-6 grid w-full grid-cols-3 gap-3">
            <Stat icon={Target} label="Meta" value={formatBRL(reserva.meta)} />
            <Stat icon={ShieldCheck} label="Falta" value={formatBRL(falta)} />
            <Stat
              icon={CalendarClock}
              label="Meses"
              value={`${reserva.mesesParaAtingir}`}
            />
          </div>
        </div>
      </section>

      {/* Configurações */}
      <section className="rounded-2xl border border-border bg-card p-5 shadow-soft">
        <h2 className="text-sm font-semibold">Configuração da meta</h2>
        <p className="text-xs text-muted-foreground">
          Estes campos são apenas visuais nesta etapa.
        </p>

        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <Field
            label="Custo de vida mensal"
            defaultValue={formatBRL(reserva.custoVidaMensal)}
          />
          <Field
            label="Multiplicador (meses)"
            defaultValue={String(reserva.multiplicador)}
          />
          <Field
            label="Aporte mensal"
            defaultValue={formatBRL(reserva.aporteMensal)}
          />
        </div>

        <div className="mt-4 rounded-xl bg-accent/40 p-3 text-xs text-accent-foreground">
          Meta sugerida: <strong className="tabular">{formatBRL(reserva.custoVidaMensal * reserva.multiplicador)}</strong>{" "}
          ({reserva.multiplicador}× o custo de vida mensal).
        </div>
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
      <div className="mt-1 text-[11px] uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
      <div className="tabular mt-0.5 text-sm font-bold">{value}</div>
    </div>
  );
}

function Field({ label, defaultValue }: { label: string; defaultValue: string }) {
  return (
    <label className="block">
      <span className="block text-xs font-medium text-muted-foreground">
        {label}
      </span>
      <input
        defaultValue={defaultValue}
        className="tabular mt-1 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
      />
    </label>
  );
}
