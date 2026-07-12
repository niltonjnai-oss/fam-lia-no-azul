import { useMemo, useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Settings2,
  TrendingDown,
  TrendingUp,
  Trophy,
  ListOrdered,
  ArrowLeftRight,
  Flame,
  PiggyBank,
  AlertTriangle,
  ArrowUpRight,
  CheckCircle2,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { formatBRL, formatPct } from "@/lib/format";
import {
  qk,
  fetchCategorias,
  fetchSubitens,
  fetchLancamentos,
  fetchResumoMensal,
  fetchDividas,
  fetchReservaConfig,
  shiftMes,
} from "@/lib/db";

export type CardKey =
  | "maior_gasto"
  | "top3"
  | "comparativo"
  | "divida_prio"
  | "reserva"
  | "estouros";

const ALL_CARDS: { key: CardKey; label: string; descricao: string }[] = [
  { key: "maior_gasto", label: "Maior gasto do mês", descricao: "Onde você mais gastou." },
  { key: "top3", label: "Top 3 categorias", descricao: "As três categorias com maior gasto real." },
  { key: "comparativo", label: "Comparativo com mês anterior", descricao: "Gasto total deste mês vs o anterior." },
  { key: "divida_prio", label: "Dívida para pagar primeiro", descricao: "A que mais cresce com juros." },
  { key: "reserva", label: "Progresso da reserva", descricao: "Quanto falta para sua meta de emergência." },
  { key: "estouros", label: "Onde passou do limite", descricao: "Gastos que ficaram acima do planejado." },
];

const STORAGE_KEY = "fna:painel:cards";
const DEFAULT_ON: CardKey[] = ["maior_gasto", "top3", "comparativo"];

function loadPrefs(): Record<CardKey, boolean> {
  const base = Object.fromEntries(ALL_CARDS.map((c) => [c.key, DEFAULT_ON.includes(c.key)])) as Record<CardKey, boolean>;
  if (typeof window === "undefined") return base;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return base;
    const parsed = JSON.parse(raw) as Partial<Record<CardKey, boolean>>;
    return { ...base, ...parsed };
  } catch {
    return base;
  }
}

export function PersonalizarPainelButton({
  prefs,
  setPrefs,
}: {
  prefs: Record<CardKey, boolean>;
  setPrefs: (p: Record<CardKey, boolean>) => void;
}) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-xs font-medium hover:bg-muted"
          aria-label="Personalizar painel"
        >
          <Settings2 className="h-4 w-4" /> Personalizar
        </button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Personalizar painel</SheetTitle>
          <SheetDescription>Escolha quais cards extras aparecem no seu painel.</SheetDescription>
        </SheetHeader>
        <div className="mt-4 space-y-3">
          {ALL_CARDS.map((c) => (
            <label
              key={c.key}
              className="flex items-start justify-between gap-3 rounded-xl border border-border bg-card p-3"
            >
              <div className="min-w-0">
                <div className="text-sm font-semibold">{c.label}</div>
                <div className="text-xs text-muted-foreground">{c.descricao}</div>
              </div>
              <Switch
                checked={!!prefs[c.key]}
                onCheckedChange={(v) => setPrefs({ ...prefs, [c.key]: v })}
              />
            </label>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}

export function usePainelPrefs() {
  const [prefs, setPrefs] = useState<Record<CardKey, boolean>>(() => loadPrefs());
  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    } catch {
      /* ignore */
    }
  }, [prefs]);
  return { prefs, setPrefs };
}

// ----------- Cards extras -----------

function CardShell({
  title,
  Icon,
  children,
  href,
}: {
  title: string;
  Icon: typeof Trophy;
  children: React.ReactNode;
  href?: string;
}) {
  const content = (
    <div className="flex h-full flex-col rounded-2xl border border-border bg-card p-4 shadow-soft transition-all duration-200 hover:border-primary/40">
      <div className="mb-2 flex items-center gap-2">
        <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary/10 text-primary">
          <Icon className="h-4 w-4" />
        </span>
        <h3 className="text-sm font-semibold">{title}</h3>
        {href ? <ArrowUpRight className="ml-auto h-4 w-4 text-muted-foreground" /> : null}
      </div>
      <div className="mt-1 flex-1 text-sm">{children}</div>
    </div>
  );
  if (href) {
    return (
      <Link to={href} className="block h-full">
        {content}
      </Link>
    );
  }
  return content;
}

function Empty({ texto = "Nada anotado neste mês ainda." }: { texto?: string }) {
  return <p className="text-xs text-muted-foreground">{texto}</p>;
}

