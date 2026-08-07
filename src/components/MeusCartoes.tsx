// Cartões de crédito da família: cadastro, lista e exclusão.
//
// Só existe por um motivo: sem o dia de FECHAMENTO o app não sabe em que
// fatura a compra cai, e erra o mês do gasto. E não dá pra deduzir o
// fechamento a partir do vencimento - o intervalo entre os dois varia de 5 a
// 10 dias por emissor, e o Banco Central não define isso (é contrato).
//
// Dois lugares, mesmo componente: a seção completa em /contas e a versão
// `compacto` no painel. No painel ele NÃO some depois do primeiro cadastro -
// é de lá que se cadastra o segundo cartão ou se apaga um com dia errado.

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

export function MeusCartoes({ compacto = false }: { compacto?: boolean }) {
  const [novoAberto, setNovoAberto] = useState(false);
  const cartoesQ = useQuery({ queryKey: qk.cartoes, queryFn: fetchCartoes });
  const cartoes = cartoesQ.data ?? [];
  const vazio = !cartoesQ.isLoading && cartoes.length === 0;

  const conteudo = (
    <>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <CreditCard className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold">Meus cartões</h2>
        </div>
        <Button variant="outline" size="sm" onClick={() => setNovoAberto(true)}>
          <Plus className="h-4 w-4" /> Novo cartão
        </Button>
      </div>

      {!compacto && (
        <p className="mt-0.5 text-xs text-muted-foreground">
          Com o dia de fechamento e de vencimento, o app sabe em qual fatura cada compra cai.
        </p>
      )}

      {cartoesQ.isLoading ? (
        <Skeleton className="mt-3 h-14 w-full rounded-xl" />
      ) : vazio ? (
        <p className={compacto ? "mt-2 text-xs text-muted-foreground" : "mt-3 rounded-2xl border border-dashed border-border p-4 text-xs text-muted-foreground"}>
          Nenhum cartão cadastrado. Sem isso, o gasto no crédito entra no mês da compra - e se você
          comprou depois do fechamento, quem paga é a fatura do mês seguinte.
        </p>
      ) : (
        <div className={compacto ? "mt-3 space-y-1.5" : "mt-3 space-y-3"}>
          {cartoes.map((c) => (
            <CartaoCard key={c.id} cartao={c} compacto={compacto} />
          ))}
        </div>
      )}

      <NovoCartaoDialog open={novoAberto} onOpenChange={setNovoAberto} />
    </>
  );

  // No painel vira um card próprio; em /contas herda o espaçamento da página.
  return compacto ? (
    <section className="rounded-2xl border border-border bg-card p-4 shadow-soft">{conteudo}</section>
  ) : (
    <section>{conteudo}</section>
  );
}

function CartaoCard({ cartao: c, compacto }: { cartao: Cartao; compacto: boolean }) {
  const qc = useQueryClient();
  const excluir = useMutation({
    mutationFn: () => excluirCartao(c.id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.cartoes });
      toast.success("Cartão excluído.");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  // Uma compra feita hoje serve de exemplo concreto do que o cadastro faz.
  const exemplo = faturaDaCompra(hojeISO(), c.dia_fechamento, c.dia_vencimento);

  const botaoExcluir = (
    <Button
      size="sm"
      variant="ghost"
      onClick={() => {
        if (confirm(`Excluir o cartão "${c.nome}"?`)) excluir.mutate();
      }}
      disabled={excluir.isPending}
      className="shrink-0 text-danger hover:bg-danger/10 hover:text-danger"
      aria-label={`Excluir ${c.nome}`}
    >
      <Trash2 className="h-4 w-4" />
    </Button>
  );

  if (compacto) {
    return (
      <div className="flex items-center gap-2 rounded-xl bg-muted/40 px-3 py-2">
        <div className="min-w-0 flex-1">
          <span className="text-sm font-medium">{c.nome}</span>
          <span className="text-xs text-muted-foreground">
            {" "}
            · fecha dia {c.dia_fechamento} · vence dia {c.dia_vencimento}
          </span>
        </div>
        {botaoExcluir}
      </div>
    );
  }

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
        {botaoExcluir}
      </div>
    </article>
  );
}

/** Diálogo controlado de fora: é aberto tanto pela seção em /contas quanto
 *  pelo bloco do painel. */
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
