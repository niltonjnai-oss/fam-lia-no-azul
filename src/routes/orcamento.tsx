import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Mic, Pencil, Check, X } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  qk,
  fetchCategorias,
  fetchSubitens,
  fetchLancamentos,
  inserirCategoria,
  inserirSubitem,
  upsertLancamento,
  type Classificacao,
  type Subitem,
  type Lancamento,
} from "@/lib/db";
import { useMes } from "@/lib/mes-context";
import { formatBRL } from "@/lib/format";
import { MesSelector } from "@/components/MesSelector";
import { EmptyState } from "@/components/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/orcamento")({
  head: () => ({
    meta: [
      { title: "Orçamento do mês — Família no Azul" },
      {
        name: "description",
        content: "Veja categorias, valores previstos e gastos reais do mês.",
      },
    ],
  }),
  component: OrcamentoPage,
});

function OrcamentoPage() {
  const { mes } = useMes();
  const qc = useQueryClient();

  const catsQ = useQuery({ queryKey: qk.categorias, queryFn: fetchCategorias });
  const subsQ = useQuery({ queryKey: qk.subitens, queryFn: fetchSubitens });
  const lancsQ = useQuery({ queryKey: qk.lancamentos(mes), queryFn: () => fetchLancamentos(mes) });

  const carregando = catsQ.isLoading || subsQ.isLoading || lancsQ.isLoading;

  const lancsBySub = useMemo(() => {
    const m = new Map<string, Lancamento>();
    (lancsQ.data ?? []).forEach((l) => m.set(l.subitem_id, l));
    return m;
  }, [lancsQ.data]);

  const subsByCat = useMemo(() => {
    const m = new Map<string, Subitem[]>();
    (subsQ.data ?? []).forEach((s) => {
      if (!m.has(s.categoria_id)) m.set(s.categoria_id, []);
      m.get(s.categoria_id)!.push(s);
    });
    return m;
  }, [subsQ.data]);

  const upsertMut = useMutation({
    mutationFn: upsertLancamento,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.lancamentos(mes) });
      qc.invalidateQueries({ queryKey: qk.resumo(mes) });
      qc.invalidateQueries({ queryKey: qk.bloco503020(mes) });
    },
  });

  return (
    <div className="space-y-5">
      <header className="space-y-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Orçamento</h1>
          <p className="text-sm text-muted-foreground">
            Compare o previsto e o real de cada categoria.
          </p>
        </div>
        <MesSelector />
      </header>

      {carregando ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 w-full rounded-2xl" />
          ))}
        </div>
      ) : (catsQ.data ?? []).length === 0 ? (
        <EmptyState
          title="Nenhuma categoria criada"
          description="Crie sua primeira categoria pelo botão + para começar a planejar o mês."
        />
      ) : (
        <Accordion type="multiple" className="space-y-2">
          {(catsQ.data ?? []).map((cat) => {
            const subs = subsByCat.get(cat.id) ?? [];
            const totalPrev = subs.reduce(
              (acc, s) => acc + Number(lancsBySub.get(s.id)?.custo_previsto ?? 0),
              0,
            );
            const totalReal = subs.reduce(
              (acc, s) => acc + Number(lancsBySub.get(s.id)?.custo_real ?? 0),
              0,
            );
            const diff = totalPrev - totalReal;
            const estourou = diff < 0;
            return (
              <AccordionItem
                key={cat.id}
                value={cat.id}
                className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft"
              >
                <AccordionTrigger className="px-4 py-3 hover:no-underline">
                  <div className="flex w-full items-center gap-3">
                    <div className="min-w-0 flex-1 text-left">
                      <div className="truncate text-sm font-semibold">{cat.nome}</div>
                      <div className="tabular text-xs text-muted-foreground">
                        Previsto {formatBRL(totalPrev)} · Real {formatBRL(totalReal)}
                      </div>
                    </div>
                    <div
                      className={[
                        "tabular shrink-0 rounded-lg px-2 py-1 text-xs font-semibold",
                        estourou ? "bg-danger/10 text-danger" : "bg-success/10 text-success",
                      ].join(" ")}
                    >
                      {estourou ? "−" : "+"}
                      {formatBRL(Math.abs(diff))}
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                  {subs.length === 0 ? (
                    <p className="border-t border-border pt-3 text-xs text-muted-foreground">
                      Nenhum subitem nesta categoria.
                    </p>
                  ) : (
                    <ul className="space-y-1.5 border-t border-border pt-3">
                      {subs.map((s) => (
                        <SubitemRow
                          key={s.id}
                          subitem={s}
                          lancamento={lancsBySub.get(s.id)}
                          onSave={(prev, real) =>
                            upsertMut.mutateAsync({
                              subitem_id: s.id,
                              mes_ref: mes,
                              custo_previsto: prev,
                              custo_real: real,
                            })
                          }
                        />
                      ))}
                    </ul>
                  )}
                  <NovoSubitemDialog categoriaId={cat.id} proximaOrdem={subs.length + 1} />
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      )}

      <NovaCategoriaDialog proximaOrdem={(catsQ.data?.length ?? 0) + 1} />
      <NovoGastoFab />
    </div>
  );
}

function SubitemRow({
  subitem,
  lancamento,
  onSave,
}: {
  subitem: Subitem;
  lancamento: Lancamento | undefined;
  onSave: (previsto: number, real: number) => Promise<void>;
}) {
  const [editando, setEditando] = useState(false);
  const [prev, setPrev] = useState(String(lancamento?.custo_previsto ?? "0"));
  const [real, setReal] = useState(String(lancamento?.custo_real ?? "0"));
  const [saving, setSaving] = useState(false);

  const previsto = Number(lancamento?.custo_previsto ?? 0);
  const realizado = Number(lancamento?.custo_real ?? 0);
  const diff = previsto - realizado;
  const estourou = diff < 0;

  if (editando) {
    return (
      <li className="space-y-2 rounded-lg bg-muted/40 p-2">
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-medium">{subitem.nome}</span>
          <div className="flex gap-1">
            <button
              type="button"
              disabled={saving}
              onClick={async () => {
                setSaving(true);
                try {
                  await onSave(Number(prev) || 0, Number(real) || 0);
                  setEditando(false);
                } finally {
                  setSaving(false);
                }
              }}
              className="grid h-8 w-8 place-items-center rounded-md bg-primary/10 text-primary hover:bg-primary/20"
              aria-label="Salvar"
            >
              <Check className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setEditando(false)}
              className="grid h-8 w-8 place-items-center rounded-md hover:bg-muted"
              aria-label="Cancelar"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <label className="block">
            <span className="text-[11px] text-muted-foreground">Previsto</span>
            <Input
              inputMode="decimal"
              value={prev}
              onChange={(e) => setPrev(e.target.value)}
              className="tabular h-9"
            />
          </label>
          <label className="block">
            <span className="text-[11px] text-muted-foreground">Real</span>
            <Input
              inputMode="decimal"
              value={real}
              onChange={(e) => setReal(e.target.value)}
              className="tabular h-9"
            />
          </label>
        </div>
      </li>
    );
  }

  return (
    <li className="flex items-center justify-between gap-2 text-sm">
      <div className="min-w-0 flex-1">
        <div className="truncate font-medium">{subitem.nome}</div>
        <div className="tabular text-[11px] text-muted-foreground">
          Previsto {formatBRL(previsto)} · Real {formatBRL(realizado)}
        </div>
      </div>
      <span
        className={[
          "tabular shrink-0 rounded-md px-2 py-0.5 text-[11px] font-semibold",
          estourou ? "bg-danger/10 text-danger" : "bg-success/10 text-success",
        ].join(" ")}
      >
        {estourou ? "−" : "+"}
        {formatBRL(Math.abs(diff))}
      </span>
      <button
        type="button"
        onClick={() => {
          setPrev(String(previsto));
          setReal(String(realizado));
          setEditando(true);
        }}
        className="grid h-8 w-8 place-items-center rounded-md hover:bg-muted"
        aria-label="Editar"
      >
        <Pencil className="h-4 w-4" />
      </button>
    </li>
  );
}

