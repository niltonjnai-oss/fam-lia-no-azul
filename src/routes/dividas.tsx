import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CreditCard,
  Star,
  Calculator,
  TrendingDown,
  Plus,
  Pencil,
  Trash2,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  qk,
  fetchDividas,
  inserirDivida,
  atualizarDivida,
  excluirDivida,
  type Divida,
} from "@/lib/db";
import { formatBRL } from "@/lib/format";
import { EmptyState } from "@/components/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/dividas")({
  head: () => ({
    meta: [
      { title: "Dívidas — Família no Azul" },
      {
        name: "description",
        content: "Lista de dívidas familiares, parcelas e prazo para quitação.",
      },
    ],
  }),
  component: DividasPage,
});

function DividasPage() {
  const dividasQ = useQuery({ queryKey: qk.dividas, queryFn: fetchDividas });
  const [openSim, setOpenSim] = useState(false);

  const todas = dividasQ.data ?? [];
  const ativas = todas.filter((d) => d.status === "Ativa");
  const totalAtivo = ativas.reduce((a, d) => a + Number(d.valor_total), 0);
  const parcelaMensal = ativas.reduce((a, d) => a + Number(d.parcela_mensal), 0);
  const prioritaria = ativas.length
    ? ativas.reduce((max, d) =>
        Number(d.taxa_juros_mensal) > Number(max.taxa_juros_mensal) ? d : max,
      )
    : null;

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-primary sm:text-3xl">Dívidas</h1>
          <p className="text-sm text-muted-foreground">
            Priorize as dívidas mais caras para sair do vermelho mais rápido.
          </p>
        </div>
        <NovaDividaDialog />
      </header>

      <section className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-danger/10 text-danger">
              <CreditCard className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Total ativo</div>
              <div className="tabular text-xl font-bold">
                {dividasQ.isLoading ? <Skeleton className="h-6 w-28" /> : formatBRL(totalAtivo)}
              </div>
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
              <div className="tabular text-xl font-bold">
                {dividasQ.isLoading ? <Skeleton className="h-6 w-28" /> : formatBRL(parcelaMensal)}
              </div>
            </div>
          </div>
        </div>
      </section>

      {dividasQ.isLoading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-28 w-full rounded-2xl" />
          ))}
        </div>
      ) : todas.length === 0 ? (
        <EmptyState
          title="Nenhuma dívida ativa"
          description="Parabéns! Quando precisar registrar uma, use o botão Nova dívida."
        />
      ) : (
        <section className="space-y-3">
          {todas.map((d) => (
            <DividaCard key={d.id} divida={d} prioritaria={prioritaria?.id === d.id} />
          ))}
        </section>
      )}

      <button
        onClick={() => setOpenSim(true)}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-soft transition-colors hover:bg-primary-glow sm:w-auto"
      >
        <Calculator className="h-4 w-4" />
        Simular quitação
      </button>

      <Dialog open={openSim} onOpenChange={setOpenSim}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Simulador de quitação</DialogTitle>
            <DialogDescription>
              Em breve: simule aportes extras e veja o impacto no prazo final.
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

