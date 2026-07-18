import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Wallet,
  PieChart,
  CreditCard,
  PiggyBank,
  Sparkles,
  Gift,
  Mail,
  LogOut,
  CalendarClock,
  Users,
  Plus,
  LayoutGrid,
} from "lucide-react";
import { useState, type ComponentType } from "react";

import { useAuth, signOut } from "@/lib/auth-context";
import { useIsAdmin } from "@/lib/use-is-admin";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import logoHorizontal from "@/assets/familia-no-azul-horizontal-claro.png.asset.json";
import { assetUrl } from "@/lib/asset-url";
import { InstalarAppButton } from "@/components/InstalarAppButton";
import { LancamentoRapidoSheet } from "@/components/LancamentoRapido";

type NavItem = {
  to: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
};

const navItems: NavItem[] = [
  { to: "/app", label: "Painel", icon: LayoutDashboard },
  { to: "/orcamento", label: "Orçamento", icon: Wallet },
  { to: "/metodo", label: "50-30-20", icon: PieChart },
  { to: "/dividas", label: "Dívidas", icon: CreditCard },
  { to: "/contas", label: "Contas", icon: CalendarClock },
  { to: "/reserva", label: "Reserva", icon: PiggyBank },
  { to: "/familia", label: "Família", icon: Users },
  { to: "/assinatura", label: "Assinatura", icon: Sparkles },
  { to: "/indicacao", label: "Indique", icon: Gift },
];

/** Itens fixos da barra mobile; o resto vai pro sheet "Mais". O botão central
 *  laranja (Anotar gasto) ocupa o 3º slot — a ação nº 1 do app na zona do polegar. */
const MOBILE_NAV_FIXO = ["/app", "/orcamento", "/dividas"];

const logoHorizontalUrl = assetUrl(logoHorizontal);

