import { useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, Zap } from "lucide-react";
import { toast } from "sonner";

import {
  qk,
  fetchCategorias,
  fetchSubitens,
  fetchSubitemOutros,
  fetchTransacoesDoDia,
  registrarGasto,
  excluirGastoRapido,
  hojeISO,
  mesAtual,
} from "@/lib/db";
import { formatBRL } from "@/lib/format";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";

function parseValorBRL(s: string): number {
  const n = Number(s.replace(/\./g, "").replace(",", "."));
  return Number.isFinite(n) ? n : 0;
}

/** Sheet do "Anotar um gasto", controlável de fora — usado pelo card do
 *  painel, pela linha de ações rápidas e pelo botão central do bottom nav. */
export function LancamentoRapidoSheet({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const hoje = hojeISO();
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="max-h-[90vh] overflow-y-auto rounded-t-2xl">
        <LancamentoRapidoConteudo hoje={hoje} />
      </SheetContent>
    </Sheet>
  );
}

export function LancamentoRapido({
  open: openProp,
  onOpenChange,
}: {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
} = {}) {
  const [openInterno, setOpenInterno] = useState(false);
  const open = openProp ?? openInterno;
  const setOpen = onOpenChange ?? setOpenInterno;
  const hoje = hojeISO();

  const transacoesQ = useQuery({
    queryKey: qk.transacoesHoje(hoje),
    queryFn: () => fetchTransacoesDoDia(hoje),
  });
  const totalHoje = (transacoesQ.data ?? []).reduce((acc, t) => acc + Number(t.valor), 0);
  const qtdHoje = (transacoesQ.data ?? []).length;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex w-full items-center gap-3 rounded-2xl border border-border bg-card p-4 text-left shadow-soft transition-colors hover:border-cta/40 hover:bg-cta/5"
      >
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-cta text-cta-foreground">
          <Plus className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold">Anotar um gasto</div>
          <div className="text-xs text-muted-foreground">
            {transacoesQ.isLoading ? (
              "Carregando..."
            ) : qtdHoje === 0 ? (
              "Nenhum gasto anotado hoje"
            ) : (
              <>
                {formatBRL(totalHoje)} hoje · {qtdHoje} {qtdHoje === 1 ? "gasto" : "gastos"}
              </>
            )}
          </div>
        </div>
      </button>

      <LancamentoRapidoSheet open={open} onOpenChange={setOpen} />
    </>
  );
}

