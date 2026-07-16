import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";

import { getConsent, setConsent } from "@/lib/consent";

const ORANGE = "#F97316";
const ORANGE_HOVER = "#EA580C";
const NAVY = "#0F2A47";

/**
 * Banner de consentimento de cookies (LGPD). Aparece só na primeira visita
 * (enquanto não houver escolha salva) e oferece recusa real — recusar mantém
 * o Meta Pixel desligado. Cookies estritamente necessários (login) não
 * dependem deste banner e continuam funcionando de qualquer forma.
 */
export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Só decide a visibilidade no cliente, após ler o localStorage — evita
    // piscar o banner no SSR pra quem já escolheu.
    if (getConsent() === null) setVisible(true);
  }, []);

  if (!visible) return null;

  function choose(state: "accepted" | "rejected") {
    setConsent(state);
    setVisible(false);
  }

  return (
    <div
      role="dialog"
      aria-label="Aviso de cookies"
      className="fixed inset-x-0 bottom-0 z-50 px-4 pb-4"
    >
      <div
        className="mx-auto flex max-w-3xl flex-col gap-4 rounded-2xl p-5 shadow-2xl ring-1 ring-black/10 sm:flex-row sm:items-center"
        style={{ backgroundColor: "#FFFFFF" }}
      >
        <p className="flex-1 text-sm leading-relaxed" style={{ color: NAVY }}>
          Usamos cookies necessários pra manter você conectado e, com o seu aceite, um cookie de
          medição (Meta Pixel) pra entender o alcance dos nossos anúncios. Você pode recusar sem
          prejuízo do uso do app. Saiba mais na{" "}
          <Link to="/privacidade" className="font-semibold underline">
            Política de Privacidade
          </Link>
          .
        </p>
        <div className="flex shrink-0 gap-3">
          <button
            type="button"
            onClick={() => choose("rejected")}
            className="min-h-[44px] rounded-full border px-5 py-2.5 text-sm font-semibold transition-colors"
            style={{ borderColor: `${NAVY}26`, color: NAVY }}
          >
            Recusar
          </button>
          <button
            type="button"
            onClick={() => choose("accepted")}
            className="min-h-[44px] rounded-full px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors"
            style={{ backgroundColor: ORANGE }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = ORANGE_HOVER)}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = ORANGE)}
          >
            Aceitar
          </button>
        </div>
      </div>
    </div>
  );
}
