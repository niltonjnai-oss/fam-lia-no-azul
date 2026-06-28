import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PiggyBank, Target, CalendarClock, ShieldCheck, Save } from "lucide-react";

import { qk, fetchReservaConfig, atualizarReservaConfig } from "@/lib/db";
import { formatBRL } from "@/lib/format";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/EmptyState";

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

function ReservaPage() {
  const reservaQ = useQuery({ queryKey: qk.reserva, queryFn: fetchReservaConfig });
  const qc = useQueryClient();

  const r = reservaQ.data;

  const [custo, setCusto] = useState("");
  const [mult, setMult] = useState("");
  const [guardado, setGuardado] = useState("");
  const [aporte, setAporte] = useState("");

  useEffect(() => {
    if (!r) return;
    setCusto(String(r.custo_vida_mensal));
    setMult(String(r.multiplicador));
    setGuardado(String(r.valor_guardado));
    setAporte(String(r.aporte_mensal));
  }, [r]);

  const mut = useMutation({
    mutationFn: () =>
      atualizarReservaConfig(r!.id, {
        custo_vida_mensal: Number(custo) || 0,
        multiplicador: Number(mult) || 0,
        valor_guardado: Number(guardado) || 0,
        aporte_mensal: Number(aporte) || 0,
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.reserva }),
  });

  if (reservaQ.isLoading) {
    return (
      <div className="space-y-5">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-80 w-full rounded-2xl" />
        <Skeleton className="h-48 w-full rounded-2xl" />
      </div>
    );
  }

  if (!r) {
    return (
      <div className="space-y-5">
        <header>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Reserva de Emergência</h1>
        </header>
        <EmptyState
          title="Configuração da reserva não encontrada"
          description="Complete o onboarding para criar sua linha de configuração."
        />
      </div>
    );
  }

  const progresso = Number(r.progresso);
  const pct = Math.min(100, progresso * 100);
  const radius = 88;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (pct / 100) * circumference;
  const mesesTxt =
    r.meses_para_meta === null ? "Sem aporte" : `${r.meses_para_meta}`;

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Reserva de Emergência</h1>
        <p className="text-sm text-muted-foreground">Seu colchão de segurança para imprevistos.</p>
      </header>

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
                {formatBRL(Number(r.valor_guardado))}
              </div>
              <div className="text-xs text-muted-foreground">
                de {formatBRL(Number(r.meta_reserva))}
              </div>
              <div className="mt-1 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
                {pct.toFixed(0)}% concluído
              </div>
            </div>
          </div>

          <div className="mt-6 grid w-full grid-cols-3 gap-3">
            <Stat icon={Target} label="Meta" value={formatBRL(Number(r.meta_reserva))} />
            <Stat icon={ShieldCheck} label="Falta" value={formatBRL(Number(r.falta_para_meta))} />
            <Stat icon={CalendarClock} label="Meses" value={mesesTxt} />
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card p-5 shadow-soft">
        <h2 className="text-sm font-semibold">Configuração da meta</h2>
        <p className="text-xs text-muted-foreground">
          A meta e demais cálculos atualizam automaticamente após salvar.
        </p>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label="Custo de vida mensal" value={custo} onChange={setCusto} />
          <Field label="Multiplicador (meses)" value={mult} onChange={setMult} />
          <Field label="Valor guardado" value={guardado} onChange={setGuardado} />
          <Field label="Aporte mensal" value={aporte} onChange={setAporte} />
        </div>

        <div className="mt-4 flex justify-end">
          <Button onClick={() => mut.mutate()} disabled={mut.isPending}>
            <Save className="h-4 w-4" />
            Salvar
          </Button>
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
