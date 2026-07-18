// Contas recorrentes: vencimentos mensais (boletos, assinaturas, mensalidades).
// O alerta por email sai 2 dias antes e no dia do vencimento
// (pg_cron → /api/public/emails/cron, ver supabase/sql/contas_recorrentes.sql).

import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarClock, Plus, Trash2, BellRing, Receipt, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

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
import { Checkbox } from "@/components/ui/checkbox";
import {
  qk,
  mesAtual,
  hojeISO,
  fetchCategorias,
  fetchSubitens,
  fetchContasRecorrentes,
  inserirContaRecorrente,
  atualizarContaRecorrente,
  excluirContaRecorrente,
  registrarPagamentoConta,
  type ContaRecorrente,
} from "@/lib/db";
import { formatBRL } from "@/lib/format";
import { EmptyState } from "@/components/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import { PageTitle } from "@/components/PageTitle";

const QK_CONTAS = ["conta_recorrente"] as const;

const parseValorBR = (s: string): number => {
  const n = Number(s.replace(/\./g, "").replace(",", "."));
  return Number.isFinite(n) && n > 0 ? n : 0;
};

/** Select de item do orçamento agrupado por categoria (padrão da importação). */
function useSubitensPorCategoria() {
  const catsQ = useQuery({ queryKey: qk.categorias, queryFn: fetchCategorias });
  const subsQ = useQuery({ queryKey: qk.subitens, queryFn: fetchSubitens });
  return useMemo(() => {
    const cats = catsQ.data ?? [];
    const subs = subsQ.data ?? [];
    return cats
      .map((c) => ({ categoria: c, subitens: subs.filter((s) => s.categoria_id === c.id) }))
      .filter((g) => g.subitens.length > 0);
  }, [catsQ.data, subsQ.data]);
}

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
  const pagaEsteMes = c.ultimo_mes_pago === mesAtual();
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
      className={`rounded-2xl border border-border bg-card p-4 shadow-soft ${c.ativo ? "" : "opacity-60"}`}
    >
      <div className="flex items-center justify-between gap-3">
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
      </div>

      {c.ativo && (
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-border/60 pt-3">
          {pagaEsteMes ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-success/15 px-2.5 py-1 text-xs font-semibold text-success">
              <CheckCircle2 className="h-3.5 w-3.5" /> Paga este mês
            </span>
          ) : (
            <span className="text-xs text-muted-foreground">
              Boleto chegou? Lance o valor real e o painel recalcula.
            </span>
          )}
          <ChegouBoletoDialog conta={c} jaPaga={pagaEsteMes} />
        </div>
      )}
    </article>
  );
}