function NovoSubitemDialog({
  categoriaId,
  proximaOrdem,
}: {
  categoriaId: string;
  proximaOrdem: number;
}) {
  const [open, setOpen] = useState(false);
  const [nome, setNome] = useState("");
  const [classificacao, setClassificacao] = useState<Classificacao | "">("");
  const qc = useQueryClient();
  const mut = useMutation({
    mutationFn: inserirSubitem,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.subitens });
      setNome("");
      setClassificacao("");
      setOpen(false);
    },
  });
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
        >
          <Plus className="h-3 w-3" /> novo subitem
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Novo subitem</DialogTitle>
          <DialogDescription>Escolha um nome e a classificação 50-30-20.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label>Nome</Label>
            <Input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex: Aluguel" />
          </div>
          <div>
            <Label>Classificação</Label>
            <Select value={classificacao} onValueChange={(v) => setClassificacao(v as Classificacao)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Essencial">Essencial</SelectItem>
                <SelectItem value="Estilo de Vida">Estilo de Vida</SelectItem>
                <SelectItem value="Reserva/Dívidas">Reserva/Dívidas</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button
            disabled={!nome || !classificacao || mut.isPending}
            onClick={() =>
              mut.mutate({
                categoria_id: categoriaId,
                nome,
                classificacao: classificacao as Classificacao,
                ordem: proximaOrdem,
              })
            }
          >
            Adicionar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function NovaCategoriaDialog({ proximaOrdem }: { proximaOrdem: number }) {
  const [open, setOpen] = useState(false);
  const [nome, setNome] = useState("");
  const qc = useQueryClient();
  const mut = useMutation({
    mutationFn: () => inserirCategoria(nome, proximaOrdem),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.categorias });
      setNome("");
      setOpen(false);
    },
  });
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          <Plus className="h-4 w-4" /> Nova categoria
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nova categoria</DialogTitle>
          <DialogDescription>Ex: Moradia, Transporte, Lazer…</DialogDescription>
        </DialogHeader>
        <div>
          <Label>Nome</Label>
          <Input value={nome} onChange={(e) => setNome(e.target.value)} />
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

function NovoGastoFab() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          aria-label="Adicionar gasto"
          className="fixed bottom-24 right-5 z-40 grid h-14 w-14 place-items-center rounded-full bg-primary text-primary-foreground shadow-elevated transition-transform duration-200 hover:scale-105 active:scale-95 lg:bottom-8 lg:right-8"
        >
          <Plus className="h-6 w-6" />
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Adicionar gasto</DialogTitle>
          <DialogDescription>
            Digite ou fale seu gasto. (A categorização por IA entra numa fase futura — por
            enquanto edite os subitens direto na lista acima.)
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center gap-2 rounded-xl border border-border bg-background p-2">
          <input
            type="text"
            placeholder='Ex: "Mercado 120 reais"'
            className="flex-1 bg-transparent px-2 py-2 text-sm outline-none"
          />
          <button
            type="button"
            className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary hover:bg-primary/15"
            aria-label="Gravar áudio"
          >
            <Mic className="h-5 w-5" />
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
