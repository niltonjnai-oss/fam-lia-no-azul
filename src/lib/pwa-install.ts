// Captura global do evento de instalação do PWA (beforeinstallprompt).
// O Chrome só dispara esse evento UMA vez por page-load, então capturamos em
// módulo (na primeira importação) e compartilhamos entre os componentes
// (card do Painel + botão da sidebar).

export type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

type WindowComPrompt = Window & { __pwaInstallPrompt?: BeforeInstallPromptEvent | null };

let deferredPrompt: BeforeInstallPromptEvent | null = null;
const listeners = new Set<() => void>();

/** Lê o evento capturado pelo script inline do <head> (que roda antes deste
 *  módulo). É a fonte da verdade — cobre o caso do evento ter disparado antes
 *  de qualquer bundle carregar. */
function promptDoGlobal(): BeforeInstallPromptEvent | null {
  if (typeof window === "undefined") return null;
  return (window as WindowComPrompt).__pwaInstallPrompt ?? null;
}

if (typeof window !== "undefined") {
  // Adota o que o script do <head> já capturou.
  deferredPrompt = promptDoGlobal();

  // O script do <head> avisa quando captura/limpa o prompt.
  window.addEventListener("pwa-install-available", () => {
    deferredPrompt = promptDoGlobal();
    listeners.forEach((fn) => fn());
  });
  // Backup: se por algum motivo este módulo carregar antes do evento disparar.
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPrompt = e as BeforeInstallPromptEvent;
    (window as WindowComPrompt).__pwaInstallPrompt = deferredPrompt;
    listeners.forEach((fn) => fn());
  });
  window.addEventListener("appinstalled", () => {
    deferredPrompt = null;
    (window as WindowComPrompt).__pwaInstallPrompt = null;
    listeners.forEach((fn) => fn());
  });
}

export function getInstallPrompt(): BeforeInstallPromptEvent | null {
  return deferredPrompt ?? promptDoGlobal();
}

/** Dispara o prompt nativo. Retorna true se o usuário aceitou instalar. */
export async function promptInstall(): Promise<boolean> {
  const ev = deferredPrompt ?? promptDoGlobal();
  if (!ev) return false;
  deferredPrompt = null;
  if (typeof window !== "undefined") (window as WindowComPrompt).__pwaInstallPrompt = null;
  await ev.prompt();
  const escolha = await ev.userChoice;
  listeners.forEach((fn) => fn());
  return escolha.outcome === "accepted";
}

/** Notifica quando o estado do prompt muda (ficou disponível / foi usado). */
export function onInstallPromptChange(fn: () => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

export function isIOS(): boolean {
  if (typeof navigator === "undefined") return false;
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}
