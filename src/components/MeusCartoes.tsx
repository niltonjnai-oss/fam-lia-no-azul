// Cadastro dos cartões de crédito da família.
//
// Só existe por um motivo: sem o dia de FECHAMENTO o app não sabe em que
// fatura a compra cai, e erra o mês do gasto. E não dá pra deduzir o
// fechamento a partir do vencimento - o intervalo entre os dois varia de 5 a
// 10 dias por emissor, e o Banco Central não define isso (é contrato).
//
// Mora em /contas junto das contas fixas, pra não criar mais um item de menu.

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CreditCard, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  qk,
  fetchCartoes,
  inserirCartao,
  excluirCartao,
  hojeISO,
  formatMes,
  type Cartao,
} from "@/lib/db";
import { faturaDaCompra } from "@/lib/cartao";

export function MeusCartoes() {
  const cartoesQ = useQuery({ queryKey: qk.cartoes, queryFn: fetchCartoes });
  const cartoes = cartoesQ.data ?? [];

  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold">Meus cartões</h2>
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Com o dia de fechamento e de vencimento, o app sabe em qual fatura cada compra cai.
          </p>
        </div>
        <BotaoNovoCartao />
      </div>

      {cartoesQ.isLoading ? (
        <Skeleton className="h-20 w-full rounded-2xl" />
      ) : cartoes.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border p-4 text-xs text-muted-foreground">
          Nenhum cartão cadastrado. Sem isso, o gasto no crédito entra no mês da compra - e se você
          comprou depois do fechamento, quem paga é a fatura do mês seguinte.
        </p>
      ) : (
        cartoes.map((c) => <CartaoCard key={c.id} cartao={c} />)
      )}
    </section>
  );
}

function CartaoCard({ cartao: c }: { cartao: Cartao }) {
  const qc = useQueryClient();
  const excluir = useMutation({
    mutationFn: () => excluirCartao(c.id),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.cartoes }),
    onError: (e: Error) => toast.error(e.message),
  });

  // Uma compra feita hoje serve de exemplo concreto do que o cadastro faz.
  const exemplo = faturaDaCompra(hojeISO(), c.dia_fechamento, c.dia_vencimento);

  return (
    <article className="rounded-2xl border border-border bg-card p-4 shadow-soft">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold sm:text-base">{c.nome}</h3>
          <p className="text-xs text-muted-foreground">
            Fecha dia <strong>{c.dia_fechamento}</strong> · vence dia{" "}
            <strong>{c.dia_vencimento}</strong>
          </p>
          <p className="mt-1 text-[11px] text-muted-foreground">
            Compra de hoje cai na fatura de {formatMes(exemplo.mesRef)}.
          </p>
        </div>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => {
            if (confirm(`Excluir o cartão "${c.nome}"?`)) excluir.mutate();
          }}
          disabled={excluir.isPending}
          className="text-danger hover:bg-danger/10 hover:text-danger"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </article>
  );
}

/** Botão + diálogo, pra usar dentro da própria seção de cartões. */
function BotaoNovoCartao() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" /> Novo cartão
      </Button>
      <NovoCartaoDialog open={open} onOpenChange={setOpen} />
    </>
  );
}

/** Diálogo controlado de fora - o aviso do painel abre este mesmo, em vez de
 *  mandar a pessoa rolar até o rodapé da tela Contas. */
export function NovoCartaoDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const [nome, setNome] = useState("");
  const [fechamento, setFechamento] = useState("");
  const [vencimento, setVencimento] = useState("");
  const qc = useQueryClient();

  const nFech = Math.floor(Number(fechamento) || 0);
  const nVenc = Math.floor(Number(vencimento) || 0);
  const valido = nFech >= 1 && nFech <= 31 && nVenc >= 1 && nVenc <= 31;
  const previa = valido ? faturaDaCompra(hojeISO(), nFech, nVenc) : null;

  const mut = useMutation({
    mutationFn: () => {
      if (!nome.trim()) throw new Error("Dê um nome ao cartão.");
      if (!valido) throw new Error("Os dias têm que ser entre 1 e 31.");
      return inserirCartao({
        nome: nome.trim(),
        dia_fechamento: nFech,
        dia_vencimento: nVenc,
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.cartoes });
      setNome("");
      setFechamento("");
      setVencimento("");
      onOpenChange(false);
      toast.success("Cartão cadastrado.");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Novo cartão de crédito</DialogTitle>
          <DialogDescription>
            Os dois dias estão no app do banco ou na própria fatura.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="ct-nome" className="text-xs">
              Nome do cartão
            </Label>
            <Input
              id="ct-nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Nubank, Itaú, Cartão da Ana"
              className="h-11"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="ct-fech" className="text-xs">
                Dia do fechamento
              </Label>
              <Input
                id="ct-fech"
                inputMode="numeric"
                value={fechamento}
                onChange={(e) => setFechamento(e.target.value.replace(/\D/g, "").slice(0, 2))}
                placeholder="ex.: 2"
                className="tabular h-11 text-center"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="ct-venc" className="text-xs">
                Dia do vencimento
              </Label>
              <Input
                id="ct-venc"
                inputMode="numeric"
                value={vencimento}
                onChange={(e) => setVencimento(e.target.value.replace(/\D/g, "").slice(0, 2))}
                placeholder="ex.: 9"
                className="tabular h-11 text-center"
              />
            </div>
          </div>
          <p className="text-[11px] text-muted-foreground">
            Fechamento é quando a fatura para de aceitar compras; vencimento é quando você paga. Na
            maioria dos bancos ficam de 5 a 10 dias um do outro.
          </p>
          {previa && (
            <p className="rounded-xl bg-muted/40 p-3 text-xs text-muted-foreground">
              Uma compra feita hoje cairia na fatura de{" "}
              <strong className="text-foreground">{formatMes(previa.mesRef)}</strong>, que vence em{" "}
              {previa.vencimento.split("-").reverse().join("/")}.
            </p>
          )}
        </div>
        <DialogFooter>
          <Button
            onClick={() => mut.mutate()}
            disabled={mut.isPending}
            className="bg-cta text-cta-foreground hover:bg-cta-hover"
          >
            {mut.isPending ? "Salvando..." : "Adicionar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
