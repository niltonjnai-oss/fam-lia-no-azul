// Card do Painel convidando a instalar o app (PWA).
// - Chrome/Android/desktop: usa o evento beforeinstallprompt para instalar com 1 clique.
// - iPhone/iPad (Safari): mostra o passo a passo (a Apple não expõe prompt).
// - Some quando o app já está instalado (display-mode standalone) ou se o
//   usuário dispensar (persistido em localStorage).

import { useEffect, useState } from "react";
import { MonitorSmartphone, Share, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const DISMISS_KEY = "fna_instalar_app_dispensado";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

function isStandalone(): boolean {
  if (typeof window === "undefined") return true;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    // Safari iOS
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

function isIOS(): boolean {
  if (typeof navigator === "undefined") return false;
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

export function InstalarAppCard() {
  const [dispensado, setDispensado] = useState(true); // evita flash no SSR
  const [promptEvent, setPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [instalado, setInstalado] = useState(false);

  useEffect(() => {
    setDispensado(
      isStandalone() || window.localStorage.getItem(DISMISS_KEY) === "1",
    );
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setPromptEvent(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => setInstalado(true);
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (dispensado || instalado) return null;

  const ios = isIOS();
  // Sem prompt disponível e não é iOS (ex.: Firefox): não mostra nada.
  if (!promptEvent && !ios) return null;

  function dispensar() {
    window.localStorage.setItem(DISMISS_KEY, "1");
    setDispensado(true);
  }

  async function instalar() {
    if (!promptEvent) return;
    await promptEvent.prompt();
    const escolha = await promptEvent.userChoice;
    if (escolha.outcome === "accepted") setInstalado(true);
    setPromptEvent(null);
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
        {ios ? (
          <div className="text-xs text-muted-foreground">
            No Safari: toque em <Share className="inline h-3.5 w-3.5" aria-label="Compartilhar" />{" "}
            <strong>Compartilhar</strong> e depois em <strong>&ldquo;Adicionar à Tela de Início&rdquo;</strong>.
            Sem loja de aplicativos, sempre atualizado.
          </div>
        ) : (
          <div className="text-xs text-muted-foreground">
            Direto do navegador, sem loja de aplicativos. Acesso em 1 toque, como app nativo.
          </div>
        )}
      </div>
      {!ios && promptEvent && (
        <Button size="sm" onClick={instalar}>
          Instalar app
        </Button>
      )}
    </section>
  );
}
