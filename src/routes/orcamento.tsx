import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  Mic,
  TrendingUp,
  TrendingDown,
  Minus,
  Upload,
  HelpCircle,
  ArrowUp,
  EyeOff,
  Pencil,
  Undo2,
} from "lucide-react";
import { toast } from "sonner";
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
  fetchSubitensOcultosIds,
  ocultarSubitem,
  restaurarSubitem,
  renomearSubitem,
  inserirCategoria,
  inserirSubitem,
  upsertLancamento,
  type Categoria,
  type Classificacao,
  type Subitem,
  type Lancamento,
} from "@/lib/db";
import { useMes } from "@/lib/mes-context";
import { formatBRL } from "@/lib/format";
import { MesSelector } from "@/components/MesSelector";
import { EmptyState } from "@/components/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import { PageTitle } from "@/components/PageTitle";

export const Route = createFileRoute("/orcamento")({
  head: () => ({
    meta: [
      { title: "Orçamento do mês - Família no Azul" },
      {
        name: "description",
        content: "Veja categorias, valores previstos e gastos reais do mês.",
      },
    ],
  }),
  component: OrcamentoPage,
});

function diffClasses(diff: number): string {
  if (diff > 0) return "text-success";
  if (diff < 0) return "text-danger";
  return "text-muted-foreground";
}
function diffBadgeClasses(diff: number): string {
  if (diff > 0) return "bg-success/10 text-success";
  if (diff < 0) return "bg-danger/10 text-danger";
  return "bg-muted text-muted-foreground";
}
function signed(diff: number): string {
  const s = diff > 0 ? "+" : diff < 0 ? "−" : "";
  return `${s}${formatBRL(Math.abs(diff))}`;
}
function diffIcon(diff: number) {
  if (diff > 0) return TrendingUp;
  if (diff < 0) return TrendingDown;
  return Minus;
}
function diffLabel(diff: number): string {
  if (diff > 0) return "sobrou";
  if (diff < 0) return "estourou";
  return "neutro";
}

