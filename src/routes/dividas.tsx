import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
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
  Flag,
} from "lucide-react";
import { simularQuitacao, formatMesAno } from "@/lib/quitacao";

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
import { AssistenteDividaCard } from "@/components/AssistenteDivida";
import { Skeleton } from "@/components/ui/skeleton";
import { PageTitle } from "@/components/PageTitle";

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

  const todas = useMemo(() => dividasQ.data ?? [], [dividasQ.data]);
  const ativas = todas.filter((d) => d.status === "Ativa");
  const totalAtivo = ativas.reduce((a, d) => a + Number(d.valor_total), 0);
  const parcelaMensal = ativas.reduce((a, d) => a + Number(d.parcela_mensal), 0);
  const prioritaria = ativas.length
    ? ativas.reduce((max, d) =>
        Number(d.taxa_juros_mensal) > Number(max.taxa_juros_mensal) ? d : max,
      )
    : null;

  const simulacao = useMemo(() => simularQuitacao(todas), [todas]);

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <PageTitle>Dívidas</PageTitle>
          <p className="text-sm text-muted-foreground">
            Priorize as dívidas mais caras para sair do vermelho mais rápido.
          </p>
        </div>
        <NovaDividaDialog />
      </header>

      <AssistenteDividaCard />

      <section className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-danger/10 text-danger">
              <CreditCard className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Total devido</div>
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

      {!dividasQ.isLoading && ativas.length > 0 && (
        <section className="rounded-2xl border border-primary/30 bg-primary/5 p-5 shadow-soft">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-primary text-primary-foreground">
              <Flag className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold">Plano de Liberdade</div>
              {simulacao.plano ? (
                <div className="text-xs text-muted-foreground">
                  No ritmo atual ({formatBRL(simulacao.plano.pagamentoMensal)}/mês), sua família
                  fica <strong className="text-foreground">livre de dívidas em {formatMesAno(simulacao.plano.dataLiberdade)}</strong>{" "}
                  ({simulacao.plano.meses} {simulacao.plano.meses === 1 ? "mês" : "meses"}) — pagando{" "}
                  {formatBRL(simulacao.plano.totalJurosPagos)} de juros no caminho.
                </div>
              ) : (
                <div className="text-xs font-medium text-danger">
                  No ritmo atual, as parcelas não vencem os juros — as dívidas não zeram.
                  Use o simulador abaixo para ver o efeito de um aporte extra, ou renegocie as taxas.
                </div>
              )}
            </div>
          </div>
          {simulacao.plano && simulacao.plano.ordem.length > 1 && (
            <ol className="mt-3 space-y-1 border-t border-primary/20 pt-3 text-xs text-muted-foreground">
              {simulacao.plano.ordem.map((d, i) => (
                <li key={d.id} className="flex items-center justify-between gap-2">
                  <span>
                    <span className="font-semibold text-foreground">{i + 1}º</span> {d.nome}
                  </span>
                  <span className="tabular">quita em {formatMesAno(d.dataQuitacao)}</span>
                </li>
              ))}
            </ol>
          )}
        </section>
      )}

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
              Quanto sua família consegue pagar a mais por mês? Veja o efeito no prazo.
            </DialogDescription>
          </DialogHeader>
          <SimuladorAporte dividas={todas} />
        </DialogContent>
      </Dialog>
    </div>
  );
}

