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
  registrarCompraParcelada,
  excluirGastoRapido,
  fetchCartoes,
  hojeISO,
  mesAtual,
  formatMes,
  type FormaPagamento,
} from "@/lib/db";
import { faturaDaCompra } from "@/lib/cartao";
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
import { Checkbox } from "@/components/ui/checkbox";
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

/** Mesmo dia do mês que vem, em ISO - chute inicial pro 1º vencimento, que é
 *  onde a maioria dos carnês e faturas cai. Dia que não existe no mês seguinte
 *  (31 → fevereiro) volta pro último dia dele. */
function proximoMesISO(hojeISO: string): string {
  const [a, m, d] = hojeISO.split("-").map(Number);
  const ultimoDia = new Date(a, m + 1, 0).getDate();
  const dia = Math.min(d, ultimoDia);
  const alvo = new Date(a, m, dia);
  return `${alvo.getFullYear()}-${String(alvo.getMonth() + 1).padStart(2, "0")}-${String(alvo.getDate()).padStart(2, "0")}`;
}

/** Sheet do "Anotar um gasto", controlável de fora - usado pelo card do
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
              "Compras, almoço, Uber, cafezinho…"
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
  const [formaPagamento, setFormaPagamento] = useState<string>("");
  const [parcelado, setParcelado] = useState(false);
  const [numParcelas, setNumParcelas] = useState("");
  const [primeiroVenc, setPrimeiroVenc] = useState(() => proximoMesISO(hoje));
  const [entrada, setEntrada] = useState("");
  const [cartaoId, setCartaoId] = useState<string>("");

  // Parcelamento só faz sentido no crédito ou boleto.
  const permiteParcelar = formaPagamento === "credito" || formaPagamento === "boleto";
  // No boleto cada parcela tem data própria, então dá pra avisar antes de
  // vencer. No crédito o aviso da fatura já vem do banco.
  const permiteLembrete = formaPagamento === "boleto";
  const nParc = Math.max(0, Math.floor(Number(numParcelas) || 0));
  const entradaNum = parseValorBRL(entrada);
  const financiado = Math.max(0, parseValorBRL(valor) - entradaNum);
  const valorParcela = parcelado && nParc >= 2 ? financiado / nParc : 0;

  const categoriasQ = useQuery({ queryKey: qk.categorias, queryFn: fetchCategorias });
  const subitensQ = useQuery({ queryKey: qk.subitens, queryFn: fetchSubitens });
  const cartoesQ = useQuery({ queryKey: qk.cartoes, queryFn: fetchCartoes });
  const cartoes = (cartoesQ.data ?? []).filter((c) => c.ativo);

  // Crédito: quem paga é a fatura, não o mês da compra. Com o cartão
  // cadastrado o app sabe em qual delas o gasto cai - compra feita depois do
  // fechamento só entra na fatura seguinte.
  const cartaoSel = cartoes.find((c) => c.id === cartaoId) ?? null;
  const fatura = cartaoSel
    ? faturaDaCompra(hoje, cartaoSel.dia_fechamento, cartaoSel.dia_vencimento)
    : null;
  // Mês do orçamento que recebe o gasto: o da fatura, quando há cartão.
  const mesDestino = fatura?.mesRef ?? mes;
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

  // `alvo` pode não ser o mês corrente: gasto no crédito entra no mês da
  // fatura, e a parcela, no mês do vencimento.
  const invalidarPainel = (alvo = mes) => {
    for (const m of new Set([mes, alvo])) {
      qc.invalidateQueries({ queryKey: qk.resumo(m) });
      qc.invalidateQueries({ queryKey: qk.bloco503020(m) });
      qc.invalidateQueries({ queryKey: qk.lancamentos(m) });
      qc.invalidateQueries({ queryKey: qk.gastosMes(m) });
      qc.invalidateQueries({ queryKey: qk.formaPagamento(m) });
    }
    qc.invalidateQueries({ queryKey: qk.transacoesHoje(hoje) });
    qc.invalidateQueries({ queryKey: qk.transacoesRecentes });
  };

  const addMut = useMutation({
    mutationFn: async () => {
      const v = parseValorBRL(valor);
      if (v <= 0) throw new Error("Informe um valor maior que zero.");

      // Compra parcelada (crédito/boleto): cria a dívida e espalha a parcela
      // pelos meses. Não usa categoria — a parcela entra em Reserva/Dívidas.
      if (parcelado && permiteParcelar) {
        if (nParc < 2) throw new Error("Em quantas vezes? Informe 2 ou mais parcelas.");
        if (!primeiroVenc) throw new Error("Informe a data do primeiro vencimento.");
        if (entradaNum >= v) throw new Error("A entrada tem que ser menor que o valor total.");
        await registrarCompraParcelada({
          descricao: descricao.trim() || "Compra parcelada",
          valor_total: v,
          entrada: entradaNum,
          parcelas: nParc,
          mes_compra: mes,
          primeiro_vencimento: primeiroVenc,
          forma_pagamento: formaPagamento as FormaPagamento,
          criar_lembrete: permiteLembrete,
        });
        return;
      }

      if (!categoriaId) throw new Error("Escolha uma categoria.");
      let subId = subitemId;
      if (!subId) {
        const outros = await fetchSubitemOutros(categoriaId);
        if (!outros)
          throw new Error("Escolha um tipo de gasto para esta categoria.");
        subId = outros;
      }
      // No crédito com cartão cadastrado, o gasto entra no orçamento do mês
      // em que a FATURA vence - não no mês da compra.
      await registrarGasto({
        subitem_id: subId,
        mes_ref: mesDestino,
        valor: v,
        descricao: descricao.trim() || null,
        forma_pagamento: (formaPagamento || null) as FormaPagamento | null,
      });
    },
    onSuccess: () => {
      const alvo = parcelado && permiteParcelar ? primeiroVenc.slice(0, 7) : mesDestino;
      if (alvo !== mes) {
        toast.success(`Lançado no orçamento de ${formatMes(alvo)}.`);
      }
      setValor("");
      setDescricao("");
      setFormaPagamento("");
      setParcelado(false);
      setNumParcelas("");
      setEntrada("");
      setPrimeiroVenc(proximoMesISO(hoje));
      setCartaoId("");
      invalidarPainel(alvo);
      qc.invalidateQueries({ queryKey: qk.dividas });
      qc.invalidateQueries({ queryKey: qk.comprasParceladas });
      qc.invalidateQueries({ queryKey: qk.contas });
      valorRef.current?.focus();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const delMut = useMutation({
    mutationFn: (id: string) => excluirGastoRapido(id),
    onSuccess: () => invalidarPainel(),
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

        <div className="space-y-1 sm:col-span-2">
          <Label htmlFor="lr-forma" className="text-xs">
            Forma de pagamento <span className="text-muted-foreground">(opcional)</span>
          </Label>
          <Select
            value={formaPagamento}
            onValueChange={(v) => {
              setFormaPagamento(v);
              if (v !== "credito" && v !== "boleto") {
                setParcelado(false);
                setNumParcelas("");
                setEntrada("");
              }
              if (v !== "credito") setCartaoId("");
            }}
          >
            <SelectTrigger id="lr-forma" className="h-11">
              <SelectValue placeholder="Como você pagou?" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="dinheiro">Dinheiro</SelectItem>
              <SelectItem value="debito">Cartão de débito</SelectItem>
              <SelectItem value="credito">Cartão de crédito</SelectItem>
              <SelectItem value="pix">Pix</SelectItem>
              <SelectItem value="boleto">Boleto</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {formaPagamento === "credito" && cartoes.length > 0 && (
          <div className="space-y-1 sm:col-span-2">
            <Label htmlFor="lr-cartao" className="text-xs">
              Qual cartão? <span className="text-muted-foreground">(opcional)</span>
            </Label>
            <Select
              value={cartaoId}
              onValueChange={(v) => {
                setCartaoId(v);
                const c = cartoes.find((x) => x.id === v);
                // Preenche o 1º vencimento com a fatura calculada; a pessoa
                // ainda pode mudar (feriado, banco que antecipa, etc).
                if (c) {
                  setPrimeiroVenc(
                    faturaDaCompra(hoje, c.dia_fechamento, c.dia_vencimento).vencimento,
                  );
                }
              }}
            >
              <SelectTrigger id="lr-cartao" className="h-11">
                <SelectValue placeholder="Em qual cartão?" />
              </SelectTrigger>
              <SelectContent>
                {cartoes.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {fatura && !parcelado && (
              <p className="text-[11px] text-muted-foreground">
                Cai na fatura de <strong className="text-foreground">{formatMes(fatura.mesRef)}</strong>{" "}
                (vence {fatura.vencimento.split("-").reverse().join("/")}) - é nesse mês que o gasto
                entra no orçamento.
              </p>
            )}
          </div>
        )}

        {permiteParcelar && (
          <div className="rounded-xl border border-border bg-muted/30 p-3 sm:col-span-2">
            <label className="flex items-center gap-2 text-sm font-medium">
              <Checkbox
                checked={parcelado}
                onCheckedChange={(c) => setParcelado(c === true)}
              />
              Foi parcelado?
            </label>
            {parcelado && (
              <div className="mt-3 space-y-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="lr-parcelas" className="text-xs">
                    Em quantas vezes?
                  </Label>
                  <Input
                    id="lr-parcelas"
                    inputMode="numeric"
                    value={numParcelas}
                    onChange={(e) => setNumParcelas(e.target.value.replace(/\D/g, ""))}
                    placeholder="ex.: 12"
                    className="tabular h-10 w-24 text-center"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="lr-entrada" className="text-xs">
                    Deu entrada? <span className="text-muted-foreground">(opcional)</span>
                  </Label>
                  <Input
                    id="lr-entrada"
                    inputMode="decimal"
                    value={entrada}
                    onChange={(e) => setEntrada(e.target.value)}
                    placeholder="ex.: 30,00"
                    className="tabular h-10 w-32"
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="lr-venc" className="text-xs">
                    Quando vence a 1ª parcela?
                  </Label>
                  <Input
                    id="lr-venc"
                    type="date"
                    value={primeiroVenc}
                    onChange={(e) => setPrimeiroVenc(e.target.value)}
                    className="tabular h-10 w-44"
                  />
                  <p className="text-[11px] text-muted-foreground">
                    {permiteLembrete
                      ? "A data do primeiro boleto."
                      : "A data da fatura em que esta compra cai - se você comprou depois do fechamento, é a fatura do mês seguinte."}
                  </p>
                </div>

                {valorParcela > 0 && (
                  <p className="text-xs text-muted-foreground">
                    {entradaNum > 0 && (
                      <>
                        <strong className="text-foreground">
                          {formatBRL(entradaNum)} de entrada
                        </strong>{" "}
                        (gasto deste mês) mais{" "}
                      </>
                    )}
                    <strong className="text-foreground">
                      {nParc}x de {formatBRL(valorParcela)}
                    </strong>
                    {entradaNum > 0 ? ". " : " "}A parcela entra no seu orçamento
                    (Reserva/Dívidas) por {nParc} meses, a partir do vencimento. Também vira uma
                    dívida pra você acompanhar.
                  </p>
                )}
                {permiteLembrete && primeiroVenc && valorParcela > 0 && (
                  <p className="text-xs text-muted-foreground">
                    Vamos te lembrar antes de cada boleto vencer, até a última parcela.
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        <div className="sm:col-span-2">
          <Button
            type="submit"
            className="h-11 w-full bg-cta text-cta-foreground hover:bg-cta-hover"
            disabled={addMut.isPending}
          >
            <Plus className="mr-1 h-4 w-4" />
            {addMut.isPending
              ? "Salvando..."
              : parcelado && permiteParcelar
                ? "Salvar compra parcelada"
                : "Salvar gasto"}
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
                      {catNome ?? "-"}
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
