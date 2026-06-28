import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Mic,
  Home,
  Car,
  UtensilsCrossed,
  GraduationCap,
  Sparkles,
  Tv,
  ShoppingBag,
  PiggyBank,
  CreditCard,
} from "lucide-react";
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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { categorias } from "@/lib/mockData";
import { formatBRL } from "@/lib/format";

export const Route = createFileRoute("/orcamento")({
  head: () => ({
    meta: [
      { title: "Orçamento do mês — Família no Azul" },
      {
        name: "description",
        content: "Veja categorias, valores previstos e gastos reais do mês com a família.",
      },
    ],
  }),
  component: OrcamentoPage,
});

const iconMap: Record<string, typeof Home> = {
  moradia: Home,
  transporte: Car,
  alimentacao: UtensilsCrossed,
  educacao: GraduationCap,
  lazer: Sparkles,
  assinaturas: Tv,
  compras: ShoppingBag,
  reserva: PiggyBank,
  dividas: CreditCard,
};

const meses = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

function OrcamentoPage() {
  const [mesIdx, setMesIdx] = useState(5);
  const ano = 2026;

  return (
    <div className="space-y-5">
      <header className="space-y-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Orçamento</h1>
          <p className="text-sm text-muted-foreground">
            Compare o previsto e o real de cada categoria.
          </p>
        </div>
        <div className="flex items-center justify-between rounded-2xl border border-border bg-card p-2 shadow-soft">
          <button
            onClick={() => setMesIdx((i) => (i - 1 + 12) % 12)}
            className="grid h-10 w-10 place-items-center rounded-xl hover:bg-muted"
            aria-label="Mês anterior"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="tabular text-sm font-semibold sm:text-base">
            {meses[mesIdx]} <span className="text-muted-foreground">de {ano}</span>
          </div>
          <button
            onClick={() => setMesIdx((i) => (i + 1) % 12)}
            className="grid h-10 w-10 place-items-center rounded-xl hover:bg-muted"
            aria-label="Próximo mês"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </header>

      {categorias.length === 0 ? (
        <EmptyState />
      ) : (
        <Accordion type="multiple" className="space-y-2">
          {categorias.map((cat) => {
            const Icon = iconMap[cat.id] ?? Home;
            const diff = cat.previsto - cat.real;
            const estourou = diff < 0;
            return (
              <AccordionItem
                key={cat.id}
                value={cat.id}
                className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft"
              >
                <AccordionTrigger className="px-4 py-3 hover:no-underline">
                  <div className="flex w-full items-center gap-3">
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1 text-left">
                      <div className="truncate text-sm font-semibold">{cat.nome}</div>
                      <div className="tabular text-xs text-muted-foreground">
                        Previsto {formatBRL(cat.previsto)} · Real {formatBRL(cat.real)}
                      </div>
                    </div>
                    <div
                      className={[
                        "tabular shrink-0 rounded-lg px-2 py-1 text-xs font-semibold",
                        estourou
                          ? "bg-danger/10 text-danger"
                          : "bg-success/10 text-success",
                      ].join(" ")}
                    >
                      {estourou ? "−" : "+"}
                      {formatBRL(Math.abs(diff))}
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                  <ul className="space-y-1.5 border-t border-border pt-3">
                    {cat.itens.map((item, i) => (
                      <li
                        key={i}
                        className="flex items-center justify-between text-sm"
                      >
                        <span className="text-muted-foreground">
                          <span className="tabular mr-2 text-xs">{item.data}</span>
                          {item.descricao}
                        </span>
                        <span className="tabular font-medium">
                          {formatBRL(item.valor)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      )}

      {/* FAB */}
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
              Digite ou fale seu gasto. (Visualização — sem processar dados ainda.)
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
          <p className="text-xs text-muted-foreground">
            A lógica de categorização será conectada ao Supabase em seguida.
          </p>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center">
      <p className="text-sm font-semibold">Nenhum dado ainda</p>
      <p className="mt-1 text-xs text-muted-foreground">
        Adicione seu primeiro gasto pelo botão "+" para começar.
      </p>
    </div>
  );
}
