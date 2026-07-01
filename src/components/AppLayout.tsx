import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Wallet,
  PieChart,
  CreditCard,
  PiggyBank,
  LogOut,
} from "lucide-react";
import type { ComponentType } from "react";

import { useAuth, signOut } from "@/lib/auth-context";
import { useIsAdmin } from "@/lib/use-is-admin";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import logoHorizontal from "@/assets/familia_no_azul_horizontal.png.asset.json";

type NavItem = {
  to: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
};

const navItems: NavItem[] = [
  { to: "/", label: "Painel", icon: LayoutDashboard },
  { to: "/orcamento", label: "Orçamento", icon: Wallet },
  { to: "/metodo", label: "50-30-20", icon: PieChart },
  { to: "/dividas", label: "Dívidas", icon: CreditCard },
  { to: "/reserva", label: "Reserva", icon: PiggyBank },
];

export function AppLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { user } = useAuth();
  const isAdmin = useIsAdmin();

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Sidebar (desktop) */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-border bg-sidebar px-4 py-6 lg:flex lg:flex-col">
        <div className="mb-8 px-2">
          <Link to="/" className="block">
            <img
              src={logoHorizontal.url}
              alt="Família no Azul"
              className="h-10 w-auto"
            />
          </Link>
        </div>
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => {
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
              src={logoHorizontal.url}
              alt="Família no Azul"
              className="h-7 w-auto"
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

      {/* Bottom nav (mobile) */}
      <nav
        className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-surface/95 backdrop-blur lg:hidden"
        aria-label="Navegação principal"
      >
        <ul className="mx-auto flex max-w-xl items-stretch justify-between px-2">
          {navItems.map((item) => {
            const active = pathname === item.to;
            const Icon = item.icon;
            return (
              <li key={item.to} className="flex-1">
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
          })}
        </ul>
        <div className="h-[env(safe-area-inset-bottom)]" />
      </nav>
    </div>
  );
}