function SimuladorAporte({ dividas }: { dividas: Divida[] }) {
  const [aporte, setAporte] = useState("200");
  const extra = Number(aporte) || 0;

  const base = useMemo(() => simularQuitacao(dividas), [dividas]);
  const comAporte = useMemo(() => simularQuitacao(dividas, extra), [dividas, extra]);

  const ativas = dividas.filter((d) => d.status === "Ativa");
  if (ativas.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border p-6 text-center text-xs text-muted-foreground">
        Sem dívidas ativas para simular. 🎉
      </div>
    );
  }

  const mesesGanhos =
    base.plano && comAporte.plano ? base.plano.meses - comAporte.plano.meses : null;
  const jurosEconomizados =
    base.plano && comAporte.plano
      ? base.plano.totalJurosPagos - comAporte.plano.totalJurosPagos
      : null;

  return (
    <div className="space-y-4">
      <div>
        <Label>Quanto a mais você consegue pagar por mês? (R$)</Label>
        <Input
          inputMode="decimal"
          value={aporte}
          onChange={(e) => setAporte(e.target.value)}
          placeholder="200"
        />
      </div>

      {comAporte.plano ? (
        <div className="rounded-xl border border-success/30 bg-success/10 p-4 text-sm">
          <div className="font-semibold text-foreground">
            Livre de dívidas em {formatMesAno(comAporte.plano.dataLiberdade)} (
            {comAporte.plano.meses} {comAporte.plano.meses === 1 ? "mês" : "meses"})
          </div>
          {mesesGanhos !== null && mesesGanhos > 0 && (
            <p className="mt-1 text-xs text-muted-foreground">
              <strong className="text-success">{mesesGanhos} {mesesGanhos === 1 ? "mês" : "meses"} antes</strong>{" "}
              do ritmo atual{jurosEconomizados !== null && jurosEconomizados > 0.005 && (
                <> — e {formatBRL(jurosEconomizados)} a menos em juros</>
              )}. Esse é o poder de pagar um pouquinho a mais. 💙
            </p>
          )}
          {mesesGanhos !== null && mesesGanhos <= 0 && extra > 0 && (
            <p className="mt-1 text-xs text-muted-foreground">
              O prazo não mudou — o valor extra é pequeno perto das dívidas. Experimente um valor maior.
            </p>
          )}
          {!base.plano && (
            <p className="mt-1 text-xs text-muted-foreground">
              Sem o aporte, as dívidas não zeravam. Com {formatBRL(extra)}/mês, elas zeram. 💪
            </p>
          )}
        </div>
      ) : (
        <div className="rounded-xl border border-danger/30 bg-danger/10 p-4 text-xs font-medium text-danger">
          Mesmo com esse aporte, os juros ainda vencem o pagamento mensal. Aumente o valor ou
          priorize renegociar as taxas mais altas.
        </div>
      )}
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
                  <AlertTriangle className="h-3 w-3" /> A parcela é menor que os juros — assim a dívida nunca acaba
                </span>
              ) : (
                <span className="text-muted-foreground">
                  Termina de pagar em {d.meses_para_quitar} meses
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

// Juros digitados em % ao mês (ex.: "5" ou "0,8") → decimal salvo no banco (0.05, 0.008).
function pctParaDecimal(raw: string): number {
  const n = Number(raw.replace(",", "."));
  return Number.isFinite(n) && n > 0 ? n / 100 : 0;
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
        taxa_juros_mensal: pctParaDecimal(juros),
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
          <DialogDescription>Cartão, empréstimo, financiamento — registre o que ainda está pagando.</DialogDescription>
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
              <Label>Juros por mês (%)</Label>
              <Input
                inputMode="decimal"
                value={juros}
                onChange={(e) => setJuros(e.target.value)}
                placeholder="Ex.: 5"
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
  const [juros, setJuros] = useState(
    String(+(Number(d.taxa_juros_mensal) * 100).toFixed(4)),
  );
  const [parcela, setParcela] = useState(String(d.parcela_mensal));
  const qc = useQueryClient();
  const mut = useMutation({
    mutationFn: () =>
      atualizarDivida(d.id, {
        nome,
        valor_total: Number(total) || 0,
        taxa_juros_mensal: pctParaDecimal(juros),
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
              <Label>Juros por mês (%)</Label>
              <Input inputMode="decimal" value={juros} onChange={(e) => setJuros(e.target.value)} placeholder="Ex.: 5" />
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
