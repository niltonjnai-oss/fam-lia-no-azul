// Cards de insight do Painel: projeção de fim de mês e streak "Dias no Azul".
// Ambos usam só dados que o app já grava — nenhuma tabela nova.

import { useQuery } from "@tanstack/react-query";
import { Flame, TrendingUp, TrendingDown, ArrowDown, ArrowUp } from "lucide-react";

import { qk, fetchDiasComRegistro, fetchGastosMes, hojeISO, mesAtual, shiftMes } from "@/lib/db";
import { formatBRL } from "@/lib/format";
import { Skeleton } from "@/components/ui/skeleton";

/** Projeção de fim de mês no ritmo atual de gastos (só para o mês corrente). */
export function ProjecaoMes({
  mes,
  totalReal,
  totalPrevisto,
  rendaTotal,
  carregando,
}: {
  mes: string;
  totalReal: number;
  totalPrevisto: number;
  rendaTotal: number;
  carregando: boolean;
}) {
  const mesAnterior = shiftMes(mes, -1);
  const gastosAnteriorQ = useQuery({
    queryKey: qk.gastosMes(mesAnterior),
    queryFn: () => fetchGastosMes(mesAnterior),
    enabled: mes === mesAtual(),
  });

  if (mes !== mesAtual()) return null;

  const hoje = new Date();
  const diaAtual = hoje.getDate();
  const diasNoMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0).getDate();
  const projecao = diaAtual > 0 ? (totalReal / diaAtual) * diasNoMes : 0;

  // Tendência: projeção deste mês vs total gasto no mês passado.
  const totalMesAnterior = Number(gastosAnteriorQ.data?.total_comprometido ?? 0);
  const temTendencia = totalMesAnterior > 0 && totalReal > 0;
  const variacaoPct = temTendencia
    ? Math.round(((projecao - totalMesAnterior) / totalMesAnterior) * 100)
    : 0;
  const gastandoMenos = variacaoPct <= 0;

  // Base de comparação: o orçamento previsto; se ainda não houver, a renda.
  const base = totalPrevisto > 0 ? totalPrevisto : rendaTotal;
  const baseLabel = totalPrevisto > 0 ? "do previsto" : "da renda";
  const dentro = base <= 0 || projecao <= base;
  const delta = Math.abs(base - projecao);
  const inicioDoMes = diaAtual <= 3;

  return (
    <div className="rounded-2xl border border-border bg-card p-3 shadow-soft">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">Previsão do mês</span>
        <span
          className={`grid h-6 w-6 place-items-center rounded-lg ${dentro ? "bg-success/10" : "bg-danger/10"}`}
        >
          {dentro ? (
            <TrendingUp className="h-3.5 w-3.5 text-success" />
          ) : (
            <TrendingDown className="h-3.5 w-3.5 text-danger" />
          )}
        </span>
      </div>
      {carregando ? (
        <Skeleton className="mt-2 h-9 w-full" />
      ) : totalReal <= 0 ? (
        <p className="mt-2 text-xs text-muted-foreground">
          Registre seus gastos para ver a previsão do fim do mês.
        </p>
      ) : (
        <>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <span className="tabular text-base font-bold tracking-tight sm:text-lg">
              {formatBRL(projecao)}
            </span>
            {temTendencia && !inicioDoMes && (
              <span
                className={`inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${
                  gastandoMenos ? "bg-success/10 text-success" : "bg-danger/10 text-danger"
                }`}
              >
                {gastandoMenos ? (
                  <ArrowDown className="h-3 w-3" />
                ) : (
                  <ArrowUp className="h-3 w-3" />
                )}
                {Math.abs(variacaoPct)}% vs mês passado
              </span>
            )}
          </div>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            {base > 0 && (
              <span className={dentro ? "font-medium text-success" : "font-medium text-danger"}>
                {dentro ? `Ainda sobram ${formatBRL(delta)}. 🎉` : `${formatBRL(delta)} acima ${baseLabel}.`}
              </span>
            )}
            {inicioDoMes && " Início do mês: previsão imprecisa."}
          </p>
        </>
      )}
    </div>
  );
}

/** Streak de dias consecutivos com pelo menos um gasto registrado.
 *  Conta até hoje; se hoje ainda não teve registro, a sequência de ontem vale. */
export function DiasNoAzul() {
  const { data, isLoading } = useQuery({
    queryKey: ["dias-com-registro"],
    queryFn: () => fetchDiasComRegistro(60),
  });

  const dias = new Set(data ?? []);
  const streak = (() => {
    let count = 0;
    const cursor = new Date();
    // Tolerância: sem registro hoje ainda não quebra a sequência.
    if (!dias.has(hojeISO())) cursor.setDate(cursor.getDate() - 1);
    for (;;) {
      const iso = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, "0")}-${String(cursor.getDate()).padStart(2, "0")}`;
      if (!dias.has(iso)) break;
      count += 1;
      cursor.setDate(cursor.getDate() - 1);
    }
    return count;
  })();

  const registrouHoje = dias.has(hojeISO());

  return (
    <div className="rounded-2xl border border-border bg-card p-3 shadow-soft">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">Dias no Azul</span>
        <span className="grid h-6 w-6 place-items-center rounded-lg bg-primary/10">
          <Flame className="h-3.5 w-3.5 text-primary" />
        </span>
      </div>
      {isLoading ? (
        <Skeleton className="mt-2 h-9 w-full" />
      ) : streak === 0 ? (
        <p className="mt-2 text-xs text-muted-foreground">
          Registre um gasto hoje e comece sua sequência. 💙
        </p>
      ) : (
        <>
          <div className="tabular mt-1 text-base font-bold sm:text-lg">
            {streak} {streak === 1 ? "dia" : "dias"} 🔥
          </div>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            {registrouHoje ? "Continue assim! 👏" : "Registre hoje pra manter a sequência."}
          </p>
        </>
      )}
    </div>
  );
}
