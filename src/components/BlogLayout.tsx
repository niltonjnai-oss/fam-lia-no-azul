import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

import logoHorizontal from "@/assets/familia-no-azul-horizontal-claro.png.asset.json";
import { assetUrl } from "@/lib/asset-url";

const ORANGE = "#F97316";
const ORANGE_HOVER = "#EA580C";
const logoHorizontalUrl = assetUrl(logoHorizontal);

/** Header + footer padrão da landing page, reaproveitados nas páginas do blog.
 *  `background` permite trocar o creme padrão do blog pelo azul da LP (ex.:
 *  páginas legais que devem combinar com o site). Aceita cor sólida ou gradiente. */
export function BlogLayout({
  children,
  wide = false,
  background = "#FAF7F1",
}: {
  children: ReactNode;
  wide?: boolean;
  background?: string;
}) {
  const isGradient = background.includes("gradient");
  return (
    <div
      className="min-h-screen text-[#0F2A47] font-sans antialiased"
      style={isGradient ? { backgroundImage: background } : { backgroundColor: background }}
    >
      <header className="border-b border-[#0F2A47]/10 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link to="/" className="flex items-center">
            <img src={logoHorizontalUrl} alt="Família no Azul" className="h-9 w-auto" />
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/" className="hidden text-sm font-medium text-[#0F2A47] hover:opacity-70 sm:block">
              Voltar pro site
            </Link>
            <Link
              to="/auth"
              className="inline-flex min-h-[44px] items-center rounded-full px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors"
              style={{ backgroundColor: ORANGE }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = ORANGE_HOVER)}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = ORANGE)}
            >
              Entrar
            </Link>
          </div>
        </div>
      </header>

      <main className={`mx-auto px-6 pb-24 pt-8 ${wide ? "max-w-7xl" : "max-w-3xl"}`}>{children}</main>


      <footer className="border-t border-white/60 pb-10">
        <div className="mx-auto max-w-6xl px-6 py-10 text-xs text-[#0F2A47]/70">
          <div className="flex flex-col items-center gap-6 text-center">
            <div>
              <img src={logoHorizontalUrl} alt="Família no Azul" className="mx-auto h-8 w-auto" />
              <p className="mt-2 text-xs text-[#0F2A47]/70">
                <span className="block font-semibold text-[#0F2A47]">Família no Azul</span>
                Seu assistente de finanças para sua Família.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
              <Link to="/" hash="beneficios" className="hover:text-[#0F2A47]">Benefícios</Link>
              <Link to="/" hash="planos" className="hover:text-[#0F2A47]">Planos</Link>
              <Link to="/" hash="faq" className="hover:text-[#0F2A47]">FAQ</Link>
              <Link to="/blog" className="hover:text-[#0F2A47]">Blog</Link>
              <Link to="/termos" className="hover:text-[#0F2A47]">Termos de Uso</Link>
              <Link to="/privacidade" className="hover:text-[#0F2A47]">Política de Privacidade</Link>
              <Link to="/auth" className="hover:text-[#0F2A47]">Entrar</Link>
            </div>
          </div>
          <div className="mt-8 border-t border-white/60 pt-6 space-y-1.5 text-center">
            <div>© {new Date().getFullYear()} Família no Azul. Feito com carinho.</div>
            <div>Família no Azul é uma marca do Grupo Romana.</div>
            <div>CNPJ 48.570.356/0001-97</div>
            <div>
              Contato:{" "}
              <a
                href="mailto:sac.familianoazul@educarbem.com.br"
                className="hover:text-[#0F2A47]"
              >
                sac.familianoazul@educarbem.com.br
              </a>
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