function LancamentoRapidoConteudo({ hoje }: { hoje: string }) {
  const qc = useQueryClient();
  const mes = mesAtual();

  const valorRef = useRef<HTMLInputElement>(null);
  const [valor, setValor] = useState("");
  const [categoriaId, setCategoriaId] = useState<string>("");
  const [subitemId, setSubitemId] = useState<string>("");
  const [descricao, setDescricao] = useState("");

  const categoriasQ = useQuery({ queryKey: qk.categorias, queryFn: fetchCategorias });
  const subitensQ = useQuery({ queryKey: qk.subitens, queryFn: fetchSubitens });
  const transacoesQ = useQuery({
    queryKey: qk.transacoesHoje(hoje),
    queryFn: () => fetchTransacoesDoDia(hoje),
  });

  const subitensDaCategoria = useMemo(
    () => (subitensQ.data ?? []).filter((s) => s.categoria_id === categoriaId),
    [subitensQ.data, categoriaId],
  );

  const subitensById = useMemo(() => {
    const m = new Map<string, { nome: string; categoria_id: string }>();
    for (const s of subitensQ.data ?? []) m.set(s.id, { nome: s.nome, categoria_id: s.categoria_id });
    return m;
  }, [subitensQ.data]);

  const categoriasById = useMemo(() => {
    const m = new Map<string, string>();
    for (const c of categoriasQ.data ?? []) m.set(c.id, c.nome);
    return m;
  }, [categoriasQ.data]);

  const invalidarPainel = () => {
    qc.invalidateQueries({ queryKey: qk.resumo(mes) });
    qc.invalidateQueries({ queryKey: qk.bloco503020(mes) });
    qc.invalidateQueries({ queryKey: qk.lancamentos(mes) });
    qc.invalidateQueries({ queryKey: qk.gastosMes(mes) });
    qc.invalidateQueries({ queryKey: qk.transacoesHoje(hoje) });
    qc.invalidateQueries({ queryKey: qk.transacoesRecentes });
  };

  const addMut = useMutation({
    mutationFn: async () => {
      const v = parseValorBRL(valor);
      if (v <= 0) throw new Error("Informe um valor maior que zero.");
      if (!categoriaId) throw new Error("Escolha uma categoria.");
      let subId = subitemId;
      if (!subId) {
        const outros = await fetchSubitemOutros(categoriaId);
        if (!outros)
          throw new Error("Escolha um tipo de gasto para esta categoria.");
        subId = outros;
      }
      await registrarGasto({
        subitem_id: subId,
        mes_ref: mes,
        valor: v,
        descricao: descricao.trim() || null,
      });
    },
    onSuccess: () => {
      setValor("");
      setDescricao("");
      invalidarPainel();
      valorRef.current?.focus();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const delMut = useMutation({
    mutationFn: (id: string) => excluirGastoRapido(id),
    onSuccess: invalidarPainel,
    onError: (e: Error) => toast.error(e.message),
  });

  const totalHoje = (transacoesQ.data ?? []).reduce((acc, t) => acc + Number(t.valor), 0);

  return (
    <div className="mx-auto w-full max-w-lg">
      <SheetHeader className="text-left">
        <div className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary/10 text-primary">
            <Zap className="h-4 w-4" />
          </span>
          <div>
            <SheetTitle>Anotar um gasto</SheetTitle>
            <SheetDescription>Registre seus gastos de hoje.</SheetDescription>
          </div>
        </div>
      </SheetHeader>

      <form
        className="mt-4 grid gap-3 sm:grid-cols-2"
        onSubmit={(e) => {
          e.preventDefault();
          addMut.mutate();
        }}
      >
        <div className="space-y-1">
          <Label htmlFor="lr-valor" className="text-xs">Valor (R$)</Label>
          <Input
            id="lr-valor"
            ref={valorRef}
            inputMode="decimal"
            placeholder="0,00"
            value={valor}
            onChange={(e) => setValor(e.target.value)}
            className="tabular h-11"
            autoComplete="off"
            required
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="lr-cat" className="text-xs">Categoria</Label>
          <Select
            value={categoriaId}
            onValueChange={(v) => {
              setCategoriaId(v);
              setSubitemId("");
            }}
          >
            <SelectTrigger id="lr-cat" className="h-11">
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              {(categoriasQ.data ?? []).map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <Label htmlFor="lr-sub" className="text-xs">
            Tipo de gasto <span className="text-muted-foreground">(opcional)</span>
          </Label>
          <Select
            value={subitemId}
            onValueChange={setSubitemId}
            disabled={!categoriaId}
          >
            <SelectTrigger id="lr-sub" className="h-11">
              <SelectValue placeholder={categoriaId ? 'Padrão: "Outros"' : "Escolha a categoria"} />
            </SelectTrigger>
            <SelectContent>
              {subitensDaCategoria.map((s) => (
                <SelectItem key={s.id} value={s.id}>{s.nome}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <Label htmlFor="lr-desc" className="text-xs">
            Descrição <span className="text-muted-foreground">(opcional)</span>
          </Label>
          <Input
            id="lr-desc"
            placeholder="ex.: almoço, uber"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            className="h-11"
            autoComplete="off"
          />
        </div>

        <div className="sm:col-span-2">
          <Button
            type="submit"
            className="h-11 w-full bg-cta text-cta-foreground hover:bg-cta-hover"
            disabled={addMut.isPending}
          >
            <Plus className="mr-1 h-4 w-4" />
            {addMut.isPending ? "Salvando..." : "Salvar gasto"}
          </Button>
        </div>
      </form>

      <div className="mt-5 border-t border-border pt-4">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground">Gasto hoje</span>
          <span className="tabular text-sm font-semibold">
            {transacoesQ.isLoading ? <Skeleton className="h-4 w-20" /> : formatBRL(totalHoje)}
          </span>
        </div>

        {transacoesQ.isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : (transacoesQ.data ?? []).length === 0 ? (
          <p className="rounded-xl bg-muted/40 px-3 py-3 text-xs text-muted-foreground">
            Você ainda não anotou nenhum gasto hoje.
          </p>
        ) : (
          <ul className="space-y-1.5">
            {(transacoesQ.data ?? []).map((t) => {
              const sub = subitensById.get(t.subitem_id);
              const catNome = sub ? categoriasById.get(sub.categoria_id) : undefined;
              const titulo = t.descricao?.trim() || sub?.nome || "Gasto";
              return (
                <li
                  key={t.id}
                  className="flex items-center gap-2 rounded-xl border border-border/60 bg-background/60 px-3 py-2"
                >
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">{titulo}</div>
                    <div className="truncate text-[11px] text-muted-foreground">
                      {catNome ?? "—"}
                      {sub && t.descricao ? ` · ${sub.nome}` : ""}
                    </div>
                  </div>
                  <span className="tabular text-sm font-semibold">{formatBRL(Number(t.valor))}</span>
                  <button
                    type="button"
                    onClick={() => delMut.mutate(t.id)}
                    disabled={delMut.isPending}
                    aria-label="Desfazer lançamento"
                    className="grid h-11 w-11 place-items-center rounded-lg text-muted-foreground hover:bg-danger/10 hover:text-danger"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
