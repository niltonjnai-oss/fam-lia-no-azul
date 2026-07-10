// Card do Painel convidando a instalar o app (PWA). Complementa o botão fixo
// da sidebar (InstalarAppButton) — no mobile a sidebar não existe, então o
// card é o convite principal. Dispensável (localStorage); some quando o app
// já está instalado.

import { useEffect, useState } from "react";
import { MonitorSmartphone, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  getInstallPrompt,
  promptInstall,
  onInstallPromptChange,
  isStandalone,
  isIOS,
} from "@/lib/pwa-install";
import { GuiaInstalacaoDialog } from "@/components/InstalarAppButton";

const DISMISS_KEY = "fna_instalar_app_dispensado";

export function InstalarAppCard() {
  const [dispensado, setDispensado] = useState(true); // evita flash no SSR
  const [temPrompt, setTemPrompt] = useState(false);
  const [guiaAberto, setGuiaAberto] = useState(false);

  useEffect(() => {
    setDispensado(isStandalone() || window.localStorage.getItem(DISMISS_KEY) === "1");
    setTemPrompt(getInstallPrompt() != null);
    return onInstallPromptChange(() => {
      setTemPrompt(getInstallPrompt() != null);
      if (isStandalone()) setDispensado(true);
    });
  }, []);

  if (dispensado) return null;

  function dispensar() {
    window.localStorage.setItem(DISMISS_KEY, "1");
    setDispensado(true);
  }

  async function instalar() {
    if (temPrompt) {
      const aceitou = await promptInstall();
      if (aceitou) setDispensado(true);
      return;
    }
    setGuiaAberto(true);
  }

  return (
    <section className="relative flex flex-wrap items-center gap-3 rounded-2xl border border-primary/30 bg-primary/5 p-4 shadow-soft">
      <button
        type="button"
        onClick={dispensar}
        aria-label="Dispensar"
        className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground"
      >
        <X className="h-4 w-4" />
      </button>
      <div className="grid h-11 w-11 place-items-center rounded-xl bg-primary text-primary-foreground">
        <MonitorSmartphone className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1 pr-6">
        <div className="text-sm font-semibold">Instale o app no seu aparelho</div>
        <div className="text-xs text-muted-foreground">
          {isIOS()
            ? "Ícone na tela de início, acesso em 1 toque — sem loja de aplicativos."
            : "Direto do navegador, sem loja de aplicativos. Acesso em 1 toque, como app nativo."}
        </div>
        <p className="mt-0.5 text-[11px] text-muted-foreground">Android · iOS · Desktop</p>
      </div>
      <Button size="sm" onClick={instalar}>
        Instalar App
      </Button>
      <GuiaInstalacaoDialog open={guiaAberto} onOpenChange={setGuiaAberto} />
    </section>
  );
}
