// Card do painel: quanto a família gastou no mês por forma de pagamento
// (Dinheiro, Débito, Crédito, Pix). Depende do gasto ter sido anotado com a
// forma escolhida; gastos sem forma entram em "Não informado".

import { useQuery } from "@tanstack/react-query";
import { Banknote, CreditCard, Landmark, Smartphone, HelpCircle } from "lucide-react";
import type { ComponentType } from "react";

import { qk, fetchResumoFormaPagamento } from "@/lib/db";
import { formatBRL } from "@/lib/format";
import { Skeleton } from "@/components/ui/skeleton";

const LINHAS: { chave: keyof ResumoView; label: string; Icon: ComponentType<{ className?: string }>; tint: string }[] = [
  { chave: "dinheiro", label: "Dinheiro", Icon: Banknote, tint: "bg-success/10 text-success" },
  { chave: "debito", label: "Cartão de débito", Icon: Landmark, tint: "bg-primary/10 text-primary" },
  { chave: "credito", label: "Cartão de crédito", Icon: CreditCard, tint: "bg-danger/10 text-danger" },
  { chave: "pix", label: "Pix", Icon: Smartphone, tint: "bg-cta/10 text-cta" },
  { chave: "naoInformado", label: "Não informado", Icon: HelpCircle, tint: "bg-muted text-muted-foreground" },
];

type ResumoView = {
  dinheiro: number;
  debito: number;
  credito: number;
  pix: number;
  naoInformado: number;
};

export function ComoPagou({ mes }: { mes: string }) {
  const resumoQ = useQuery({
    queryKey: qk.formaPagamento(mes),
    queryFn: () => fetchResumoFormaPagamento(mes),
  });

  const r = resumoQ.data;
  const total = r ? r.dinheiro + r.debito + r.credito + r.pix + r.naoInformado : 0;

  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-soft">
      <h2 className="text-sm font-semibold">Como você pagou este mês</h2>
      <p className="text-xs text-muted-foreground">O total de gastos separado por forma de pagamento.</p>

      {resumoQ.isLoading ? (
        <div className="mt-4 space-y-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ) : total === 0 ? (
        <p className="mt-4 rounded-xl bg-muted/40 px-3 py-3 text-xs text-muted-foreground">
          Anote seus gastos escolhendo a forma de pagamento pra ver o resumo aqui. 💙
        </p>
      ) : (
        <ul className="mt-4 space-y-1.5">
          {LINHAS.filter((l) => (r?.[l.chave] ?? 0) > 0).map((l) => {
            const valor = r?.[l.chave] ?? 0;
            const pct = total > 0 ? Math.round((valor / total) * 100) : 0;
            return (
              <li key={l.chave} className="flex items-center gap-3 py-1">
                <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${l.tint}`}>
                  <l.Icon className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-sm font-medium">{l.label}</span>
                    <span className="tabular shrink-0 text-sm font-semibold">{formatBRL(valor)}</span>
                  </div>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary/50"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