export function PainelExtras({ mes, prefs }: { mes: string; prefs: Record<CardKey, boolean> }) {
  const ativos = ALL_CARDS.filter((c) => prefs[c.key]);

  const catsQ = useQuery({ queryKey: qk.categorias, queryFn: fetchCategorias });
  const subsQ = useQuery({ queryKey: qk.subitens, queryFn: fetchSubitens });
  const lancsQ = useQuery({ queryKey: qk.lancamentos(mes), queryFn: () => fetchLancamentos(mes) });
  const mesAnt = shiftMes(mes, -1);
  const resumoAtualQ = useQuery({ queryKey: qk.resumo(mes), queryFn: () => fetchResumoMensal(mes) });
  const resumoAntQ = useQuery({ queryKey: qk.resumo(mesAnt), queryFn: () => fetchResumoMensal(mesAnt) });
  const dividasQ = useQuery({ queryKey: qk.dividas, queryFn: fetchDividas });
  const reservaQ = useQuery({ queryKey: qk.reserva, queryFn: fetchReservaConfig });

  const carregando =
    catsQ.isLoading || subsQ.isLoading || lancsQ.isLoading || resumoAtualQ.isLoading || resumoAntQ.isLoading;

  // Aggregations
  const porCategoria = useMemo(() => {
    const catName = new Map<string, string>();
    (catsQ.data ?? []).forEach((c) => catName.set(c.id, c.nome));
    const subToCat = new Map<string, string>();
    (subsQ.data ?? []).forEach((s) => subToCat.set(s.id, s.categoria_id));
    const tot = new Map<string, number>();
    (lancsQ.data ?? []).forEach((l) => {
      const catId = subToCat.get(l.subitem_id);
      if (!catId) return;
      tot.set(catId, (tot.get(catId) ?? 0) + Number(l.custo_real));
    });
    return Array.from(tot.entries())
      .map(([id, v]) => ({ id, nome: catName.get(id) ?? "—", total: v }))
      .filter((x) => x.total > 0)
      .sort((a, b) => b.total - a.total);
  }, [catsQ.data, subsQ.data, lancsQ.data]);

  const estouros = useMemo(() => {
    const subName = new Map<string, string>();
    (subsQ.data ?? []).forEach((s) => subName.set(s.id, s.nome));
    return (lancsQ.data ?? [])
      .filter((l) => Number(l.custo_real) > Number(l.custo_previsto))
      .map((l) => ({
        nome: subName.get(l.subitem_id) ?? "—",
        diferenca: Number(l.diferenca), // negativa = estouro
      }))
      .sort((a, b) => a.diferenca - b.diferenca);
  }, [subsQ.data, lancsQ.data]);

  const dividaPrio = useMemo(() => {
    const ativas = (dividasQ.data ?? []).filter((d) => d.status === "Ativa");
    if (ativas.length === 0) return null;
    return ativas.reduce((a, b) =>
      Number(a.taxa_juros_mensal) >= Number(b.taxa_juros_mensal) ? a : b,
    );
  }, [dividasQ.data]);

  const realAtual = Number(resumoAtualQ.data?.total_real ?? 0);
  const realAnt = Number(resumoAntQ.data?.total_real ?? 0);
  const deltaAbs = realAtual - realAnt;
  const deltaPct = realAnt > 0 ? (deltaAbs / realAnt) * 100 : 0;

  // Todos os hooks já foram chamados acima — seguro retornar cedo aqui.
  if (ativos.length === 0) return null;

  return (
    <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {ativos.map((c) => {
        if (c.key === "maior_gasto") {
          const top = porCategoria[0];
          return (
            <CardShell key={c.key} title="Maior gasto do mês" Icon={Trophy}>
              {carregando ? (
                <Skeleton className="h-12 w-full" />
              ) : !top ? (
                <Empty />
              ) : (
                <>
                  <div className="truncate text-base font-semibold">{top.nome}</div>
                  <div className="tabular mt-1 text-lg font-bold text-primary">{formatBRL(top.total)}</div>
                </>
              )}
            </CardShell>
          );
        }
        if (c.key === "top3") {
          const top3 = porCategoria.slice(0, 3);
          return (
            <CardShell key={c.key} title="Top 3 categorias" Icon={ListOrdered}>
              {carregando ? (
                <Skeleton className="h-20 w-full" />
              ) : top3.length === 0 ? (
                <Empty />
              ) : (
                <ol className="space-y-1.5">
                  {top3.map((t, i) => (
                    <li key={t.id} className="flex items-center justify-between gap-2 text-sm">
                      <span className="flex min-w-0 items-center gap-2">
                        <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-primary/10 text-[11px] font-bold text-primary">
                          {i + 1}
                        </span>
                        <span className="truncate">{t.nome}</span>
                      </span>
                      <span className="tabular shrink-0 font-semibold">{formatBRL(t.total)}</span>
                    </li>
                  ))}
                </ol>
              )}
            </CardShell>
          );
        }
        if (c.key === "comparativo") {
          const subiu = deltaAbs > 0;
          const Icon = subiu ? TrendingUp : TrendingDown;
          const cor = subiu ? "text-danger" : "text-success";
          return (
            <CardShell key={c.key} title="Comparativo mensal" Icon={ArrowLeftRight}>
              {carregando ? (
                <Skeleton className="h-16 w-full" />
              ) : realAnt === 0 && realAtual === 0 ? (
                <Empty />
              ) : (
                <>
                  <div className="tabular text-lg font-bold">{formatBRL(realAtual)}</div>
                  <div className={`mt-1 flex items-center gap-1 text-xs font-semibold ${cor}`}>
                    <Icon className="h-3.5 w-3.5" />
                    <span className="tabular">
                      {subiu ? "+" : "−"}
                      {formatBRL(Math.abs(deltaAbs))} ({formatPct(Math.abs(deltaPct))})
                    </span>
                  </div>
                  <div className="tabular mt-0.5 text-[11px] text-muted-foreground">
                    Mês anterior: {formatBRL(realAnt)}
                  </div>
                </>
              )}
            </CardShell>
          );
        }
        if (c.key === "divida_prio") {
          return (
            <CardShell key={c.key} title="Dívida para pagar primeiro" Icon={Flame} href="/dividas">
              {dividasQ.isLoading ? (
                <Skeleton className="h-12 w-full" />
              ) : !dividaPrio ? (
                <Empty texto="Sem dívidas ativas. 🎉" />
              ) : (
                <>
                  <div className="truncate text-base font-semibold">{dividaPrio.nome}</div>
                  <div className="tabular mt-1 text-sm text-danger font-semibold">
                    {formatPct(Number(dividaPrio.taxa_juros_mensal) * 100)} a.m.
                  </div>
                  <div className="tabular mt-0.5 text-[11px] text-muted-foreground">
                    Total {formatBRL(Number(dividaPrio.valor_total))}
                  </div>
                </>
              )}
            </CardShell>
          );
        }
        if (c.key === "reserva") {
          const r = reservaQ.data;
          const prog = Number(r?.progresso ?? 0) * 100;
          return (
            <CardShell key={c.key} title="Progresso da reserva" Icon={PiggyBank} href="/reserva">
              {reservaQ.isLoading ? (
                <Skeleton className="h-12 w-full" />
              ) : !r ? (
                <Empty />
              ) : (
                <>
                  <div className="tabular text-lg font-bold text-primary">{formatPct(prog)}</div>
                  <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary transition-[width] duration-300"
                      style={{ width: `${Math.min(100, prog)}%` }}
                    />
                  </div>
                  <div className="tabular mt-1 text-[11px] text-muted-foreground">
                    {formatBRL(Number(r.valor_guardado))} de {formatBRL(Number(r.meta_reserva))}
                  </div>
                </>
              )}
            </CardShell>
          );
        }
        if (c.key === "estouros") {
          const total503020Ok = false; // placeholder for selo
          return (
            <CardShell key={c.key} title="Onde passou do limite" Icon={AlertTriangle}>
              {carregando ? (
                <Skeleton className="h-20 w-full" />
              ) : estouros.length === 0 ? (
                <div className="flex items-center gap-2 text-success">
                  <CheckCircle2 className="h-4 w-4" />
                  <span className="text-xs font-medium">Nada passou do limite 🎯</span>
                </div>
              ) : (
                <>
                  <div className="tabular text-lg font-bold text-danger">{estouros.length}</div>
                  <ul className="mt-1 space-y-0.5">
                    {estouros.slice(0, 3).map((e) => (
                      <li
                        key={e.nome}
                        className="flex items-center justify-between gap-2 text-xs"
                      >
                        <span className="truncate">{e.nome}</span>
                        <span className="tabular shrink-0 font-semibold text-danger">
                          −{formatBRL(Math.abs(e.diferenca))}
                        </span>
                      </li>
                    ))}
                  </ul>
                  {total503020Ok && null}
                </>
              )}
            </CardShell>
          );
        }
        return null;
      })}
    </section>
  );
}
