import { useMemo } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Wallet, ArrowUpRight, Sparkles, Info } from "lucide-react";

import {
  qk,
  fetchLancamentos,
  fetchSubitens,
  fetchCategorias,
} from "@/lib/db";
import { formatBRL } from "@/lib/format";
import { Skeleton } from "@/components/ui/skeleton";

export function DespesasFixasDisponivel({ mes }: { mes: string }) {
  const lancsQ = useQuery({ queryKey: qk.lancamentos(mes), queryFn: () => fetchLancamentos(mes) });
  const subsQ = useQuery({ queryKey: qk.subitens, queryFn: fetchSubitens });
  const catsQ = useQuery({ queryKey: qk.categorias, queryFn: fetchCategorias });

  const carregando = lancsQ.isLoading || subsQ.isLoading || catsQ.isLoading;

  const fixas = useMemo(() => {
    const subById = new Map<string, { nome: string; categoria_id: string }>();
    for (const s of subsQ.data ?? []) subById.set(s.id, { nome: s.nome, categoria_id: s.categoria_id });
    const catById = new Map<string, string>();
    for (const c of catsQ.data ?? []) catById.set(c.id, c.nome);

    return (lancsQ.data ?? [])
      .filter((l) => Number(l.custo_previsto) > 0)
      .map((l) => {
        const sub = subById.get(l.subitem_id);
        return {
          id: l.id,
          nome: sub?.nome ?? "—",
          categoria: sub ? (catById.get(sub.categoria_id) ?? "—") : "—",
          previsto: Number(l.custo_previsto),
        };
      })
      .sort((a, b) => b.previsto - a.previsto);
  }, [lancsQ.data, subsQ.data, catsQ.data]);

  const top = fixas.slice(0, 5);
  const restante = Math.max(0, fixas.length - top.length);

  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-soft">
      <header className="mb-3 flex items-center gap-2">
        <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary/10 text-primary">
          <Wallet className="h-4 w-4" />
        </span>
        <div className="min-w-0">
          <h2 className="text-sm font-semibold">Despesas fixas</h2>
          <p className="text-xs text-muted-foreground">
            O que já está comprometido este mês.
          </p>
        </div>
      </header>

      <div>
        {fixas.length > 0 && (
          <div className="mb-2 flex justify-end">
            <Link
              to="/orcamento"
              className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
            >
              Ver todas <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
        )}

        {carregando ? (
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : fixas.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-background/40 p-4 text-center">
            <p className="text-sm font-medium">Você ainda não anotou suas contas fixas (aluguel, luz, internet...)</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Monte seu orçamento inicial em apenas 1 minuto.
            </p>
            <Link
              to="/onboarding"
              className="mt-3 inline-flex h-10 items-center gap-1.5 rounded-lg bg-primary px-4 text-xs font-semibold text-primary-foreground hover:bg-primary/90"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Começar
            </Link>
          </div>
        ) : (
          <>
            <ul className="space-y-1.5">
              {top.map((f) => (
                <li
                  key={f.id}
                  className="flex items-center gap-2 rounded-xl border border-border/60 bg-background/60 px-3 py-2"
                >
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">{f.nome}</div>
                    <div className="truncate text-[11px] text-muted-foreground">{f.categoria}</div>
                  </div>
                  <span className="tabular shrink-0 text-sm font-semibold">
                    {formatBRL(f.previsto)}
                  </span>
                </li>
              ))}
            </ul>
            {restante > 0 && (
              <Link
                to="/orcamento"
                className="mt-2 block text-center text-xs font-medium text-primary hover:underline"
              >
                + {restante} {restante === 1 ? "outra despesa fixa" : "outras despesas fixas"}
              </Link>
            )}
          </>
        )}
      </div>

      {fixas.length > 0 && (
        <p className="mt-3 flex items-start gap-1.5 text-[11px] text-muted-foreground">
          <Info className="mt-0.5 h-3 w-3 shrink-0" />
          <span>Cada gasto que você registra reduz o valor livre pra gastar.</span>
        </p>
      )}
    </section>
  );
}
