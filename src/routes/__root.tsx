import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
  useNavigate,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import type { Session } from "@supabase/supabase-js";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { AppLayout } from "../components/AppLayout";
import { AuthProvider, signOut, useAuth } from "../lib/auth-context";
import { Toaster } from "../components/ui/sonner";
import { MesProvider } from "../lib/mes-context";
import { MetaPixel } from "../components/MetaPixel";


const AUTH_NOTICE_STORAGE_KEY = "familia_auth_notice";
const EMAIL_CONFIRMATION_WINDOW_MS = 15 * 60 * 1000;

function getHashParams() {
  if (typeof window === "undefined") return new URLSearchParams();
  const hash = window.location.hash.startsWith("#")
    ? window.location.hash.slice(1)
    : window.location.hash;
  return new URLSearchParams(hash);
}

function hasAuthCallbackSignal() {
  if (typeof window === "undefined") return false;
  const params = getHashParams();
  return (
    window.location.href.endsWith("#") ||
    params.has("access_token") ||
    params.has("refresh_token") ||
    params.get("type") === "signup"
  );
}

function getAuthErrorNotice(pathname: string) {
  if (pathname !== "/") return null;
  const params = getHashParams();
  if (!params.has("error") && !params.has("error_code")) return null;
  return params.get("error_code") === "otp_expired" ? "expired-link" : "invalid-link";
}

function isFreshEmailConfirmation(session: Session) {
  const provider = session.user.app_metadata?.provider;
  if (provider && provider !== "email") return false;

  const confirmedAt = session.user.email_confirmed_at ?? session.user.confirmed_at;
  const confirmedTime = Date.parse(confirmedAt ?? "");
  if (!Number.isFinite(confirmedTime)) return false;

  return Math.abs(Date.now() - confirmedTime) <= EMAIL_CONFIRMATION_WINDOW_MS;
}

function shouldSendConfirmedEmailUserToAuth(pathname: string, session: Session | null) {
  return pathname === "/" && Boolean(session && hasAuthCallbackSignal() && isFreshEmailConfirmation(session));
}

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Página não encontrada</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          A página que você procura não existe ou foi movida.
        </p>
        <div className="mt-6">
          <Link
            to="/app"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Ir para o painel
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          Algo deu errado
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Não foi possível carregar esta página. Tente novamente ou volte ao início.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Tentar novamente
          </button>
          <a
            href="/app"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Ir para o painel
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { title: "Família no Azul · Controle de Orçamento Familiar e Pessoal" },
      {
        name: "description",
        content:
          "Controle de orçamento familiar para pais brasileiros. Acompanhe gastos, dívidas, reserva de emergência e o método 50-30-20.",
      },
      { name: "author", content: "Família no Azul" },
      { property: "og:title", content: "Família no Azul" },
      {
        property: "og:description",
        content: "Controle de orçamento familiar simples, claro e confiável.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "theme-color", content: "#1E40AF" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-title", content: "No Azul" },
    ],
    links: [
      { rel: "manifest", href: "/manifest.webmanifest" },
      { rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
      { rel: "icon", type: "image/png", sizes: "48x48", href: "/favicon-48.png" },
      { rel: "icon", type: "image/png", sizes: "32x32", href: "/favicon-32.png" },
      { rel: "icon", type: "image/png", sizes: "16x16", href: "/favicon-16.png" },
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,600;0,9..144,700;1,9..144,400;1,9..144,600&family=Inter:wght@400;500;600;700;800&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  // Registra o service worker (habilita a instalação nativa do PWA no Android).
  useEffect(() => {
    if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js").catch((err) => {
      console.warn("Falha ao registrar service worker", err);
    });
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <MesProvider>
          <AuthGate />
        </MesProvider>
        <Toaster />
      </AuthProvider>
      <MetaPixel />
    </QueryClientProvider>
  );
}

function AuthGate() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { session, loading } = useAuth();
  const navigate = useNavigate();
  const isAuthRoute = pathname.startsWith("/auth");
  const isResetPassword = pathname.startsWith("/reset-password");
  // Landing page mora na raiz; /inicio só redireciona pra lá.
  const isLanding = pathname === "/" || pathname === "/inicio";
  const isLegal = pathname === "/termos" || pathname === "/privacidade";
  // Convite do Modo Casal: acessível logado ou não (a própria página decide).
  const isConvite = pathname.startsWith("/convite/");
  // Blog é conteúdo público (SEO) — acessível logado ou não.
  const isBlog = pathname.startsWith("/blog");
  const isPublicRoute = isAuthRoute || isResetPassword || isLanding || isLegal || isConvite || isBlog;
  const isOnboarding = pathname.startsWith("/onboarding");
  const authErrorNotice = !loading ? getAuthErrorNotice(pathname) : null;
  const isHandlingEmailConfirmation = !loading && shouldSendConfirmedEmailUserToAuth(pathname, session);
  const isHandlingAuthError = !loading && Boolean(authErrorNotice);

  useEffect(() => {
    if (loading) return;

    const authErrorNotice = getAuthErrorNotice(pathname);
    if (authErrorNotice) {
      window.sessionStorage.setItem(AUTH_NOTICE_STORAGE_KEY, authErrorNotice);
      if (session) {
        void signOut().finally(() => navigate({ to: "/auth", replace: true }));
      } else {
        navigate({ to: "/auth", replace: true });
      }
      return;
    }

    if (shouldSendConfirmedEmailUserToAuth(pathname, session)) {
      window.sessionStorage.setItem(AUTH_NOTICE_STORAGE_KEY, "email-confirmed");
      void signOut().finally(() => navigate({ to: "/auth", replace: true }));
      return;
    }

    // Sem login em rota protegida (ex.: PWA abre em /app): direto pro login,
    // não pra landing page — quem chegou aqui já é cliente.
    if (!session && !isPublicRoute) {
      navigate({ to: "/auth", replace: true });
      return;
    }

    // Logado na landing (raiz) sem fluxo de auth pendente: vai direto pro app.
    if (session && pathname === "/") {
      navigate({ to: "/app", replace: true });
    }
  }, [session, loading, pathname, isPublicRoute, navigate]);

  if (loading || isHandlingEmailConfirmation || isHandlingAuthError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (isPublicRoute) return <Outlet />;
  if (!session) return null;
  if (isOnboarding) return <Outlet />;
  return <AppLayout />;
}
