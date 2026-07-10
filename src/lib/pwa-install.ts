// Captura global do evento de instalação do PWA (beforeinstallprompt).
// O Chrome só dispara esse evento UMA vez por page-load, então capturamos em
// módulo (na primeira importação) e compartilhamos entre os componentes
// (card do Painel + botão da sidebar).

export type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

let deferredPrompt: BeforeInstallPromptEvent | null = null;
const listeners = new Set<() => void>();

if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPrompt = e as BeforeInstallPromptEvent;
    listeners.forEach((fn) => fn());
  });
  window.addEventListener("appinstalled", () => {
    deferredPrompt = null;
    listeners.forEach((fn) => fn());
  });
}

export function getInstallPrompt(): BeforeInstallPromptEvent | null {
  return deferredPrompt;
}

/** Dispara o prompt nativo. Retorna true se o usuário aceitou instalar. */
export async function promptInstall(): Promise<boolean> {
  if (!deferredPrompt) return false;
  const ev = deferredPrompt;
  deferredPrompt = null;
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
