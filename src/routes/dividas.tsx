import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { CreditCard, Star, Calculator, TrendingDown } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { dividas } from "@/lib/mockData";
import { formatBRL } from "@/lib/format";

export const Route = createFileRoute("/dividas")({
  head: () => ({
    meta: [
      { title: "Dívidas — Família no Azul" },
      {
        name: "description",
        content: "Lista de dívidas familiares, parcelas mensais e prazo para quitação.",
      },
    ],
  }),
  component: DividasPage,
});

function DividasPage() {
  const [open, setOpen] = useState(false);
  const total = dividas.reduce((acc, d) => acc + d.total, 0);
  const parcelaMensal = dividas.reduce((acc, d) => acc + d.parcela, 0);

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Dívidas</h1>
        <p className="text-sm text-muted-foreground">
          Priorize as dívidas mais caras para sair do vermelho mais rápido.
        </p>
      </header>

      {/* Resumo */}
      <section className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-danger/10 text-danger">
              <CreditCard className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Total ativo</div>
              <div className="tabular text-xl font-bold">{formatBRL(total)}</div>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary">
              <TrendingDown className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Parcelas/mês</div>
              <div className="tabular text-xl font-bold">{formatBRL(parcelaMensal)}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Lista */}
      {dividas.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center">
          <p className="text-sm font-semibold">Nenhuma dívida ativa</p>
          <p className="mt-1 text-xs text-muted-foreground">Parabéns! Continue assim.</p>
        </div>
      ) : (
        <section className="space-y-3">
          {dividas.map((d) => (
            <article
              key={d.id}
              className={[
                "rounded-2xl border bg-card p-4 shadow-soft transition-colors",
                d.prioridade
                  ? "border-primary/40 ring-1 ring-primary/20"
                  : "border-border",
              ].join(" ")}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="truncate text-sm font-semibold sm:text-base">
                      {d.nome}
                    </h3>
                    {d.prioridade && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
                        <Star className="h-3 w-3 fill-current" />
                        Prioridade
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {d.mesesRestantes} meses para quitar
                  </p>
                </div>
                <div className="text-right">
                  <div className="tabular text-base font-bold sm:text-lg">
                    {formatBRL(d.total)}
                  </div>
                  <div className="tabular text-xs text-muted-foreground">
                    {formatBRL(d.parcela)}/mês
                  </div>
                </div>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-[width] duration-300"
                  style={{
                    width: `${Math.max(5, 100 - (d.mesesRestantes / 36) * 100)}%`,
                  }}
                />
              </div>
            </article>
          ))}
        </section>
      )}

      <button
        onClick={() => setOpen(true)}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-soft transition-colors hover:bg-primary-glow sm:w-auto"
      >
        <Calculator className="h-4 w-4" />
        Simular quitação
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Simulador de quitação</DialogTitle>
            <DialogDescription>
              Em breve: simule aportes extras e veja o impacto no prazo final.
              (Placeholder — lógica será conectada ao Supabase.)
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-xl border border-dashed border-border p-6 text-center text-xs text-muted-foreground">
            Esta visualização ainda não calcula valores reais.
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
