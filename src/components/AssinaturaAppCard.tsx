import { useState } from "react";
import { Sparkles, Gift, Copy, Share2, ArrowUpRight, Check } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  assinaturaAppMock,
  indicacaoMock,
  linkIndicacao,
  diasRestantes,
  progressoAno,
  statusAssinatura,
  formatDataBR,
  type StatusAssinaturaApp,
} from "@/lib/mockAssinaturaApp";

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

export function AssinaturaAppCard() {
  const assinatura = assinaturaAppMock;
  const dias = diasRestantes(assinatura.dataVencimento);
  const progresso = Math.round(progressoAno(assinatura.dataCompra, assinatura.dataVencimento) * 100);
  const status = statusAssinatura(assinatura.dataVencimento);
  const st = STATUS_STYLES[status];

  const link = linkIndicacao();
  const mensagem = `Estou usando o Família no Azul para organizar as finanças da minha casa. Use meu link e ganhe ${indicacaoMock.desconto}: ${link}`;

  const [copiado, setCopiado] = useState(false);

  async function copiar() {
    try {
      await navigator.clipboard.writeText(link);
      setCopiado(true);
      toast.success("Link copiado! Compartilhe com quem você quiser ajudar.");
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      toast.error("Não foi possível copiar. Selecione o link manualmente.");
    }
  }

  async function compartilhar() {
    if (typeof navigator !== "undefined" && "share" in navigator) {
      try {
        await navigator.share({
          title: "Família no Azul",
          text: mensagem,
          url: link,
        });
        return;
      } catch {
        // usuário cancelou ou não suportado — cai no fallback
      }
    }
    copiar();
  }

  return (
    <section className="grid gap-4 md:grid-cols-2">
      {/* Bloco A — Sua assinatura */}
      <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className={`grid h-9 w-9 place-items-center rounded-xl ${st.iconBg}`}>
              <Sparkles className={`h-5 w-5 ${st.icon}`} />
            </span>
            <div>
              <h2 className="text-sm font-semibold leading-tight">Sua assinatura</h2>
              <p className="text-xs text-muted-foreground">Família no Azul</p>
            </div>
          </div>
          <span
            className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${st.badge}`}
          >
            {st.label}
          </span>
        </div>

        <div className="mt-4">
          <div className="tabular text-3xl font-bold leading-none sm:text-4xl">
            {dias}
            <span className="ml-2 text-sm font-medium text-muted-foreground">
              {dias === 1 ? "dia restante" : "dias restantes"}
            </span>
          </div>
          <p className="tabular mt-1.5 text-xs text-muted-foreground">
            Plano {assinatura.plano} · Vence em {formatDataBR(assinatura.dataVencimento)}
          </p>
        </div>

        <div
          className="mt-4 h-2 overflow-hidden rounded-full bg-muted"
          role="progressbar"
          aria-valuenow={progresso}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Progresso do ano de assinatura"
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

        <Button
          asChild
          variant="outline"
          size="sm"
          className="mt-4 w-full sm:w-auto"
        >
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
      </div>

      {/* Bloco B — Indique e ganhe */}
      <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 to-transparent p-5 shadow-soft">
        <div className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary/10 text-primary">
            <Gift className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-sm font-semibold leading-tight">Indique e ganhe</h2>
            <p className="text-xs text-muted-foreground">
              Seus amigos ganham {indicacaoMock.desconto}
            </p>
          </div>
        </div>

        <p className="mt-3 text-xs text-muted-foreground">
          Compartilhe seu link e ajude mais famílias a saírem do vermelho. Quanto mais gente
          organizada, melhor pra todo mundo.
        </p>

        <div className="mt-3">
          <label htmlFor="link-indicacao" className="sr-only">
            Seu link de indicação
          </label>
          <Input
            id="link-indicacao"
            value={link}
            readOnly
            onFocus={(e) => e.currentTarget.select()}
            className="tabular text-xs"
          />
        </div>

        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <Button
            type="button"
            variant="default"
            size="sm"
            onClick={copiar}
            className="flex-1 gap-1.5"
          >
            {copiado ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copiado ? "Copiado" : "Copiar link"}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={compartilhar}
            className="flex-1 gap-1.5"
          >
            <Share2 className="h-4 w-4" />
            Compartilhar
          </Button>
        </div>
      </div>
    </section>
  );
}
