import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

import logoHorizontal from "@/assets/familia_no_azul_horizontal.png.asset.json";
import { assetUrl } from "@/lib/asset-url";

const ORANGE = "#F97316";
const ORANGE_HOVER = "#EA580C";
const logoHorizontalUrl = assetUrl(logoHorizontal);

/** Header + footer padrão da landing page, reaproveitados nas páginas do blog. */
export function BlogLayout({ children }: { children: ReactNode }) {
  return (
    <div
      className="min-h-screen text-[#0F2A47] font-sans antialiased"
      style={{
        backgroundImage: "linear-gradient(180deg, #E6F2FB 0%, #D6EAF8 40%, #EAF4FC 100%)",
      }}
    >
      <header className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
        <Link to="/" className="flex items-center">
          <img src={logoHorizontalUrl} alt="Família no Azul" className="h-10 w-auto" />
        </Link>
        <div className="flex items-center gap-3">
          <Link to="/" className="hidden text-sm font-medium text-[#0F2A47] hover:opacity-70 sm:block">
            Voltar pro site
          </Link>
          <Link
            to="/auth"
            className="inline-flex min-h-[48px] items-center rounded-full px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors"
            style={{ backgroundColor: ORANGE }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = ORANGE_HOVER)}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = ORANGE)}
          >
            Entrar
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 pb-24 pt-4">{children}</main>

      <footer className="border-t border-white/60 pb-10">
        <div className="mx-auto max-w-6xl px-6 py-10 text-xs text-[#0F2A47]/70">
          <div className="grid gap-6 md:grid-cols-2 md:items-start">
            <div className="space-y-1.5">
              <div>© {new Date().getFullYear()} Família no Azul. Feito com carinho.</div>
              <div>Família no Azul é uma marca do Grupo Romana.</div>
              <div>CNPJ 48.570.356/0001-97</div>
              <div>
                Contato:{" "}
                <a href="mailto:sac.familianoazul@educarbem.com.br" className="hover:text-[#0F2A47]">
                  sac.familianoazul@educarbem.com.br
                </a>
              </div>
            </div>
            <div className="flex flex-wrap gap-x-6 gap-y-2 md:justify-end">
              <Link to="/blog" className="hover:text-[#0F2A47]">Blog</Link>
              <Link to="/" className="hover:text-[#0F2A47]">Início</Link>
              <Link to="/termos" className="hover:text-[#0F2A47]">Termos de Uso</Link>
              <Link to="/privacidade" className="hover:text-[#0F2A47]">Política de Privacidade</Link>
              <Link to="/auth" className="hover:text-[#0F2A47]">Entrar</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export function InlineText({ text }: { text: string }) {
  const parts = text.split(/\*\*(.+?)\*\*/g);
  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1 ? <strong key={i}>{part}</strong> : <span key={i}>{part}</span>,
      )}
    </>
  );
}