export function AppLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { user } = useAuth();
  const isAdmin = useIsAdmin();
  const [gastoOpen, setGastoOpen] = useState(false);
  const [maisOpen, setMaisOpen] = useState(false);
  const visibleNav = isAdmin
    ? [...navItems, { to: "/admin/emails", label: "Emails", icon: Mail } as NavItem]
    : navItems;

  const mobileFixo = visibleNav.filter((i) => MOBILE_NAV_FIXO.includes(i.to));
  const mobileMais = visibleNav.filter((i) => !MOBILE_NAV_FIXO.includes(i.to));
  const maisAtivo = mobileMais.some((i) => pathname === i.to);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Sidebar (desktop) */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-border bg-sidebar px-4 py-6 lg:flex lg:flex-col">
        <div className="mb-8 px-2">
          <Link to="/app" className="block">
            <img
              src={logoHorizontalUrl}
              alt="Família no Azul"
              className="h-8 w-auto max-w-full object-contain"
            />
          </Link>
        </div>
        <nav className="flex flex-col gap-1">
          {visibleNav.map((item) => {
            const active = pathname === item.to;
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={[
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-200",
                  active
                    ? "bg-primary text-primary-foreground shadow-soft"
                    : "text-sidebar-foreground hover:bg-sidebar-accent",
                ].join(" ")}
              >
                <Icon className="h-5 w-5 shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto space-y-3">
          <InstalarAppButton />
          {user && (
            <div className="rounded-xl border border-border bg-card p-3 text-xs">
              <div className="flex items-center gap-2">
                <div className="truncate font-medium text-foreground" title={user.email ?? ""}>
                  {user.email}
                </div>
                {isAdmin && (
                  <Badge variant="default" className="h-5 shrink-0 px-1.5 py-0 text-[10px]">
                    Admin
                  </Badge>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => signOut()}
                className="mt-2 h-8 w-full justify-start gap-2 px-2 text-muted-foreground hover:text-foreground"
              >
                <LogOut className="h-4 w-4" />
                Sair
              </Button>
            </div>
          )}
          <div className="rounded-xl bg-accent p-3 text-xs text-accent-foreground">
            <div className="font-semibold">Dica do mês</div>
            <p className="mt-1 text-muted-foreground">
              Revise o orçamento toda semana para evitar surpresas no fim do mês.
            </p>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="pb-24 lg:ml-64 lg:pb-8">
        {/* Mobile header */}
        <div className="flex items-center justify-between border-b border-border bg-surface px-4 py-3 lg:hidden">
          <div className="flex items-center gap-2">
            <img
              src={logoHorizontalUrl}
              alt="Família no Azul"
              className="h-7 w-auto max-w-full object-contain"
            />
            {isAdmin && (
              <Badge variant="default" className="h-5 px-1.5 py-0 text-[10px]">
                Admin
              </Badge>
            )}
          </div>
          {user && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => signOut()}
              className="h-9 gap-1.5 px-2 text-muted-foreground"
              aria-label="Sair"
            >
              <LogOut className="h-4 w-4" />
              <span className="text-xs">Sair</span>
            </Button>
          )}
        </div>
        <div className="mx-auto max-w-5xl px-4 py-5 sm:px-6 lg:py-8">
          <Outlet />
        </div>
      </main>

      {/* Bottom nav (mobile): 2 itens + botão central de Anotar gasto + 1 item + Mais */}
      <nav
        className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-surface/95 backdrop-blur lg:hidden"
        aria-label="Navegação principal"
      >
        <ul className="mx-auto grid max-w-xl grid-cols-5 items-stretch px-2">
          {mobileFixo.slice(0, 2).map((item) => (
            <MobileNavItem key={item.to} item={item} active={pathname === item.to} />
          ))}
          <li className="relative flex items-end justify-center">
            <button
              type="button"
              onClick={() => setGastoOpen(true)}
              aria-label="Anotar um gasto"
              className="absolute -top-5 grid h-14 w-14 place-items-center rounded-full bg-cta text-cta-foreground shadow-elevated ring-4 ring-background transition-colors hover:bg-cta-hover active:scale-95"
            >
              <Plus className="h-6 w-6" />
            </button>
            <span className="pb-2 text-[11px] font-medium text-muted-foreground">Anotar</span>
          </li>
          {mobileFixo.slice(2).map((item) => (
            <MobileNavItem key={item.to} item={item} active={pathname === item.to} />
          ))}
          <li>
            <button
              type="button"
              onClick={() => setMaisOpen(true)}
              className={[
                "flex min-h-[56px] w-full flex-col items-center justify-center gap-0.5 px-2 py-2 text-[11px] font-medium transition-colors",
                maisAtivo ? "text-primary" : "text-muted-foreground hover:text-foreground",
              ].join(" ")}
            >
              <span
                className={[
                  "grid h-9 w-9 place-items-center rounded-xl transition-colors",
                  maisAtivo ? "bg-primary/10" : "bg-transparent",
                ].join(" ")}
              >
                <LayoutGrid className="h-5 w-5" />
              </span>
              <span>Mais</span>
            </button>
          </li>
        </ul>
        <div className="h-[env(safe-area-inset-bottom)]" />
      </nav>

      {/* Sheet do botão central (global — funciona em qualquer tela do app) */}
      <LancamentoRapidoSheet open={gastoOpen} onOpenChange={setGastoOpen} />

      {/* Sheet "Mais" com o restante da navegação */}
      <Sheet open={maisOpen} onOpenChange={setMaisOpen}>
        <SheetContent side="bottom" className="rounded-t-2xl">
          <SheetHeader className="text-left">
            <SheetTitle className="text-base">Mais áreas do app</SheetTitle>
          </SheetHeader>
          <ul className="mt-2 grid grid-cols-3 gap-2 pb-2">
            {mobileMais.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.to;
              return (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    onClick={() => setMaisOpen(false)}
                    className={[
                      "flex flex-col items-center gap-1.5 rounded-2xl border px-2 py-3 text-[11px] font-medium transition-colors",
                      active
                        ? "border-primary/40 bg-primary/5 text-primary"
                        : "border-border text-foreground hover:bg-muted",
                    ].join(" ")}
                  >
                    <span
                      className={[
                        "grid h-10 w-10 place-items-center rounded-xl",
                        active ? "bg-primary/10 text-primary" : "bg-muted text-foreground",
                      ].join(" ")}
                    >
                      <Icon className="h-5 w-5" />
                    </span>
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </SheetContent>
      </Sheet>
    </div>
  );
}

function MobileNavItem({ item, active }: { item: NavItem; active: boolean }) {
  const Icon = item.icon;
  return (
    <li>
      <Link
        to={item.to}
        className={[
          "flex min-h-[56px] flex-col items-center justify-center gap-0.5 px-2 py-2 text-[11px] font-medium transition-colors",
          active ? "text-primary" : "text-muted-foreground hover:text-foreground",
        ].join(" ")}
        aria-current={active ? "page" : undefined}
      >
        <span
          className={[
            "grid h-9 w-9 place-items-center rounded-xl transition-colors",
            active ? "bg-primary/10" : "bg-transparent",
          ].join(" ")}
        >
          <Icon className="h-5 w-5" />
        </span>
        <span>{item.label}</span>
      </Link>
    </li>
  );
}
