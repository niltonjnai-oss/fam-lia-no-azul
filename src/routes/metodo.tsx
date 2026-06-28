import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, AlertTriangle, HelpCircle, ArrowUp } from "lucide-react";

import {
  qk,
  fetch503020,
  fetchRenda,
  fetchCategorias,
  fetchSubitens,
  fetchLancamentos,
  type Classificacao,
} from "@/lib/db";
import { useMes } from "@/lib/mes-context";
import { formatBRL, formatPct } from "@/lib/format";
import { MesSelector } from "@/components/MesSelector";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/metodo")({
  head: () => ({
    meta: [
      { title: "Método 50-30-20 — Família no Azul" },
      {
        name: "description",
        content:
          "Divisão 50-30-20 da renda familiar entre essenciais, estilo de vida e reserva/dívidas.",
      },
    ],
  }),
  component: MetodoPage,
});

type Modo = "classico" | "previsto";

const ORDEM: Classificacao[] = ["Essencial", "Estilo de Vida", "Reserva/Dívidas"];
const LIMITE_PCT: Record<Classificacao, number> = {
  Essencial: 0.5,
  "Estilo de Vida": 0.3,
  "Reserva/Dívidas": 0.2,
};
const COR: Record<Classificacao, string> = {
  Essencial: "var(--color-chart-1)",
  "Estilo de Vida": "var(--color-chart-2)",
  "Reserva/Dívidas": "var(--color-chart-3)",
};

function statusFor(cls: Classificacao, pctRenda: number): { label: string; ok: boolean } {
  if (cls === "Reserva/Dívidas") {
    return pctRenda < 0.2 ? { label: "Abaixo da Meta", ok: false } : { label: "OK", ok: true };
  }
  const limite = LIMITE_PCT[cls];
  return pctRenda > limite
    ? { label: "Acima do Limite", ok: false }
    : { label: "OK", ok: true };
}

