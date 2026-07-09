import { useEffect } from "react";
import { useRouterState } from "@tanstack/react-router";
import { isMetaPixelConfigured, META_PIXEL_ID, trackMetaPixel } from "@/lib/meta-pixel";

/**
 * Inicializa o Meta Pixel e dispara PageView em mudanças de rota.
 * Como a navegação do TanStack Router é SPA, o evento PageView precisa
 * ser disparado manualmente a cada mudança de pathname.
 */
export function MetaPixel() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!isMetaPixelConfigured()) return;

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
  }, []);

  // Dispara PageView a cada mudança de rota (navegação SPA)
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!isMetaPixelConfigured()) return;
    trackMetaPixel("PageView");
  }, [pathname]);

  return null;
}