function OrcamentoPage() {
  const { mes } = useMes();
  const qc = useQueryClient();
  const topoRef = useRef<HTMLDivElement>(null);
  const explicacaoRef = useRef<HTMLDivElement>(null);

  const scrollToExplicacao = () => {
    explicacaoRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  const scrollToTopo = () => {
    topoRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const catsQ = useQuery({ queryKey: qk.categorias, queryFn: fetchCategorias });
  const subsQ = useQuery({ queryKey: qk.subitens, queryFn: fetchSubitens });
  const lancsQ = useQuery({ queryKey: qk.lancamentos(mes), queryFn: () => fetchLancamentos(mes) });
  const ocultosQ = useQuery({ queryKey: qk.subitensOcultos, queryFn: fetchSubitensOcultosIds });

  const carregando = catsQ.isLoading || subsQ.isLoading || lancsQ.isLoading;

  const ocultosSet = useMemo(() => new Set(ocultosQ.data ?? []), [ocultosQ.data]);

  const lancsBySub = useMemo(() => {
    const m = new Map<string, Lancamento>();
    (lancsQ.data ?? []).forEach((l) => m.set(l.subitem_id, l));
    return m;
  }, [lancsQ.data]);

  // Itens visíveis e ocultos por categoria. Ocultar é por família e reversível.
  const subsByCat = useMemo(() => {
    const m = new Map<string, { visiveis: Subitem[]; ocultos: Subitem[] }>();
    (subsQ.data ?? []).forEach((s) => {
      if (!m.has(s.categoria_id)) m.set(s.categoria_id, { visiveis: [], ocultos: [] });
      const bucket = m.get(s.categoria_id)!;
      (ocultosSet.has(s.id) ? bucket.ocultos : bucket.visiveis).push(s);
    });
    for (const b of m.values()) {
      b.visiveis.sort((a, z) => a.ordem - z.ordem);
      b.ocultos.sort((a, z) => a.ordem - z.ordem);
    }
    return m;
  }, [subsQ.data, ocultosSet]);

  const ocultarMut = useMutation({
    mutationFn: ocultarSubitem,
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.subitensOcultos }),
    onError: (e: Error) => toast.error(e.message || "Não foi possível ocultar o item."),
  });
  const restaurarMut = useMutation({
    mutationFn: restaurarSubitem,
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.subitensOcultos }),
    onError: (e: Error) => toast.error(e.message || "Não foi possível restaurar o item."),
  });
  const renomearMut = useMutation({
    mutationFn: ({ id, nome }: { id: string; nome: string }) => renomearSubitem(id, nome),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.subitens }),
    onError: (e: Error) => toast.error(e.message || "Não foi possível renomear o item."),
  });

  const totais = useMemo(() => {
    let prev = 0, real = 0, diff = 0;
    (lancsQ.data ?? []).forEach((l) => {
      prev += Number(l.custo_previsto);
      real += Number(l.custo_real);
      diff += Number(l.diferenca);
    });
    return { prev, real, diff };
  }, [lancsQ.data]);

  const cats = useMemo(
    () => [...(catsQ.data ?? [])].sort((a, b) => a.ordem - b.ordem),
    [catsQ.data],
  );

  // Estado de aberto/fechado lembrado durante a sessão. Primeira aberta por padrão.
  const [openCats, setOpenCats] = useState<string[]>([]);
  const [openInit, setOpenInit] = useState(false);
  useEffect(() => {
    if (!openInit && cats.length > 0) {
      setOpenCats([cats[0].id]);
      setOpenInit(true);
    }
  }, [cats, openInit]);

  const upsertMut = useMutation({
    mutationFn: upsertLancamento,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.lancamentos(mes) });
      qc.invalidateQueries({ queryKey: qk.resumo(mes) });
      qc.invalidateQueries({ queryKey: qk.bloco503020(mes) });
      qc.invalidateQueries({ queryKey: qk.gastosMes(mes) });
    },
  });

  return (
    <div className="space-y-5">
      <header ref={topoRef} className="space-y-3">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <PageTitle>Orçamento</PageTitle>
            <p className="text-sm text-muted-foreground">
              Planeje e acompanhe seus gastos do mês
            </p>
          </div>
          <Link
            to="/importar"
            className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-xs font-medium shadow-soft transition-colors hover:border-primary/40 hover:bg-primary/5"
          >
            <Upload className="h-4 w-4 text-primary" />
            <span className="flex flex-col items-start leading-tight">
              <span>Importar extrato do banco</span>
              <span className="text-[10px] font-normal text-muted-foreground">
                Preenchimento automático dos gastos
              </span>
            </span>
          </Link>
        </div>
        <button
          onClick={scrollToExplicacao}
          className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-primary/10 px-4 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary/20"
        >
          <HelpCircle className="h-4 w-4" />
          Passo a passo para seu planejamento
        </button>
        <MesSelector />
      </header>

      {/* Resumo fixo no topo */}
      <section className="sticky top-2 z-20 grid grid-cols-3 gap-2 rounded-2xl border border-border bg-card/95 p-3 shadow-soft backdrop-blur sm:gap-3 sm:p-4">
        <div>
          <div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Planejado</div>
          <div className="tabular mt-0.5 text-sm font-bold sm:text-base">
            {carregando ? <Skeleton className="h-5 w-20" /> : formatBRL(totais.prev)}
          </div>
        </div>
        <div>
          <div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Gasto</div>
          <div className="tabular mt-0.5 text-sm font-bold sm:text-base">
            {carregando ? <Skeleton className="h-5 w-20" /> : formatBRL(totais.real)}
          </div>
        </div>
        <div>
          <div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Sobrou</div>
          <div
            className={`tabular mt-0.5 flex items-center gap-1 text-sm font-bold sm:text-base ${diffClasses(totais.diff)}`}
            aria-label={`Diferença ${diffLabel(totais.diff)} ${signed(totais.diff)}`}
          >
            {carregando ? (
              <Skeleton className="h-5 w-20" />
            ) : (
              <>
                {(() => {
                  const I = diffIcon(totais.diff);
                  return <I className="h-4 w-4" aria-hidden="true" />;
                })()}
                <span>{signed(totais.diff)}</span>
              </>
            )}
          </div>
        </div>
      </section>

      {carregando ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 w-full rounded-2xl" />
          ))}
        </div>
      ) : cats.length === 0 ? (
        <EmptyState
          title="Nenhuma categoria ainda"
          description={'Toque em "Nova categoria" abaixo para começar a planejar o mês.'}
        />
      ) : (
        <Accordion
          type="multiple"
          value={openCats}
          onValueChange={(v) => setOpenCats(v as string[])}
          className="space-y-2"
        >
          {cats.map((cat) => (
            <CategoriaSection
              key={cat.id}
              categoria={cat}
              subitens={subsByCat.get(cat.id)?.visiveis ?? []}
              subitensOcultos={subsByCat.get(cat.id)?.ocultos ?? []}
              lancsBySub={lancsBySub}
              onSave={(subitem_id, custo_previsto, custo_real) =>
                upsertMut.mutateAsync({ subitem_id, mes_ref: mes, custo_previsto, custo_real })
              }
              onOcultar={(subitem_id) => ocultarMut.mutate(subitem_id)}
              onRestaurar={(subitem_id) => restaurarMut.mutate(subitem_id)}
              onRenomear={(id, nome) => renomearMut.mutate({ id, nome })}
            />
          ))}
        </Accordion>
      )}

      <NovaCategoriaDialog proximaOrdem={(catsQ.data?.length ?? 0) + 1} />

      {/* Passo a passo do planejamento */}
      <section
        ref={explicacaoRef}
        className="rounded-2xl border border-border bg-card p-6 shadow-soft"
      >
        <h2 className="text-lg font-bold text-foreground">Passo a passo para seu planejamento</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Esta tela é o plano de gastos da sua família para o mês. Cada linha é um{" "}
          <strong className="text-foreground">item</strong> (aluguel, mercado, luz...), agrupado
          por categoria. Para cada item você define o que pretende gastar e acompanha o que gastou
          de verdade. É só seguir os 4 passos:
        </p>

        <ol className="mt-5 space-y-4 text-sm text-muted-foreground">
          <li className="flex gap-3">
            <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
              1
            </span>
            <span>
              <strong className="text-foreground">Item:</strong> encontre o gasto na lista (ex.:
              &quot;Conta de luz&quot; dentro de Moradia). Não achou? Toque em{" "}
              <strong className="text-foreground">&quot;novo item&quot;</strong> dentro da
              categoria, ou crie uma categoria nova no botão lá embaixo.
            </span>
          </li>
          <li className="flex gap-3">
            <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
              2
            </span>
            <span>
              <strong className="text-foreground">Planejado:</strong> no começo do mês, preencha
              quanto você <em>pretende</em> gastar em cada item. Não precisa ser exato - use o
              valor do mês passado ou um chute honesto. Esse número é a sua meta.
            </span>
          </li>
          <li className="flex gap-3">
            <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
              3
            </span>
            <span>
              <strong className="text-foreground">Realizado:</strong> é o que você gastou de
              verdade. Ele cresce sozinho quando você usa o{" "}
              <strong className="text-foreground">&quot;Anotar um gasto&quot;</strong> do Painel -
              mas você também pode digitar direto aqui, no campo do item.
            </span>
          </li>
          <li className="flex gap-3">
            <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
              4
            </span>
            <span>
              <strong className="text-foreground">Diferença:</strong> o app calcula sozinho:
              Planejado − Realizado. <strong className="text-success">Verde</strong> = sobrou
              dinheiro nesse item. <strong className="text-danger">Vermelho</strong> = passou do
              planejado - vale olhar com carinho no próximo mês.
            </span>
          </li>
        </ol>

        <h3 className="mt-6 text-sm font-semibold text-foreground">Um exemplo rápido:</h3>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Você planejou <strong className="text-foreground">R$ 800</strong> para Mercado. Durante o
          mês, foi anotando as compras e o Realizado chegou a{" "}
          <strong className="text-foreground">R$ 650</strong>. A Diferença mostra{" "}
          <strong className="text-success">+R$ 150 em verde</strong>: sobrou! Se tivesse gastado R$
          900, mostraria <strong className="text-danger">−R$ 100 em vermelho</strong>.
        </p>

        <div className="mt-4 rounded-xl bg-primary/5 p-4">
          <p className="text-sm font-medium text-foreground">Dica</p>
          <p className="mt-1 text-sm text-muted-foreground">
            O resumo fixo no topo (Planejado · Gasto · Sobrou) soma todos os itens do mês. Revise
            uma vez por semana: 3 minutos bastam pra não ter surpresa no dia 30.
          </p>
        </div>

        <div className="mt-6 flex justify-center">
          <button
            onClick={scrollToTopo}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <ArrowUp className="h-4 w-4" />
            Voltar ao topo
          </button>
        </div>
      </section>

      <NovoGastoFab />
    </div>
  );
}

