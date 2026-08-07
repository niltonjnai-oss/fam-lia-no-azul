// Compras parceladas (crédito/boleto registrados no "Anotar um gasto").
//
// A compra vira três coisas ao mesmo tempo: a parcela somada no orçamento de
// cada mês, uma dívida e (no boleto com vencimento) um lembrete em Contas. Aqui
// é onde ela pode ser corrigida, quitada ou desfeita - sempre pelas RPCs, que
// mexem nas três de uma vez. O card da dívida correspondente sai da lista de
// dívidas justamente pra não existirem dois lugares editando o mesmo dado.

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarClock, CheckCircle2, Pencil, ShoppingBag, Trash2 } from "lucide-react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { CurrencyInput } from "@/components/CurrencyInput";
import { formatBRL } from "@/lib/format";
import {
  qk,
  mesAtual,
  formatMes,
  fetchComprasParceladas,
  parcelaAtual,
  cancelarCompraParcelada,
  quitarCompraParcelada,
  editarCompraParcelada,
  type CompraParcelada,
} from "@/lib/db";

const FORMA_LABEL: Record<string, string> = {
  credito: "Cartão de crédito",
  boleto: "Boleto",
};

/** Invalida tudo que a compra parcelada toca: orçamento do mês, dívidas,
 *  contas e o feed do painel. */
function useInvalidarTudo() {
  const qc = useQueryClient();
  const mes = mesAtual();
  return () => {
    qc.invalidateQueries({ queryKey: qk.comprasParceladas });
    qc.invalidateQueries({ queryKey: qk.dividas });
    qc.invalidateQueries({ queryKey: qk.contas });
    qc.invalidateQueries({ queryKey: qk.resumo(mes) });
    qc.invalidateQueries({ queryKey: qk.bloco503020(mes) });
    qc.invalidateQueries({ queryKey: qk.lancamentos(mes) });
    qc.invalidateQueries({ queryKey: qk.gastosMes(mes) });
    qc.invalidateQueries({ queryKey: qk.transacoesRecentes });
  };
}

export function ComprasParceladasSection() {
  const comprasQ = useQuery({
    queryKey: qk.comprasParceladas,
    queryFn: fetchComprasParceladas,
  });
  const compras = comprasQ.data ?? [];

  if (comprasQ.isLoading) return <Skeleton className="h-32 w-full rounded-2xl" />;
  if (compras.length === 0) return null;

  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2">
        <ShoppingBag className="h-4 w-4 text-muted-foreground" />
        <h2 className="text-sm font-semibold">Compras parceladas</h2>
      </div>
      <p className="-mt-1 text-xs text-muted-foreground">
        O que você comprou parcelado. A parcela já está no seu orçamento todo mês, em
        Reserva/Dívidas.
      </p>
      {compras.map((c) => (
        <CompraCard key={c.id} compra={c} />
      ))}
    </section>
  );
}

