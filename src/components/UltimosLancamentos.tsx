// Feed "Últimos lançamentos" do painel: os gastos mais recentes da família,
// com ícone da categoria em chip colorido suave — feedback imediato de que o
// registro entrou (e, no Modo Casal, do que o outro membro lançou).

import { useMemo, type ComponentType } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import {
  Home,
  Car,
  ShoppingCart,
  GraduationCap,
  HeartPulse,
  Popcorn,
  Shirt,
  PawPrint,
  CreditCard,
  PiggyBank,
  Tv,
  Wallet,
  ArrowUpRight,
} from "lucide-react";

import {
  qk,
  fetchCategorias,
  fetchSubitens,
  fetchTransacoesRecentes,
} from "@/lib/db";
import { formatBRL } from "@/lib/format";
import { Skeleton } from "@/components/ui/skeleton";

type IconType = ComponentType<{ className?: string }>;

/** Ícone por palavra-chave do nome da categoria (categorias são editáveis pelo
 *  usuário, então casamos por conteúdo, com fallback genérico). */
const ICONES_CATEGORIA: [RegExp, IconType][] = [
  [/moradia|casa|aluguel/i, Home],
  [/transporte|carro|ve[íi]culo/i, Car],
  [/alimenta|mercado|comida|feira/i, ShoppingCart],
  [/educa|escola|faculdade/i, GraduationCap],
  [/sa[úu]de|seguro|farm[áa]cia/i, HeartPulse],
  [/lazer|divers|passeio/i, Popcorn],
  [/vestu[áa]rio|roupa/i, Shirt],
  [/pet/i, PawPrint],
  [/d[íi]vida|cart[ãa]o|empr[ée]stimo/i, CreditCard],
  [/reserva|poupan|invest/i, PiggyBank],
  [/assinatura|streaming|tv/i, Tv],
];

function iconeDaCategoria(nome: string | undefined): IconType {
  if (!nome) return Wallet;
  for (const [re, Icon] of ICONES_CATEGORIA) if (re.test(nome)) return Icon;
  return Wallet;
}

/** Tints suaves cicladas por categoria — ritmo visual das listas fintech. */
const CHIP_TINTS = [
  "bg-primary/10 text-primary",
  "bg-success/10 text-success",
  "bg-warning/15 text-warning-foreground",
  "bg-cta/10 text-cta",
] as const;

function tintDaCategoria(nome: string | undefined): string {
  if (!nome) return CHIP_TINTS[0];
  let h = 0;
  for (let i = 0; i < nome.length; i++) h = (h * 31 + nome.charCodeAt(i)) | 0;
  return CHIP_TINTS[Math.abs(h) % CHIP_TINTS.length];
}

function formatDataCurta(iso: string): string {
  const hoje = new Date();
  const hojeISO = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, "0")}-${String(hoje.getDate()).padStart(2, "0")}`;
  if (iso === hojeISO) return "Hoje";
  const ontem = new Date(hoje.getTime() - 86_400_000);
  const ontemISO = `${ontem.getFullYear()}-${String(ontem.getMonth() + 1).padStart(2, "0")}-${String(ontem.getDate()).padStart(2, "0")}`;
  if (iso === ontemISO) return "Ontem";
  const [, m, d] = iso.split("-");
  return `${d}/${m}`;
}

export function UltimosLancamentos() {
  const transacoesQ = useQuery({
    queryKey: qk.transacoesRecentes,
    queryFn: () => fetchTransacoesRecentes(5),
  });
  const categoriasQ = useQuery({ queryKey: qk.categorias, queryFn: fetchCategorias });
  const subitensQ = useQuery({ queryKey: qk.subitens, queryFn: fetchSubitens });

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

  const carregando = transacoesQ.isLoading || categoriasQ.isLoading || subitensQ.isLoading;
  const transacoes = transacoesQ.data ?? [];

  return (
    <section className="rounded-2xl border border-border bg-card p-4 shadow-soft">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">Últimos lançamentos</h2>
        <Link
          to="/orcamento"
          className="flex items-center gap-0.5 text-xs font-medium text-primary hover:underline"
        >
          Ver tudo <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {carregando ? (
        <div className="mt-3 space-y-2">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      ) : transacoes.length === 0 ? (
        <p className="mt-3 rounded-xl bg-muted/40 px-3 py-3 text-xs text-muted-foreground">
          Seus gastos anotados vão aparecer aqui. Comece pelo botão laranja. 💙
        </p>
      ) : (
        <ul className="mt-3 divide-y divide-border/60">
          {transacoes.map((t) => {
            const sub = subitensById.get(t.subitem_id);
            const catNome = sub ? categoriasById.get(sub.categoria_id) : undefined;
            const titulo = t.descricao?.trim() || sub?.nome || "Gasto";
            const Icon = iconeDaCategoria(catNome);
            return (
              <li key={t.id} className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0">
                <span
                  className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${tintDaCategoria(catNome)}`}
                  aria-hidden="true"
                >
                  <Icon className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">{titulo}</div>
                  <div className="truncate text-[11px] text-muted-foreground">
                    {formatDataCurta(t.data)}
                    {catNome ? ` · ${catNome}` : ""}
                  </div>
                </div>
                <span className="tabular shrink-0 text-sm font-semibold">
                  − {formatBRL(Number(t.valor))}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