function MetodoPage() {
  const { mes } = useMes();
  const [modo, setModo] = useState<Modo>("classico");
  const explicacaoRef = useRef<HTMLDivElement>(null);
  const topoRef = useRef<HTMLDivElement>(null);

  const scrollToExplicacao = () => {
    explicacaoRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  const scrollToTopo = () => {
    topoRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const blocosQ = useQuery({ queryKey: qk.bloco503020(mes), queryFn: () => fetch503020(mes) });
  const rendaQ = useQuery({ queryKey: qk.renda(mes), queryFn: () => fetchRenda(mes) });
  const catsQ = useQuery({ queryKey: qk.categorias, queryFn: fetchCategorias });
  const subsQ = useQuery({ queryKey: qk.subitens, queryFn: fetchSubitens });
  const lancsQ = useQuery({ queryKey: qk.lancamentos(mes), queryFn: () => fetchLancamentos(mes) });

  const carregando =
    blocosQ.isLoading || rendaQ.isLoading || catsQ.isLoading || subsQ.isLoading || lancsQ.isLoading;

  const rendaTotal = (rendaQ.data ?? []).reduce((a, r) => a + Number(r.valor), 0);

  const porClassificacao = useMemo(() => {
    const m = new Map<Classificacao, { previsto: number; realizado: number }>();
    (blocosQ.data ?? []).forEach((b) =>
      m.set(b.classificacao, {
        previsto: Number(b.previsto),
        realizado: Number(b.realizado),
      }),
    );
    return m;
  }, [blocosQ.data]);

  // Detalhamento por categoria
  const detalhamento = useMemo(() => {
    const subsById = new Map((subsQ.data ?? []).map((s) => [s.id, s]));
    const acc = new Map<string, { nome: string; previsto: number; real: number }>();
    (catsQ.data ?? []).forEach((c) => acc.set(c.id, { nome: c.nome, previsto: 0, real: 0 }));
    (lancsQ.data ?? []).forEach((l) => {
      const s = subsById.get(l.subitem_id);
      if (!s) return;
      const row = acc.get(s.categoria_id);
      if (!row) return;
      row.previsto += Number(l.custo_previsto);
      row.real += Number(l.custo_real);
    });
    return Array.from(acc.values());
  }, [catsQ.data, subsQ.data, lancsQ.data]);

  return (
    <div className="space-y-5">
      <div ref={topoRef}>
        <header>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Método 50-30-20</h1>
          <p className="text-sm text-muted-foreground">
            Essenciais, Estilo de Vida e Reserva/Dívidas em equilíbrio.
          </p>
        </header>

        <button
          onClick={scrollToExplicacao}
          className="mt-3 inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-primary/10 px-4 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary/20"
        >
          <HelpCircle className="h-4 w-4" />
          O que é 50-30-20?
        </button>
      </div>

      <MesSelector />

      <div className="flex items-center justify-between rounded-2xl border border-border bg-card p-3 shadow-soft">
        <div>
          <div className="text-sm font-semibold">Limite</div>
          <div className="text-xs text-muted-foreground">Como calcular o limite mostrado</div>
        </div>
        <div className="inline-flex rounded-xl bg-muted p-1 text-xs font-medium">
          {([
            { id: "classico", label: "% da renda" },
            { id: "previsto", label: "Previsto" },
          ] as const).map((opt) => (
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

      <section className="space-y-3">
        {carregando
          ? [1, 2, 3].map((i) => <Skeleton key={i} className="h-24 w-full rounded-2xl" />)
          : ORDEM.map((cls) => {
              const linha = porClassificacao.get(cls) ?? { previsto: 0, realizado: 0 };
              const limite =
                modo === "classico" ? rendaTotal * LIMITE_PCT[cls] : linha.previsto;
              const pctRenda = rendaTotal > 0 ? linha.realizado / rendaTotal : 0;
              const st = statusFor(cls, pctRenda);
              const widthPct = limite > 0 ? Math.min(100, (linha.realizado / limite) * 100) : 0;
              const Icon = st.ok ? CheckCircle2 : AlertTriangle;
              const badge = st.ok
                ? "bg-success/15 text-success"
                : cls === "Reserva/Dívidas"
                  ? "bg-warning/20 text-warning-foreground"
                  : "bg-danger/15 text-danger";
              return (
                <div key={cls} className="rounded-2xl border border-border bg-card p-5 shadow-soft">
                  <div className="mb-2 flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-sm font-semibold">{cls}</div>
                      <div className="tabular text-xs text-muted-foreground">
                        {formatBRL(linha.realizado)} de {formatBRL(limite)} ·{" "}
                        {formatPct(pctRenda * 100)} da renda
                      </div>
                    </div>
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${badge}`}
                    >
                      <Icon className="h-3 w-3" />
                      {st.label}
                    </span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full transition-[width] duration-300"
                      style={{ width: `${widthPct}%`, backgroundColor: COR[cls] }}
                    />
                  </div>
                </div>
              );
            })}
      </section>

      <section className="rounded-2xl border border-border bg-card shadow-soft">
        <div className="border-b border-border p-4">
          <h2 className="text-sm font-semibold">Detalhamento por categoria</h2>
          <p className="text-xs text-muted-foreground">
            Status comparando o real com o previsto.
          </p>
        </div>
        {detalhamento.length === 0 ? (
          <p className="p-6 text-center text-xs text-muted-foreground">
            Sem categorias cadastradas ainda.
          </p>
        ) : (
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
                {detalhamento.map((c) => {
                  const estourou = c.real > c.previsto;
                  return (
                    <tr key={c.nome} className="border-t border-border">
                      <td className="px-4 py-3 font-medium">{c.nome}</td>
                      <td className="tabular px-4 py-3 text-right text-muted-foreground">
                        {formatBRL(c.previsto)}
                      </td>
                      <td className="tabular px-4 py-3 text-right">{formatBRL(c.real)}</td>
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
        )}
      </section>
    </div>
  );
}