function CompraCard({ compra: c }: { compra: CompraParcelada }) {
  const [editar, setEditar] = useState(false);
  const [quitar, setQuitar] = useState(false);
  const invalidar = useInvalidarTudo();
  const mes = mesAtual();

  const quitada = c.status === "quitada";
  const pagas = quitada ? c.parcelas : parcelaAtual(c, mes);
  const restantes = Math.max(0, c.parcelas - pagas);
  const falta = quitada ? 0 : restantes * Number(c.valor_parcela);
  const pct = Math.round((pagas / c.parcelas) * 100);

  const excluir = useMutation({
    mutationFn: () => cancelarCompraParcelada(c.id),
    onSuccess: () => {
      invalidar();
      toast.success("Compra desfeita. As parcelas saíram do orçamento.");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <article
      className={[
        "rounded-2xl border bg-card p-4 shadow-soft",
        quitada ? "border-border opacity-70" : "border-border",
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate text-sm font-semibold sm:text-base">{c.descricao}</h3>
            {quitada && (
              <span className="inline-flex items-center gap-1 rounded-full bg-success/15 px-2 py-0.5 text-[11px] font-semibold text-success">
                <CheckCircle2 className="h-3 w-3" /> Quitada
              </span>
            )}
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {c.parcelas}x de {formatBRL(Number(c.valor_parcela))}
            {c.forma_pagamento && FORMA_LABEL[c.forma_pagamento]
              ? ` · ${FORMA_LABEL[c.forma_pagamento]}`
              : ""}
            {c.dia_vencimento ? ` · vence dia ${c.dia_vencimento}` : ""}
          </p>
          <p className="mt-1 text-xs">
            {quitada ? (
              <span className="text-muted-foreground">
                Quitada{c.mes_quitacao ? ` em ${formatMes(c.mes_quitacao)}` : ""} · começou em{" "}
                {formatMes(c.mes_inicial)}
              </span>
            ) : (
              <span className="text-muted-foreground">
                Parcela <strong className="text-foreground">{pagas} de {c.parcelas}</strong> ·
                faltam {formatBRL(falta)}
              </span>
            )}
          </p>
        </div>
        <div className="text-right">
          <div className="tabular text-base font-bold sm:text-lg">
            {formatBRL(Number(c.valor_total))}
          </div>
          <div className="tabular text-xs text-muted-foreground">total da compra</div>
        </div>
      </div>

      <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={quitada ? "h-full bg-success" : "h-full bg-primary"}
          style={{ width: `${Math.min(100, Math.max(0, pct))}%` }}
        />
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {!quitada && (
          <>
            <Button size="sm" variant="outline" onClick={() => setEditar(true)}>
              <Pencil className="h-4 w-4" /> Corrigir
            </Button>
            <Button size="sm" variant="outline" onClick={() => setQuitar(true)}>
              <CheckCircle2 className="h-4 w-4" /> Já quitei
            </Button>
          </>
        )}
        <Button
          size="sm"
          variant="ghost"
          onClick={() => {
            if (
              confirm(
                `Desfazer "${c.descricao}"?\n\nAs parcelas saem do orçamento de todos os meses e a dívida é apagada.`,
              )
            )
              excluir.mutate();
          }}
          disabled={excluir.isPending}
          className="text-danger hover:bg-danger/10 hover:text-danger"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <EditarCompraDialog compra={c} open={editar} onOpenChange={setEditar} />
      <QuitarCompraDialog
        compra={c}
        restantes={restantes}
        open={quitar}
        onOpenChange={setQuitar}
      />
    </article>
  );
}

function EditarCompraDialog({
  compra: c,
  open,
  onOpenChange,
}: {
  compra: CompraParcelada;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const [descricao, setDescricao] = useState(c.descricao);
  const [total, setTotal] = useState(String(c.valor_total));
  const [parcelas, setParcelas] = useState(String(c.parcelas));
  const [dia, setDia] = useState(c.dia_vencimento ? String(c.dia_vencimento) : "");
  const invalidar = useInvalidarTudo();

  const nParc = Math.floor(Number(parcelas) || 0);
  const valorTotal = Number(total) || 0;
  const previa = useMemo(
    () => (nParc >= 2 && valorTotal > 0 ? valorTotal / nParc : 0),
    [nParc, valorTotal],
  );
  const temBoleto = c.forma_pagamento === "boleto";
  const nDia = Math.floor(Number(dia) || 0);

  const mut = useMutation({
    mutationFn: () => {
      if (valorTotal <= 0) throw new Error("Informe um valor maior que zero.");
      if (nParc < 2) throw new Error("Informe 2 ou mais parcelas.");
      if (temBoleto && dia && (nDia < 1 || nDia > 31))
        throw new Error("O dia do vencimento tem que ser entre 1 e 31.");
      return editarCompraParcelada({
        id: c.id,
        descricao: descricao.trim() || "Compra parcelada",
        valor_total: valorTotal,
        parcelas: nParc,
        dia_vencimento: temBoleto && nDia >= 1 && nDia <= 31 ? nDia : null,
        criar_lembrete: temBoleto && nDia >= 1 && nDia <= 31,
      });
    },
    onSuccess: () => {
      invalidar();
      onOpenChange(false);
      toast.success("Compra corrigida.");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Corrigir compra parcelada</DialogTitle>
          <DialogDescription>
            Os meses são recalculados do começo, a partir de {formatMes(c.mes_inicial)}.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="cp-desc" className="text-xs">
              O que você comprou
            </Label>
            <Input
              id="cp-desc"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              className="h-11"
            />
          </div>
          <CurrencyInput label="Valor total da compra" value={total} onChange={setTotal} />
          <div className="space-y-1">
            <Label htmlFor="cp-parc" className="text-xs">
              Em quantas vezes
            </Label>
            <Input
              id="cp-parc"
              inputMode="numeric"
              value={parcelas}
              onChange={(e) => setParcelas(e.target.value.replace(/\D/g, ""))}
              className="tabular h-11 w-24 text-center"
            />
          </div>
          {temBoleto && (
            <div className="space-y-1">
              <Label htmlFor="cp-dia" className="text-xs">
                Vence todo dia <span className="text-muted-foreground">(opcional)</span>
              </Label>
              <Input
                id="cp-dia"
                inputMode="numeric"
                value={dia}
                onChange={(e) => setDia(e.target.value.replace(/\D/g, "").slice(0, 2))}
                placeholder="ex.: 10"
                className="tabular h-11 w-24 text-center"
              />
            </div>
          )}
          {previa > 0 && (
            <p className="text-xs text-muted-foreground">
              Fica {nParc}x de <strong className="text-foreground">{formatBRL(previa)}</strong>.
            </p>
          )}
        </div>
        <DialogFooter>
          <Button
            onClick={() => mut.mutate()}
            disabled={mut.isPending}
            className="bg-cta text-cta-foreground hover:bg-cta-hover"
          >
            {mut.isPending ? "Salvando..." : "Salvar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function QuitarCompraDialog({
  compra: c,
  restantes,
  open,
  onOpenChange,
}: {
  compra: CompraParcelada;
  restantes: number;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const [lancar, setLancar] = useState(true);
  const invalidar = useInvalidarTudo();
  const mes = mesAtual();
  const saldo = restantes * Number(c.valor_parcela);

  const mut = useMutation({
    mutationFn: () => quitarCompraParcelada({ id: c.id, mes, lancarSaldo: lancar && saldo > 0 }),
    onSuccess: () => {
      invalidar();
      onOpenChange(false);
      toast.success("Compra quitada. As parcelas futuras saíram do orçamento.");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Já quitei esta compra</DialogTitle>
          <DialogDescription>
            {saldo > 0
              ? `Faltavam ${restantes} ${restantes === 1 ? "parcela" : "parcelas"} (${formatBRL(saldo)}). Elas saem do orçamento dos próximos meses.`
              : "Não há parcelas futuras - a compra só vai ser marcada como quitada."}
          </DialogDescription>
        </DialogHeader>
        {saldo > 0 && (
          <label className="flex items-start gap-2 rounded-xl border border-border bg-muted/30 p-3 text-sm">
            <Checkbox
              checked={lancar}
              onCheckedChange={(v) => setLancar(v === true)}
              className="mt-0.5"
            />
            <span>
              Lançar {formatBRL(saldo)} como gasto deste mês
              <span className="block text-xs text-muted-foreground">
                Marque se você pagou o saldo agora - foi dinheiro que saiu de verdade.
              </span>
            </span>
          </label>
        )}
        {c.conta_recorrente_id && (
          <p className="flex items-start gap-2 text-xs text-muted-foreground">
            <CalendarClock className="mt-0.5 h-3.5 w-3.5 shrink-0" />O lembrete de vencimento em
            Contas também é desligado.
          </p>
        )}
        <DialogFooter>
          <Button
            onClick={() => mut.mutate()}
            disabled={mut.isPending}
            className="bg-cta text-cta-foreground hover:bg-cta-hover"
          >
            {mut.isPending ? "Salvando..." : "Confirmar quitação"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
