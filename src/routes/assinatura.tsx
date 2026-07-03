import { createFileRoute } from "@tanstack/react-router";
import { Sparkles, ArrowUpRight, CalendarClock, ShieldCheck, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PageTitle } from "@/components/PageTitle";
import {
  assinaturaAppMock,
  diasRestantes,
  progressoAno,
  statusAssinatura,
  formatDataBR,
  type StatusAssinaturaApp,
} from "@/lib/mockAssinaturaApp";

export const Route = createFileRoute("/assinatura")({
  head: () => ({
    meta: [
      { title: "Sua assinatura — Família no Azul" },
      {
        name: "description",
        content:
          "Acompanhe quanto tempo falta para vencer sua assinatura anual do Família no Azul.",
      },
    ],
  }),
  component: AssinaturaPage,
});

const STATUS_STYLES: Record<
  StatusAssinaturaApp,
  { label: string; badge: string; bar: string; icon: string; iconBg: string }
> = {
  ativa: {
    label: "Ativa",
    badge: "bg-success/15 text-success",
    bar: "bg-success",
    icon: "text-success",
    iconBg: "bg-success/10",
  },
  expirando: {
    label: "Expira em breve",
    badge: "bg-warning/20 text-warning-foreground",
    bar: "bg-warning",
    icon: "text-warning-foreground",
    iconBg: "bg-warning/15",
  },
  expirada: {
    label: "Expirada",
    badge: "bg-danger/15 text-danger",
    bar: "bg-danger",
    icon: "text-danger",
    iconBg: "bg-danger/10",
  },
};

function AssinaturaPage() {
  const assinatura = assinaturaAppMock;
  const dias = diasRestantes(assinatura.dataVencimento);
  const progresso = Math.round(
    progressoAno(assinatura.dataCompra, assinatura.dataVencimento) * 100,
  );
  const status = statusAssinatura(assinatura.dataVencimento);
  const st = STATUS_STYLES[status];

  return (
    <div className="space-y-6">
      <PageTitle
        title="Sua assinatura"
        subtitle="Acompanhe a validade do seu acesso ao Família no Azul."
      />

      <section className="rounded-2xl border border-border bg-card p-5 shadow-soft sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className={`grid h-10 w-10 place-items-center rounded-xl ${st.iconBg}`}>
              <Sparkles className={`h-5 w-5 ${st.icon}`} />
            </span>
            <div>
              <h2 className="text-sm font-semibold leading-tight">Plano {assinatura.plano}</h2>
              <p className="text-xs text-muted-foreground">Família no Azul</p>
            </div>
          </div>
          <span
            className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${st.badge}`}
          >
            {st.label}
          </span>
        </div>

        <div className="mt-5">
          <div className="tabular text-4xl font-bold leading-none sm:text-5xl">
            {dias}
            <span className="ml-2 text-sm font-medium text-muted-foreground">
              {dias === 1 ? "dia restante" : "dias restantes"}
            </span>
          </div>
          <p className="tabular mt-2 text-xs text-muted-foreground">
            Vence em {formatDataBR(assinatura.dataVencimento)}
          </p>
        </div>

        <div
          className="mt-5 h-2 overflow-hidden rounded-full bg-muted"
          role="progressbar"
          aria-valuenow={progresso}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className={`h-full rounded-full ${st.bar} transition-[width] duration-300`}
            style={{ width: `${progresso}%` }}
          />
        </div>
        <div className="tabular mt-1 flex justify-between text-[11px] text-muted-foreground">
          <span>Compra em {formatDataBR(assinatura.dataCompra)}</span>
          <span>{progresso}% do ano</span>
        </div>

        <Button asChild variant="outline" size="sm" className="mt-5 w-full sm:w-auto">
          <a
            href="https://familianoazul.com.br/renovar"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5"
          >
            Renovar assinatura
            <ArrowUpRight className="h-4 w-4" />
          </a>
        </Button>
      </section>

      <section className="rounded-2xl border border-border bg-card p-5 shadow-soft sm:p-6">
        <h2 className="text-sm font-semibold">Como funciona</h2>
        <ul className="mt-4 space-y-4 text-sm text-muted-foreground">
          <li className="flex gap-3">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
              <ShieldCheck className="h-4 w-4" />
            </span>
            <div>
              <p className="font-medium text-foreground">Acesso completo por 12 meses</p>
              <p className="mt-0.5 text-xs">
                Sua compra libera todos os módulos do app — Painel, Orçamento, 50-30-20, Dívidas
                e Reserva — por um ano a partir da data de aquisição.
              </p>
            </div>
          </li>
          <li className="flex gap-3">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
              <CalendarClock className="h-4 w-4" />
            </span>
            <div>
              <p className="font-medium text-foreground">Contagem regressiva</p>
              <p className="mt-0.5 text-xs">
                Mostramos quantos dias faltam para vencer. A partir de 30 dias antes, a etiqueta
                muda para <span className="font-semibold">Expira em breve</span> para você não ser
                pego de surpresa.
              </p>
            </div>
          </li>
          <li className="flex gap-3">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
              <RefreshCw className="h-4 w-4" />
            </span>
            <div>
              <p className="font-medium text-foreground">Renovação simples</p>
              <p className="mt-0.5 text-xs">
                Perto do vencimento, o botão <span className="font-semibold">Renovar
                assinatura</span> leva você direto à página segura de pagamento para manter tudo
                ativo sem perder seus dados.
              </p>
            </div>
          </li>
        </ul>
      </section>
    </div>
  );
}
