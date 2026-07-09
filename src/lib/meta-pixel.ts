// Utilitário para o Meta Pixel (Facebook Pixel).
// O ID é público (aparece no código-fonte da página), por isso pode ser
// injetado no bundle do navegador via variável de ambiente VITE_*.

export const META_PIXEL_ID = import.meta.env.VITE_META_PIXEL_ID as string | undefined;

export type MetaPixelEvent =
  | "PageView"
  | "Lead"
  | "Purchase"
  | "CompleteRegistration"
  | "InitiateCheckout"
  | "AddPaymentInfo"
  | "ViewContent"
  | "Search"
  | "Contact"
  | "CustomizeProduct"
  | "Donate"
  | "FindLocation"
  | "Schedule"
  | "StartTrial"
  | "SubmitApplication"
  | "Subscribe"
  | string;

declare global {
  interface Window {
    fbq?: (
      command: "track" | "trackCustom" | "init" | "consent" | string,
      eventName?: MetaPixelEvent | string,
      params?: Record<string, unknown>,
    ) => void;
  }
}

export function isMetaPixelConfigured(): boolean {
  return typeof META_PIXEL_ID === "string" && META_PIXEL_ID.length > 0;
}

export function trackMetaPixel(event: MetaPixelEvent, params?: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  if (!isMetaPixelConfigured()) return;
  if (typeof window.fbq !== "function") return;

  try {
    window.fbq("track", event, params);
  } catch (error) {
    console.warn("[Meta Pixel] Falha ao disparar evento:", error);
  }
}

export function trackMetaPixelCustom(event: string, params?: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  if (!isMetaPixelConfigured()) return;
  if (typeof window.fbq !== "function") return;

  try {
    window.fbq("trackCustom", event, params);
  } catch (error) {
    console.warn("[Meta Pixel] Falha ao disparar evento customizado:", error);
  }
}
