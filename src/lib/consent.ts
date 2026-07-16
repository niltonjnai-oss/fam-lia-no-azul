// Consentimento de cookies/rastreamento (LGPD). Cookies estritamente
// necessários (sessão de login do Supabase) não dependem de consentimento;
// o que este módulo controla é o rastreamento de terceiros — hoje, o Meta
// Pixel. O Pixel só é carregado depois de consentimento explícito ("accepted").

export type ConsentState = "accepted" | "rejected" | null;

const STORAGE_KEY = "fna_cookie_consent_v1";

/** Disparado no window quando o usuário aceita ou recusa. `detail` = ConsentState. */
export const CONSENT_EVENT = "fna-consent-change";

export function getConsent(): ConsentState {
  if (typeof window === "undefined") return null;
  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    return value === "accepted" || value === "rejected" ? value : null;
  } catch {
    return null;
  }
}

export function setConsent(state: "accepted" | "rejected"): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, state);
  } catch {
    // localStorage indisponível (ex.: modo privado com quota zero) — segue
    // sem persistir; o banner reaparece na próxima visita, o que é seguro.
  }
  window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: state }));
}

/** True apenas quando o usuário consentiu explicitamente com rastreamento. */
export function hasTrackingConsent(): boolean {
  return getConsent() === "accepted";
}
