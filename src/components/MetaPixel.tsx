import { useEffect, useState } from "react";
import { useRouterState } from "@tanstack/react-router";
import { isMetaPixelConfigured, META_PIXEL_ID, trackMetaPixel } from "@/lib/meta-pixel";
import { CONSENT_EVENT, hasTrackingConsent } from "@/lib/consent";

/**
 * Inicializa o Meta Pixel e dispara PageView em mudanças de rota.
 *
 * O Pixel SÓ é carregado depois de consentimento explícito do usuário
 * (LGPD/diretriz da ANPD sobre cookies): enquanto não houver "accepted"
 * no consentimento, o script do Facebook não é injetado e nenhum evento é
 * disparado. O componente escuta o evento de consentimento para carregar o
 * Pixel no momento em que o usuário aceita, sem precisar recarregar a página.
 */
export function MetaPixel() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [consented, setConsented] = useState(false);

  // Acompanha o estado de consentimento (inicial + mudanças pelo banner).
  useEffect(() => {
    if (typeof window === "undefined") return;
    setConsented(hasTrackingConsent());
    const onChange = () => setConsented(hasTrackingConsent());
    window.addEventListener(CONSENT_EVENT, onChange);
    return () => window.removeEventListener(CONSENT_EVENT, onChange);
  }, []);

  // Carrega o Pixel uma única vez, apenas com consentimento.
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!isMetaPixelConfigured()) return;
    if (!consented) return;

    // Evita reinicializar se o pixel já foi carregado
    if ((window as unknown as Record<string, unknown>)._fbqLoaded) return;
    (window as unknown as Record<string, unknown>)._fbqLoaded = true;

    // Inicializa a fila do fbq
    window.fbq =
      window.fbq ||
      function (...args: unknown[]) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).fbq.callMethod
          ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (window as any).fbq.callMethod(...args)
          : // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (window as any).fbq.queue.push(args);
      };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const fbq = window.fbq as any;
    if (!fbq.loaded) {
      fbq.version = "2.0";
      fbq.queue = [];
      const script = document.createElement("script");
      script.async = true;
      script.src = "https://connect.facebook.net/en_US/fbevents.js";
      const firstScript = document.getElementsByTagName("script")[0];
      firstScript.parentNode?.insertBefore(script, firstScript);
      fbq.loaded = true;
    }

    fbq("init", META_PIXEL_ID);
    fbq("track", "PageView");
  }, [consented]);

  // Dispara PageView a cada mudança de rota (navegação SPA), só com consentimento.
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!isMetaPixelConfigured()) return;
    if (!consented) return;
    trackMetaPixel("PageView");
  }, [pathname, consented]);

  return null;
}
