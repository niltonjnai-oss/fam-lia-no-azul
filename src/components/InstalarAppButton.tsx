// Botão fixo "Instalar App" (sidebar). Um clique dispara o prompt nativo
// quando o navegador oferece (Chrome/Edge/Android); caso contrário abre um
// mini-guia com o passo a passo por plataforma. Some quando o app já está
// rodando instalado (standalone).

import { useEffect, useState } from "react";
import { MonitorSmartphone, Share, MoreVertical, Monitor } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  getInstallPrompt,
  promptInstall,
  onInstallPromptChange,
  isStandalone,
} from "@/lib/pwa-install";

export function InstalarAppButton() {
  const [visivel, setVisivel] = useState(false);
  const [temPrompt, setTemPrompt] = useState(false);
  const [guiaAberto, setGuiaAberto] = useState(false);

  useEffect(() => {
    setVisivel(!isStandalone());
    setTemPrompt(getInstallPrompt() != null);
    return onInstallPromptChange(() => {
      setTemPrompt(getInstallPrompt() != null);
      setVisivel(!isStandalone());
    });
  }, []);

  if (!visivel) return null;

  async function handleClick() {
    if (temPrompt) {
      const aceitou = await promptInstall();
      if (aceitou) setVisivel(false);
      return;
    }
    setGuiaAberto(true);
  }

  return (
    <>
      <div className="rounded-xl border border-primary/30 bg-primary/5 p-3 text-center">
        <Button onClick={handleClick} className="w-full gap-2 bg-white text-primary hover:bg-white/90">
          <MonitorSmartphone className="h-4 w-4" />
          Instalar App
        </Button>
        <p className="mt-1.5 text-[11px] text-white">Android · iOS · Desktop</p>
      </div>

      <GuiaInstalacaoDialog open={guiaAberto} onOpenChange={setGuiaAberto} />
    </>
  );
}

export function GuiaInstalacaoDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Instalar o Família no Azul</DialogTitle>
            <DialogDescription>
              Direto do navegador, sem loja de aplicativos — com ícone na tela e acesso em 1 toque.
            </DialogDescription>
          </DialogHeader>
          <ul className="space-y-4 text-sm">
            <li className="flex gap-3">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                <MoreVertical className="h-4 w-4" />
              </span>
              <div>
                <div className="font-semibold">Android (Chrome)</div>
                <p className="text-xs text-muted-foreground">
                  Menu <strong>⋮</strong> (canto superior direito) → <strong>&ldquo;Instalar aplicativo&rdquo;</strong> ou
                  &ldquo;Adicionar à tela inicial&rdquo;.
                </p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                <Share className="h-4 w-4" />
              </span>
              <div>
                <div className="font-semibold">iPhone e iPad (Safari)</div>
                <p className="text-xs text-muted-foreground">
                  Botão <strong>Compartilhar</strong> (quadrado com seta) →{" "}
                  <strong>&ldquo;Adicionar à Tela de Início&rdquo;</strong>.
                </p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                <Monitor className="h-4 w-4" />
              </span>
              <div>
                <div className="font-semibold">Computador (Chrome/Edge)</div>
                <p className="text-xs text-muted-foreground">
                  Clique no <strong>ícone de instalação</strong> na barra de endereço (monitor com
                  seta, à direita) → <strong>Instalar</strong>.
                </p>
              </div>
            </li>
          </ul>
        </DialogContent>
      </Dialog>
  );
}