function ChegouBoletoDialog({ conta: c, jaPaga }: { conta: ContaRecorrente; jaPaga: boolean }) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [valor, setValor] = useState("");
  const [subitemId, setSubitemId] = useState("");
  const [atualizarPadrao, setAtualizarPadrao] = useState(false);
  const grupos = useSubitensPorCategoria();

  function aoAbrir(v: boolean) {
    setOpen(v);
    if (v) {
      // Estado fresco a cada abertura: valor estimado preenchido, vínculo salvo.
      setValor(Number(c.valor) > 0 ? Number(c.valor).toFixed(2).replace(".", ",") : "");
      setSubitemId(c.subitem_id ?? "");
      setAtualizarPadrao(false);
    }
  }

  const mut = useMutation({
    mutationFn: async () => {
      const v = parseValorBR(valor);
      if (v <= 0) throw new Error("Informe o valor do boleto.");
      if (!subitemId) throw new Error("Escolha em qual item do orçamento essa conta entra.");
      await registrarPagamentoConta({
        conta: c,
        subitem_id: subitemId,
        valor: v,
        atualizarValorPadrao: atualizarPadrao,
      });
    },
    onSuccess: () => {
      const mes = mesAtual();
      qc.invalidateQueries({ queryKey: QK_CONTAS });
      qc.invalidateQueries({ queryKey: qk.resumo(mes) });
      qc.invalidateQueries({ queryKey: qk.bloco503020(mes) });
      qc.invalidateQueries({ queryKey: qk.lancamentos(mes) });
      qc.invalidateQueries({ queryKey: qk.gastosMes(mes) });
      qc.invalidateQueries({ queryKey: qk.transacoesRecentes });
      qc.invalidateQueries({ queryKey: qk.transacoesHoje(hojeISO()) });
      setOpen(false);
      toast.success("Lançado! O painel já mostra o valor real. 💙");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <Dialog open={open} onOpenChange={aoAbrir}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          variant={jaPaga ? "outline" : "default"}
          className={jaPaga ? "" : "bg-cta text-cta-foreground hover:bg-cta-hover"}
        >
          <Receipt className="h-4 w-4" />
          {jaPaga ? "Lançar de novo" : "Chegou o boleto"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Chegou o boleto de {c.nome}</DialogTitle>
          <DialogDescription>
            Lance o valor que veio de verdade — o painel e o 50-30-20 recalculam na hora.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label htmlFor={`boleto-valor-${c.id}`}>Valor do boleto (R$)</Label>
            <Input
              id={`boleto-valor-${c.id}`}
              inputMode="decimal"
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              className="tabular"
              placeholder="0,00"
            />
            {Number(c.valor) > 0 && (
              <p className="mt-1 text-[11px] text-muted-foreground">
                Você estimou {formatBRL(Number(c.valor))} pra essa conta.
              </p>
            )}
          </div>

          {!c.subitem_id && (
            <div>
              <Label htmlFor={`boleto-sub-${c.id}`}>Em qual item do orçamento entra?</Label>
              <select
                id={`boleto-sub-${c.id}`}
                className="mt-1 h-10 w-full rounded-md border border-border bg-background px-2 text-sm"
                value={subitemId}
                onChange={(e) => setSubitemId(e.target.value)}
              >
                <option value="">Escolher…</option>
                {grupos.map((g) => (
                  <optgroup key={g.categoria.id} label={g.categoria.nome}>
                    {g.subitens.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.nome}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
              <p className="mt-1 text-[11px] text-muted-foreground">
                A gente guarda essa escolha — da próxima vez não pergunta de novo.
              </p>
            </div>
          )}

          <label className="flex items-center gap-2 text-sm">
            <Checkbox
              checked={atualizarPadrao}
              onCheckedChange={(v) => setAtualizarPadrao(v === true)}
            />
            Usar esse valor como o valor normal da conta
          </label>
        </div>
        <DialogFooter>
          <Button
            disabled={mut.isPending}
            onClick={() => mut.mutate()}
            className="bg-cta text-cta-foreground hover:bg-cta-hover"
          >
            {mut.isPending ? "Lançando…" : "Lançar no orçamento"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function NovaContaDialog() {
  const [open, setOpen] = useState(false);
  const [nome, setNome] = useState("");
  const [valor, setValor] = useState("");
  const [dia, setDia] = useState("");
  const [subitemId, setSubitemId] = useState("");
  const grupos = useSubitensPorCategoria();
  const qc = useQueryClient();
  const diaNum = Math.min(31, Math.max(1, Number(dia) || 0));
  const mut = useMutation({
    mutationFn: () =>
      inserirContaRecorrente({
        nome,
        valor: Number(valor) || 0,
        dia_vencimento: diaNum,
        subitem_id: subitemId || null,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK_CONTAS });
      setNome("");
      setValor("");
      setDia("");
      setSubitemId("");
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
          <div>
            <Label htmlFor="nova-conta-sub">
              Item do orçamento <span className="text-muted-foreground">(opcional)</span>
            </Label>
            <select
              id="nova-conta-sub"
              className="mt-1 h-10 w-full rounded-md border border-border bg-background px-2 text-sm"
              value={subitemId}
              onChange={(e) => setSubitemId(e.target.value)}
            >
              <option value="">Escolher depois…</option>
              {grupos.map((g) => (
                <optgroup key={g.categoria.id} label={g.categoria.nome}>
                  {g.subitens.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.nome}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
            <p className="mt-1 text-[11px] text-muted-foreground">
              É onde o valor entra quando você usar o "Chegou o boleto".
            </p>
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
