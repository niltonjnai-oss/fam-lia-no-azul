// Contas recorrentes: vencimentos mensais (boletos, assinaturas, mensalidades).
// O alerta por email sai 2 dias antes e no dia do vencimento
// (pg_cron → /api/public/emails/cron, ver supabase/sql/contas_recorrentes.sql).

import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarClock, Plus, Trash2, BellRing } from "lucide-react";

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
import { Switch } from "@/components/ui/switch";
import {
  fetchContasRecorrentes,
  inserirContaRecorrente,
  atualizarContaRecorrente,
  excluirContaRecorrente,
  type ContaRecorrente,
} from "@/lib/db";
import { formatBRL } from "@/lib/format";
import { EmptyState } from "@/components/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import { PageTitle } from "@/components/PageTitle";

const QK_CONTAS = ["conta_recorrente"] as const;

export const Route = createFileRoute("/contas")({
  head: () => ({
    meta: [
      { title: "Contas do mês — Família no Azul" },
      {
        name: "description",
        content: "Contas recorrentes da família com alerta antes do vencimento.",
      },
    ],
  }),
  component: ContasPage,
});

function ContasPage() {
  const contasQ = useQuery({ queryKey: QK_CONTAS, queryFn: fetchContasRecorrentes });
  const contas = contasQ.data ?? [];
  const ativas = contas.filter((c) => c.ativo);
  const totalMes = ativas.reduce((a, c) => a + Number(c.valor), 0);
  const hoje = new Date().getDate();
  const proxima = ativas
    .map((c) => ({ ...c, diasAte: (c.dia_vencimento - hoje + 31) % 31 }))
    .sort((a, b) => a.diasAte - b.diasAte)[0];

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <PageTitle>Contas do mês</PageTitle>
          <p className="text-sm text-muted-foreground">
            Cadastre suas contas fixas (aluguel, luz, escola…) e a gente te avisa por email 2 dias
            antes e no dia do vencimento.
          </p>
        </div>
        <NovaContaDialog />
      </header>

      <section className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary">
              <CalendarClock className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Total de contas por mês</div>
              <div className="tabular text-xl font-bold">
                {contasQ.isLoading ? <Skeleton className="h-6 w-28" /> : formatBRL(totalMes)}
              </div>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-warning/15 text-warning-foreground">
              <BellRing className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Próximo vencimento</div>
              <div className="text-sm font-semibold">
                {contasQ.isLoading ? (
                  <Skeleton className="h-5 w-32" />
                ) : proxima ? (
                  <>
                    {proxima.nome} — dia {proxima.dia_vencimento}
                  </>
                ) : (
                  "Nenhuma conta ativa"
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {contasQ.isLoading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-20 w-full rounded-2xl" />
          ))}
        </div>
      ) : contas.length === 0 ? (
        <EmptyState
          title="Nenhuma conta cadastrada"
          description="Adicione boletos, assinaturas e mensalidades para receber alertas antes do vencimento."
        />
      ) : (
        <section className="space-y-3">
          {contas.map((c) => (
            <ContaCard key={c.id} conta={c} />
          ))}
        </section>
      )}
    </div>
  );
}

function ContaCard({ conta: c }: { conta: ContaRecorrente }) {
  const qc = useQueryClient();
  const alternar = useMutation({
    mutationFn: () => atualizarContaRecorrente(c.id, { ativo: !c.ativo }),
    onSuccess: () => qc.invalidateQueries({ queryKey: QK_CONTAS }),
  });
  const excluir = useMutation({
    mutationFn: () => excluirContaRecorrente(c.id),
    onSuccess: () => qc.invalidateQueries({ queryKey: QK_CONTAS }),
  });

  return (
    <article
      className={`flex items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4 shadow-soft ${c.ativo ? "" : "opacity-60"}`}
    >
      <div className="min-w-0">
        <h3 className="truncate text-sm font-semibold sm:text-base">{c.nome}</h3>
        <p className="text-xs text-muted-foreground">
          Vence todo dia <strong>{c.dia_vencimento}</strong>
          {!c.ativo && " · alertas pausados"}
        </p>
      </div>
      <div className="flex items-center gap-3">
        <div className="tabular text-right text-sm font-bold sm:text-base">
          {formatBRL(Number(c.valor))}
        </div>
        <Switch
          checked={c.ativo}
          onCheckedChange={() => alternar.mutate()}
          disabled={alternar.isPending}
          aria-label={c.ativo ? "Pausar alertas" : "Reativar alertas"}
        />
        <Button
          size="sm"
          variant="ghost"
          onClick={() => {
            if (confirm(`Excluir "${c.nome}"?`)) excluir.mutate();
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

function NovaContaDialog() {
  const [open, setOpen] = useState(false);
  const [nome, setNome] = useState("");
  const [valor, setValor] = useState("");
  const [dia, setDia] = useState("");
  const qc = useQueryClient();
  const diaNum = Math.min(31, Math.max(1, Number(dia) || 0));
  const mut = useMutation({
    mutationFn: () =>
      inserirContaRecorrente({
        nome,
        valor: Number(valor) || 0,
        dia_vencimento: diaNum,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK_CONTAS });
      setNome("");
      setValor("");
      setDia("");
      setOpen(false);
    },
  });
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4" /> Nova conta
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nova conta recorrente</DialogTitle>
          <DialogDescription>
            Boleto, assinatura, mensalidade — tudo que vence todo mês no mesmo dia.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label>Nome</Label>
            <Input
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Energia, Internet, Escola"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Valor (R$)</Label>
              <Input inputMode="decimal" value={valor} onChange={(e) => setValor(e.target.value)} />
            </div>
            <div>
              <Label>Dia do vencimento</Label>
              <Input
                inputMode="numeric"
                value={dia}
                onChange={(e) => setDia(e.target.value)}
                placeholder="1 a 31"
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button disabled={!nome || !dia || mut.isPending} onClick={() => mut.mutate()}>
            Adicionar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
