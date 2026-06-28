import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { CheckCircle2, AlertTriangle } from "lucide-react";

import { categorias, distribuicao, resumoMes } from "@/lib/mockData";
import { formatBRL, formatPct } from "@/lib/format";

export const Route = createFileRoute("/metodo")({
  head: () => ({
    meta: [
      { title: "Método 50-30-20 — Família no Azul" },
      {
        name: "description",
        content: "Acompanhe a divisão 50-30-20 da renda familiar entre essenciais, estilo de vida e reserva/dívidas.",
      },
    ],
  }),
  component: MetodoPage,
});

type Modo = "classico" | "previsto";

function MetodoPage() {
  const [modo, setModo] = useState<Modo>("classico");
  const renda = resumoMes.renda;

  const blocos = distribuicao.map((d) => {
    const metaClassica =
      d.nome === "Essenciais"
        ? renda * 0.5
        : d.nome === "Estilo de Vida"
          ? renda * 0.3
          : renda * 0.2;
    return {
      ...d,
      metaUsada: modo === "classico" ? metaClassica : d.meta,
    };
  });

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Método 50-30-20
        </h1>
        <p className="text-sm text-muted-foreground">
          Essenciais, Estilo de Vida e Reserva/Dívidas em equilíbrio.
        </p>
      </header>

      {/* Toggle */}
      <div className="flex items-center justify-between rounded-2xl border border-border bg-card p-3 shadow-soft">
        <div>
          <div className="text-sm font-semibold">Limite</div>
          <div className="text-xs text-muted-foreground">
            Como calcular as metas de cada bloco
          </div>
        </div>
        <div className="inline-flex rounded-xl bg-muted p-1 text-xs font-medium">
          {(
            [
              { id: "classico", label: "% da renda" },
              { id: "previsto", label: "Previsto" },
            ] as const
          ).map((opt) => (
            <button
              key={opt.id}
              onClick={() => setModo(opt.id)}
              className={[
                "rounded-lg px-3 py-1.5 transition-colors",
                modo === opt.id
                  ? "bg-card text-foreground shadow-soft"
                  : "text-muted-foreground hover:text-foreground",
              ].join(" ")}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Barras grandes */}
      <section className="space-y-3">
        {blocos.map((b) => {
          const pct = (b.valor / b.metaUsada) * 100;
          const estourou = pct > 100;
          const atencao = pct > 85 && !estourou;
          const cor = estourou
            ? "var(--color-danger)"
            : atencao
              ? "var(--color-warning)"
              : b.cor;
          const StatusIcon = estourou || atencao ? AlertTriangle : CheckCircle2;
          const label = estourou ? "Estourou" : atencao ? "Atenção" : "OK";
          const badge = estourou
            ? "bg-danger/15 text-danger"
            : atencao
              ? "bg-warning/20 text-warning-foreground"
              : "bg-success/15 text-success";

          return (
            <div
              key={b.nome}
              className="rounded-2xl border border-border bg-card p-5 shadow-soft"
            >
              <div className="mb-2 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-sm font-semibold">{b.nome}</div>
                  <div className="tabular text-xs text-muted-foreground">
                    {formatBRL(b.valor)} de {formatBRL(b.metaUsada)} ·{" "}
                    {formatPct(pct)}
                  </div>
                </div>
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${badge}`}
                >
                  <StatusIcon className="h-3 w-3" />
                  {label}
                </span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full transition-[width] duration-300"
                  style={{
                    width: `${Math.min(100, pct)}%`,
                    backgroundColor: cor,
                  }}
                />
              </div>
            </div>
          );
        })}
      </section>

      {/* Detalhamento */}
      <section className="rounded-2xl border border-border bg-card shadow-soft">
        <div className="border-b border-border p-4">
          <h2 className="text-sm font-semibold">Detalhamento por categoria</h2>
          <p className="text-xs text-muted-foreground">
            Status comparando o real com o previsto.
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-2 font-medium">Categoria</th>
                <th className="px-4 py-2 text-right font-medium">Previsto</th>
                <th className="px-4 py-2 text-right font-medium">Real</th>
                <th className="px-4 py-2 text-right font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {categorias.map((c) => {
                const estourou = c.real > c.previsto;
                return (
                  <tr key={c.id} className="border-t border-border">
                    <td className="px-4 py-3 font-medium">{c.nome}</td>
                    <td className="tabular px-4 py-3 text-right text-muted-foreground">
                      {formatBRL(c.previsto)}
                    </td>
                    <td className="tabular px-4 py-3 text-right">
                      {formatBRL(c.real)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span
                        className={[
                          "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold",
                          estourou
                            ? "bg-danger/15 text-danger"
                            : "bg-success/15 text-success",
                        ].join(" ")}
                      >
                        {estourou ? (
                          <AlertTriangle className="h-3 w-3" />
                        ) : (
                          <CheckCircle2 className="h-3 w-3" />
                        )}
                        {estourou ? "Estourou" : "OK"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