function DividaCard({ divida: d, prioritaria }: { divida: Divida; prioritaria: boolean }) {
  const qc = useQueryClient();
  const quitar = useMutation({
    mutationFn: () => atualizarDivida(d.id, { status: "Quitada" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.dividas }),
  });
  const excluir = useMutation({
    mutationFn: () => excluirDivida(d.id),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.dividas }),
  });

  const quitada = d.status === "Quitada";
  const semQuitacao = !quitada && d.meses_para_quitar === null;

  return (
    <article
      className={[
        "rounded-2xl border bg-card p-4 shadow-soft transition-colors",
        quitada
          ? "border-border opacity-70"
          : prioritaria
            ? "border-primary/40 ring-1 ring-primary/20"
            : "border-border",
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate text-sm font-semibold sm:text-base">{d.nome}</h3>
            {prioritaria && !quitada && (
              <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
                <Star className="h-3 w-3 fill-current" /> Prioridade
              </span>
            )}
            {quitada && (
              <span className="inline-flex items-center gap-1 rounded-full bg-success/15 px-2 py-0.5 text-[11px] font-semibold text-success">
                <CheckCircle2 className="h-3 w-3" /> Quitada
              </span>
            )}
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Juros {(Number(d.taxa_juros_mensal) * 100).toFixed(2)}% a.m.
          </p>
          {!quitada && (
            <p className="mt-1 text-xs">
              {semQuitacao ? (
                <span className="inline-flex items-center gap-1 rounded-md bg-danger/10 px-2 py-0.5 font-semibold text-danger">
                  <AlertTriangle className="h-3 w-3" /> A parcela não cobre os juros — a dívida não quita assim
                </span>
              ) : (
                <span className="text-muted-foreground">
                  {d.meses_para_quitar} meses para quitar
                </span>
              )}
            </p>
          )}
        </div>
        <div className="text-right">
          <div className="tabular text-base font-bold sm:text-lg">{formatBRL(Number(d.valor_total))}</div>
          <div className="tabular text-xs text-muted-foreground">
            {formatBRL(Number(d.parcela_mensal))}/mês
          </div>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <EditarDividaDialog divida={d} />
        {!quitada && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => quitar.mutate()}
            disabled={quitar.isPending}
          >
            <CheckCircle2 className="h-4 w-4" /> Marcar como quitada
          </Button>
        )}
        <Button
          size="sm"
          variant="ghost"
          onClick={() => {
            if (confirm(`Excluir "${d.nome}"?`)) excluir.mutate();
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

function NovaDividaDialog() {
  const [open, setOpen] = useState(false);
  const [nome, setNome] = useState("");
  const [total, setTotal] = useState("");
  const [juros, setJuros] = useState("");
  const [parcela, setParcela] = useState("");
  const qc = useQueryClient();
  const mut = useMutation({
    mutationFn: () =>
      inserirDivida({
        nome,
        valor_total: Number(total) || 0,
        taxa_juros_mensal: Number(juros) || 0,
        parcela_mensal: Number(parcela) || 0,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.dividas });
      setNome("");
      setTotal("");
      setJuros("");
      setParcela("");
      setOpen(false);
    },
  });
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4" /> Nova dívida
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nova dívida</DialogTitle>
          <DialogDescription>Use a taxa mensal em decimal (ex: 0.05 = 5% a.m.).</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label>Nome</Label>
            <Input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex: Cartão" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Valor total</Label>
              <Input inputMode="decimal" value={total} onChange={(e) => setTotal(e.target.value)} />
            </div>
            <div>
              <Label>Parcela mensal</Label>
              <Input inputMode="decimal" value={parcela} onChange={(e) => setParcela(e.target.value)} />
            </div>
            <div className="col-span-2">
              <Label>Taxa de juros mensal (decimal)</Label>
              <Input
                inputMode="decimal"
                value={juros}
                onChange={(e) => setJuros(e.target.value)}
                placeholder="0.05"
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button disabled={!nome || mut.isPending} onClick={() => mut.mutate()}>
            Adicionar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function EditarDividaDialog({ divida: d }: { divida: Divida }) {
  const [open, setOpen] = useState(false);
  const [nome, setNome] = useState(d.nome);
  const [total, setTotal] = useState(String(d.valor_total));
  const [juros, setJuros] = useState(String(d.taxa_juros_mensal));
  const [parcela, setParcela] = useState(String(d.parcela_mensal));
  const qc = useQueryClient();
  const mut = useMutation({
    mutationFn: () =>
      atualizarDivida(d.id, {
        nome,
        valor_total: Number(total) || 0,
        taxa_juros_mensal: Number(juros) || 0,
        parcela_mensal: Number(parcela) || 0,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.dividas });
      setOpen(false);
    },
  });
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Pencil className="h-4 w-4" /> Editar
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Editar dívida</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label>Nome</Label>
            <Input value={nome} onChange={(e) => setNome(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Valor total</Label>
              <Input inputMode="decimal" value={total} onChange={(e) => setTotal(e.target.value)} />
            </div>
            <div>
              <Label>Parcela mensal</Label>
              <Input inputMode="decimal" value={parcela} onChange={(e) => setParcela(e.target.value)} />
            </div>
            <div className="col-span-2">
              <Label>Taxa de juros mensal</Label>
              <Input inputMode="decimal" value={juros} onChange={(e) => setJuros(e.target.value)} />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button disabled={mut.isPending} onClick={() => mut.mutate()}>
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
