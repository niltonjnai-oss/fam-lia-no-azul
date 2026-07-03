import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Gift, Copy, Share2, Check, Users, Heart, Tag } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageTitle } from "@/components/PageTitle";
import { indicacaoMock, linkIndicacao } from "@/lib/mockAssinaturaApp";

export const Route = createFileRoute("/indicacao")({
  head: () => ({
    meta: [
      { title: "Indique e ganhe — Família no Azul" },
      {
        name: "description",
        content:
          "Compartilhe o Família no Azul com quem você quer ajudar e garanta desconto para seus amigos.",
      },
    ],
  }),
  component: IndicacaoPage,
});

function IndicacaoPage() {
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
        // fallback
      }
    }
    copiar();
  }

  return (
    <div className="space-y-6">
      <div>
        <PageTitle>Indique e ganhe</PageTitle>
        <p className="mt-1 text-sm text-muted-foreground">
          Compartilhe o Família no Azul e ajude mais famílias a saírem do vermelho.
        </p>
      </div>

      <section className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 to-transparent p-5 shadow-soft sm:p-6">
        <div className="flex items-center gap-2">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
            <Gift className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-sm font-semibold leading-tight">Seu link de indicação</h2>
            <p className="text-xs text-muted-foreground">
              Seus amigos ganham {indicacaoMock.desconto} na assinatura anual
            </p>
          </div>
        </div>

        <div className="mt-4">
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
          <Button type="button" onClick={copiar} className="flex-1 gap-1.5">
            {copiado ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copiado ? "Copiado" : "Copiar link"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={compartilhar}
            className="flex-1 gap-1.5"
          >
            <Share2 className="h-4 w-4" />
            Compartilhar
          </Button>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card p-5 shadow-soft sm:p-6">
        <h2 className="text-sm font-semibold">Como funciona</h2>
        <ol className="mt-4 space-y-4 text-sm text-muted-foreground">
          <li className="flex gap-3">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
              <Copy className="h-4 w-4" />
            </span>
            <div>
              <p className="font-medium text-foreground">1. Copie ou compartilhe seu link</p>
              <p className="mt-0.5 text-xs">
                Use os botões acima para copiar o link ou abrir o compartilhamento nativo do seu
                celular (WhatsApp, e-mail, redes sociais).
              </p>
            </div>
          </li>
          <li className="flex gap-3">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
              <Tag className="h-4 w-4" />
            </span>
            <div>
              <p className="font-medium text-foreground">
                2. Seu amigo ganha {indicacaoMock.desconto}
              </p>
              <p className="mt-0.5 text-xs">
                Ao entrar pelo seu link, o desconto é aplicado automaticamente no checkout da
                assinatura anual. Sem cupom para digitar.
              </p>
            </div>
          </li>
          <li className="flex gap-3">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
              <Users className="h-4 w-4" />
            </span>
            <div>
              <p className="font-medium text-foreground">3. Mais famílias organizadas</p>
              <p className="mt-0.5 text-xs">
                Cada indicação ajuda outra família a sair do vermelho — e fortalece a comunidade
                Família no Azul.
              </p>
            </div>
          </li>
          <li className="flex gap-3">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
              <Heart className="h-4 w-4" />
            </span>
            <div>
              <p className="font-medium text-foreground">Sem limite de indicações</p>
              <p className="mt-0.5 text-xs">
                Compartilhe com quantas pessoas quiser. O mesmo link funciona para todos.
              </p>
            </div>
          </li>
        </ol>
      </section>
    </div>
  );
}