function CategoriaSection({
  categoria,
  subitens,
  subitensOcultos,
  lancsBySub,
  onSave,
  onOcultar,
  onRestaurar,
  onRenomear,
}: {
  categoria: Categoria;
  subitens: Subitem[];
  subitensOcultos: Subitem[];
  lancsBySub: Map<string, Lancamento>;
  onSave: (subitem_id: string, custo_previsto: number, custo_real: number) => Promise<void>;
  onOcultar: (subitem_id: string) => void;
  onRestaurar: (subitem_id: string) => void;
  onRenomear: (subitem_id: string, nome: string) => void;
}) {
  const [mostrarOcultos, setMostrarOcultos] = useState(false);
  const sub = useMemo(() => {
    let prev = 0, real = 0, diff = 0;
    subitens.forEach((s) => {
      const l = lancsBySub.get(s.id);
      prev += Number(l?.custo_previsto ?? 0);
      real += Number(l?.custo_real ?? 0);
      diff += Number(l?.diferenca ?? 0);
    });
    return { prev, real, diff };
  }, [subitens, lancsBySub]);

  return (
    <AccordionItem
      value={categoria.id}
      className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft"
    >
      <AccordionTrigger className="px-4 py-3 hover:no-underline">
        <div className="flex w-full items-center gap-3">
          <div className="min-w-0 flex-1 text-left">
            <div className="truncate text-sm font-semibold">{categoria.nome}</div>
            <div className="tabular text-[11px] text-muted-foreground">
              Planejado {formatBRL(sub.prev)} · Gasto {formatBRL(sub.real)}
            </div>
          </div>
          <span
            className={`tabular inline-flex shrink-0 items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold ${diffBadgeClasses(sub.diff)}`}
            aria-label={`${diffLabel(sub.diff)} ${signed(sub.diff)}`}
          >
            {(() => {
              const I = diffIcon(sub.diff);
              return <I className="h-3.5 w-3.5" aria-hidden="true" />;
            })()}
            {signed(sub.diff)}
          </span>
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-3 pb-4 sm:px-4">
        {subitens.length === 0 ? (
          <p className="border-t border-border pt-3 text-xs text-muted-foreground">
            Nenhum item nesta categoria ainda.
          </p>
        ) : (
          <>
            <div className="hidden border-t border-border pt-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground sm:grid sm:grid-cols-[1fr_120px_120px_110px_2rem] sm:gap-3 sm:px-1">
              <span>Item</span>
              <span className="text-right">Planejado</span>
              <span className="text-right">Realizado</span>
              <span className="text-right">Diferença</span>
              <span aria-hidden="true" />
            </div>
            <ul className="divide-y divide-border border-t border-border">
              {subitens.map((s) => (
                <SubitemRow
                  key={s.id}
                  subitem={s}
                  lancamento={lancsBySub.get(s.id)}
                  onSave={(p, r) => onSave(s.id, p, r)}
                  onOcultar={() => onOcultar(s.id)}
                  onRenomear={(nome) => onRenomear(s.id, nome)}
                />
              ))}
            </ul>
          </>
        )}

        {subitensOcultos.length > 0 && (
          <div className="mt-3 border-t border-border pt-3">
            <button
              type="button"
              onClick={() => setMostrarOcultos((v) => !v)}
              className="text-xs font-medium text-muted-foreground hover:text-foreground"
            >
              {mostrarOcultos ? "Esconder" : "Ver"} {subitensOcultos.length}{" "}
              {subitensOcultos.length === 1 ? "item oculto" : "itens ocultos"}
            </button>
            {mostrarOcultos && (
              <ul className="mt-2 space-y-1.5">
                {subitensOcultos.map((s) => (
                  <li
                    key={s.id}
                    className="flex items-center justify-between gap-2 rounded-lg bg-muted/40 px-3 py-1.5 text-sm"
                  >
                    <span className="truncate text-muted-foreground">{s.nome}</span>
                    <button
                      type="button"
                      onClick={() => onRestaurar(s.id)}
                      className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-primary hover:underline"
                    >
                      <Undo2 className="h-3.5 w-3.5" /> restaurar
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        <NovoSubitemDialog categoriaId={categoria.id} proximaOrdem={subitens.length + 1} />
      </AccordionContent>
    </AccordionItem>
  );
}

function SubitemRow({
  subitem,
  lancamento,
  onSave,
  onOcultar,
  onRenomear,
}: {
  subitem: Subitem;
  lancamento: Lancamento | undefined;
  onSave: (previsto: number, real: number) => Promise<void>;
  onOcultar?: () => void;
  onRenomear?: (nome: string) => void;
}) {
  const prevDb = Number(lancamento?.custo_previsto ?? 0);
  const realDb = Number(lancamento?.custo_real ?? 0);
  const diff = Number(lancamento?.diferenca ?? 0);
  // Só dá pra ocultar item sem nada lançado no mês — evita esconder algo com valor.
  const podeOcultar = onOcultar && prevDb === 0 && realDb === 0;

  // Só item criado pela família pode ser renomeado: o catálogo global é
  // compartilhado entre todas as famílias (e a RLS barra a edição dele).
  const podeRenomear = Boolean(onRenomear && subitem.user_id);
  const [editando, setEditando] = useState(false);
  const [nomeEdit, setNomeEdit] = useState(subitem.nome);

  const [prev, setPrev] = useState(String(prevDb));
  const [real, setReal] = useState(String(realDb));

  useEffect(() => {
    setPrev(String(prevDb));
    setReal(String(realDb));
  }, [prevDb, realDb]);

  const commit = async (nextPrev: number, nextReal: number) => {
    if (nextPrev === prevDb && nextReal === realDb) return;
    await onSave(nextPrev, nextReal);
  };

  return (
    <li className="py-2 sm:grid sm:grid-cols-[1fr_120px_120px_110px_2rem] sm:items-center sm:gap-3 sm:px-1">
      <div className="flex min-w-0 items-center gap-1.5">
        {editando ? (
          <form
            className="flex min-w-0 flex-1 items-center gap-1.5"
            onSubmit={(e) => {
              e.preventDefault();
              const novo = nomeEdit.trim();
              if (novo && novo !== subitem.nome) onRenomear?.(novo);
              setEditando(false);
            }}
          >
            <Input
              autoFocus
              value={nomeEdit}
              onChange={(e) => setNomeEdit(e.target.value)}
              onBlur={() => {
                const novo = nomeEdit.trim();
                if (novo && novo !== subitem.nome) onRenomear?.(novo);
                setEditando(false);
              }}
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  setNomeEdit(subitem.nome);
                  setEditando(false);
                }
              }}
              className="h-8 text-sm"
              aria-label={`Novo nome para ${subitem.nome}`}
            />
          </form>
        ) : (
          <>
            <span className="min-w-0 truncate text-sm font-medium">{subitem.nome}</span>
            {podeRenomear && (
              <button
                type="button"
                onClick={() => {
                  setNomeEdit(subitem.nome);
                  setEditando(true);
                }}
                aria-label={`Renomear ${subitem.nome}`}
                title="Renomear item"
                className="grid h-6 w-6 shrink-0 place-items-center rounded-md text-muted-foreground/60 hover:bg-muted hover:text-foreground"
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
            )}
          </>
        )}
      </div>

      {/* Mobile: lado a lado */}
      <div className="mt-2 grid grid-cols-2 gap-2 sm:hidden">
        <label className="block">
          <span className="text-[11px] text-muted-foreground">Planejado</span>
          <Input
            inputMode="decimal"
            value={prev}
            onChange={(e) => setPrev(e.target.value)}
            onBlur={() => commit(Number(prev) || 0, Number(real) || 0)}
            className="tabular h-11"
          />
        </label>
        <label className="block">
          <span className="text-[11px] text-muted-foreground">Gasto</span>
          <Input
            inputMode="decimal"
            value={real}
            onChange={(e) => setReal(e.target.value)}
            onBlur={() => commit(Number(prev) || 0, Number(real) || 0)}
            className="tabular h-11"
          />
        </label>
      </div>
      <div className="mt-2 flex items-center justify-end gap-2 sm:hidden">
        <span
          className={`tabular inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-semibold ${diffBadgeClasses(diff)}`}
          aria-label={`${diffLabel(diff)} ${signed(diff)}`}
        >
          {(() => {
            const I = diffIcon(diff);
            return <I className="h-3 w-3" aria-hidden="true" />;
          })()}
          {signed(diff)}
        </span>
        {podeOcultar && (
          <button
            type="button"
            onClick={onOcultar}
            aria-label={`Tirar ${subitem.nome} da minha lista`}
            title="Tirar da minha lista - dá pra trazer de volta depois"
            className="grid h-7 w-7 shrink-0 place-items-center rounded-md text-muted-foreground/60 hover:bg-muted hover:text-foreground"
          >
            <EyeOff className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Desktop: colunas */}
      <Input
        inputMode="decimal"
        value={prev}
        onChange={(e) => setPrev(e.target.value)}
        onBlur={() => commit(Number(prev) || 0, Number(real) || 0)}
        className="tabular hidden h-10 text-right sm:block"
      />
      <Input
        inputMode="decimal"
        value={real}
        onChange={(e) => setReal(e.target.value)}
        onBlur={() => commit(Number(prev) || 0, Number(real) || 0)}
        className="tabular hidden h-10 text-right sm:block"
      />
      <div
        className={`tabular hidden items-center justify-end gap-1 text-right text-sm font-semibold sm:flex ${diffClasses(diff)}`}
        aria-label={`${diffLabel(diff)} ${signed(diff)}`}
      >
        {(() => {
          const I = diffIcon(diff);
          return <I className="h-4 w-4" aria-hidden="true" />;
        })()}
        <span>{signed(diff)}</span>
      </div>

      {/* Coluna do "ocultar" (desktop): alinhada no fim, depois da diferença */}
      <div className="hidden sm:flex sm:justify-end">
        {podeOcultar && (
          <button
            type="button"
            onClick={onOcultar}
            aria-label={`Tirar ${subitem.nome} da minha lista`}
            title="Tirar da minha lista - dá pra trazer de volta depois"
            className="grid h-7 w-7 shrink-0 place-items-center rounded-md text-muted-foreground/50 hover:bg-muted hover:text-foreground"
          >
            <EyeOff className="h-4 w-4" />
          </button>
        )}
      </div>
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
          <Plus className="h-3 w-3" /> novo item
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Novo item</DialogTitle>
          <DialogDescription>
            Dê um nome e diga em qual grupo do 50-30-20 ele entra.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label>Nome</Label>
            <Input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex: Aluguel" />
          </div>
          <div>
            <Label>Grupo no 50-30-20</Label>
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
            Digite ou fale seu gasto. (A categorização por IA entra numa fase futura - por
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
