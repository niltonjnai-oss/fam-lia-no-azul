// Convite pra cadastrar o cartão de crédito, no painel.
//
// Enquanto não houver cartão cadastrado, todo gasto no crédito entra no mês da
// COMPRA - e quem paga é a fatura. Quem compra depois do fechamento tem o
// gasto no mês errado e não percebe. Como o custo disso é silencioso, o aviso
// fica no painel até ser resolvido; depois some sozinho.
//
// Abre o cadastro aqui mesmo: mandar pra tela Contas obrigava a pessoa a rolar
// até o rodapé pra achar a seção de cartões.

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { CreditCard } from "lucide-react";

import { qk, fetchCartoes } from "@/lib/db";
import { NovoCartaoDialog } from "@/components/MeusCartoes";

export function AvisoCartao() {
  const [open, setOpen] = useState(false);
  const cartoesQ = useQuery({ queryKey: qk.cartoes, queryFn: fetchCartoes });

  // Não pisca enquanto carrega, e some assim que existir um cartão.
  if (cartoesQ.isLoading || (cartoesQ.data ?? []).length > 0) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex w-full items-center gap-3 rounded-2xl border border-cta/30 bg-cta/5 p-4 text-left shadow-soft transition-colors hover:bg-cta/10"
      >
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-cta/15 text-cta">
          <CreditCard className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold">Cadastre seu cartão de crédito</div>
          <p className="text-xs text-muted-foreground">
            Com o dia do fechamento, a gente põe cada compra no mês da fatura que vai pagar ela - e
            não no mês em que você comprou.
          </p>
        </div>
        <span className="shrink-0 text-xs font-semibold text-cta">Cadastrar</span>
      </button>

      <NovoCartaoDialog open={open} onOpenChange={setOpen} />
    </>
  );
}
