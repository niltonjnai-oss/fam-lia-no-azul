import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { Mail, Lock, Loader2, Eye, EyeOff, User, Check, X, AlertCircle, LifeBuoy, ShoppingCart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import logoVertical from "@/assets/familia_no_azul_vertical.png.asset.json";
import { signOut, useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { assetUrl } from "@/lib/asset-url";
import { InstalarAppButton } from "@/components/InstalarAppButton";
import { CONVITE_PENDENTE_KEY } from "@/routes/convite.$token";

export const Route = createFileRoute("/auth")({
  ssr: false,
  component: AuthPage,
});

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Checkout da Kiwify (mesmo link da LP) — oferecido quando o cadastro é
// bloqueado por falta de compra aprovada.
const KIWIFY_URL = "https://pay.kiwify.com.br/4FFlpa2";
const AUTH_NOTICE_STORAGE_KEY = "familia_auth_notice";
const EMAIL_CONFIRMATION_WINDOW_MS = 15 * 60 * 1000;
const logoVerticalUrl = assetUrl(logoVertical);
type AuthNotice = "email-confirmed" | "expired-link" | "invalid-link";

function isAuthNotice(value: string | null): value is AuthNotice {
  return value === "email-confirmed" || value === "expired-link" || value === "invalid-link";
}

function getHashParams() {
  const hash = window.location.hash.startsWith("#")
    ? window.location.hash.slice(1)
    : window.location.hash;
  return new URLSearchParams(hash);
}

function hasAuthCallbackSignal() {
  const params = getHashParams();
  return (
    window.location.href.endsWith("#") ||
    params.has("access_token") ||
    params.has("refresh_token") ||
    params.get("type") === "signup"
  );
}

function getAuthErrorNotice() {
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

function noticeMessage(notice: AuthNotice) {
  if (notice === "email-confirmed") {
    return "E-mail confirmado! Agora entre com seu e-mail e senha para acessar.";
  }
  if (notice === "expired-link") {
    return "Esse link de confirmação expirou ou já foi usado. Crie a conta novamente para receber um novo link.";
  }
  return "Não foi possível validar esse link. Solicite um novo link de confirmação.";
}

function AuthPage() {
  const { session, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [notice, setNotice] = useState<AuthNotice | null>(null);

  useEffect(() => {
    const storedNotice = window.sessionStorage.getItem(AUTH_NOTICE_STORAGE_KEY);
    if (isAuthNotice(storedNotice)) {
      setNotice(storedNotice);
      window.sessionStorage.removeItem(AUTH_NOTICE_STORAGE_KEY);
      return;
    }

    const authErrorNotice = getAuthErrorNotice();
    if (authErrorNotice) {
      setNotice(authErrorNotice);
      window.history.replaceState(null, "", "/auth");
    }
  }, []);

  useEffect(() => {
    if (authLoading || !session) return;

    const authErrorNotice = getAuthErrorNotice();
    if (authErrorNotice) {
      setNotice(authErrorNotice);
      window.history.replaceState(null, "", "/auth");
      void signOut();
      return;
    }

    if (hasAuthCallbackSignal() && isFreshEmailConfirmation(session)) {
      setMode("login");
      setNotice("email-confirmed");
      window.history.replaceState(null, "", "/auth");
      void signOut();
      return;
    }

    if (session) {
      const convitePendente = window.sessionStorage.getItem(CONVITE_PENDENTE_KEY);
      if (convitePendente) {
        navigate({ to: "/convite/$token", params: { token: convitePendente }, replace: true });
      } else {
        navigate({ to: "/app", replace: true });
      }
    }
  }, [session, authLoading, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-8">
      <div className="w-full max-w-md">
        <div className="mb-6 flex flex-col items-center text-center">
          <img src={logoVerticalUrl} alt="Família no Azul" className="mb-3 h-32 w-auto" />
          <p className="mt-1 text-sm text-muted-foreground">
            {mode === "signup"
              ? "Comece a sua virada — crie a conta da sua família."
              : "Entre para acompanhar o orçamento da sua família."}
          </p>
        </div>

        {notice && (
          <div className="mb-4 rounded-xl border border-primary/30 bg-primary/10 p-4 text-sm text-foreground">
            {noticeMessage(notice)}
          </div>
        )}

        <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
          <Tabs value={mode} onValueChange={(v) => setMode(v as "login" | "signup")}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Entrar</TabsTrigger>
              <TabsTrigger value="signup">Criar conta</TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="mt-5">
              <LoginForm />
            </TabsContent>
            <TabsContent value="signup" className="mt-5">
              <SignupForm onSwitchToLogin={() => setMode("login")} />
            </TabsContent>
          </Tabs>
        </div>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          Seus dados ficam protegidos por linha (RLS). Cada família só enxerga o que é seu.
        </p>

        <div className="mt-4">
          <InstalarAppButton />
        </div>
      </div>
    </div>
  );
}

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao autenticar");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="login-email">E-mail</Label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="login-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-9"
              placeholder="voce@exemplo.com"
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="login-password">Senha</Label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="login-password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-9 pr-10"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
              className="absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-md text-muted-foreground hover:text-foreground"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>
        <Button type="submit" className="h-11 w-full" disabled={submitting}>
          {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Entrar
        </Button>
      </form>
    </>
  );
}

type Requirement = { key: string; label: string; test: (p: string) => boolean };
const REQUIREMENTS: Requirement[] = [
  { key: "len", label: "Mínimo de 8 caracteres", test: (p) => p.length >= 8 },
  { key: "upper", label: "Uma letra maiúscula", test: (p) => /[A-Z]/.test(p) },
  { key: "lower", label: "Uma letra minúscula", test: (p) => /[a-z]/.test(p) },
  { key: "num", label: "Um número", test: (p) => /\d/.test(p) },
  { key: "special", label: "Um caractere especial", test: (p) => /[^A-Za-z0-9]/.test(p) },
];

function SignupForm({ onSwitchToLogin }: { onSwitchToLogin: () => void }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [blockMessage, setBlockMessage] = useState<string | null>(null);

  const reqStatus = useMemo(() => REQUIREMENTS.map((r) => ({ ...r, ok: r.test(password) })), [password]);
  const passedCount = reqStatus.filter((r) => r.ok).length;
  const strength = passwordStrength(passedCount);
  const emailValid = EMAIL_RE.test(email.trim());
  const passwordValid = passedCount === REQUIREMENTS.length;
  const confirmValid = confirm.length > 0 && confirm === password;
  const nameValid = name.trim().length >= 2;
  const canSubmit = nameValid && emailValid && passwordValid && confirmValid && acceptTerms && !submitting;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    setBlockMessage(null);
    try {
      const { error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth`,
          data: { full_name: name.trim() },
        },
      });
      if (error) {
        // Bloqueio por e-mail não comprador (Auth Hook retorna 403)
        const status = (error as { status?: number }).status;
        if (status === 403) {
          setBlockMessage(error.message || "Não encontramos uma compra aprovada com este e-mail.");
          return;
        }
        throw error;
      }
      toast.success("Conta criada! Vamos começar.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao criar conta");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      {blockMessage && (
        <div className="mb-4 rounded-xl border border-warning/40 bg-warning/10 p-4">
          <div className="flex gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-warning" />
            <div className="space-y-2 text-sm">
              <p className="font-medium text-foreground">Ainda não achamos sua compra</p>
              <p className="text-muted-foreground">{blockMessage}</p>
              <p className="text-xs text-muted-foreground">
                Comprou com outro e-mail? Refaça o cadastro usando aquele e-mail. Ainda não
                assinou? Garanta seu acesso agora:
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                <a
                  href={KIWIFY_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-9 items-center gap-1.5 rounded-md bg-primary px-3 text-xs font-semibold text-primary-foreground hover:bg-primary/90"
                >
                  <ShoppingCart className="h-3.5 w-3.5" /> Assinar o Família no Azul
                </a>
                <a
                  href="mailto:suporte@familianoazul.com.br"
                  className="inline-flex h-9 items-center gap-1.5 rounded-md border border-border bg-background px-3 text-xs font-medium hover:bg-accent"
                >
                  <LifeBuoy className="h-3.5 w-3.5" /> Falar com o suporte
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="signup-name">Nome completo</Label>
          <div className="relative">
            <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="signup-name"
              type="text"
              autoComplete="name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="pl-9"
              placeholder="Como devemos te chamar"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="signup-email">E-mail</Label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="signup-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-9"
              placeholder="voce@exemplo.com"
              aria-invalid={email.length > 0 && !emailValid}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Use o mesmo e-mail que você usou na hora da compra.
          </p>
          {email.length > 0 && !emailValid && (
            <p className="text-xs text-danger">Informe um e-mail válido.</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="signup-password">Senha</Label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="signup-password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-9 pr-10"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
              className="absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-md text-muted-foreground hover:text-foreground"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          {password.length > 0 && (
            <div className="space-y-2 pt-1">
              <div className="flex items-center gap-2">
                <div className="flex h-1.5 flex-1 gap-1">
                  {[0, 1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className={cn(
                        "h-full flex-1 rounded-full bg-muted transition-colors",
                        i < strength.bars && strength.color,
                      )}
                    />
                  ))}
                </div>
                <span className={cn("text-xs font-medium tabular-nums", strength.textClass)}>
                  {strength.label}
                </span>
              </div>
              <ul className="grid grid-cols-1 gap-1 text-xs sm:grid-cols-2">
                {reqStatus.map((r) => (
                  <li key={r.key} className="flex items-center gap-1.5">
                    {r.ok ? (
                      <Check className="h-3.5 w-3.5 text-success" />
                    ) : (
                      <X className="h-3.5 w-3.5 text-muted-foreground" />
                    )}
                    <span className={r.ok ? "text-foreground" : "text-muted-foreground"}>{r.label}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="signup-confirm">Confirmar senha</Label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="signup-confirm"
              type={showConfirm ? "text" : "password"}
              autoComplete="new-password"
              required
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="pl-9 pr-10"
              placeholder="••••••••"
              aria-invalid={confirm.length > 0 && !confirmValid}
            />
            <button
              type="button"
              onClick={() => setShowConfirm((v) => !v)}
              aria-label={showConfirm ? "Ocultar senha" : "Mostrar senha"}
              className="absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-md text-muted-foreground hover:text-foreground"
            >
              {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {confirm.length > 0 && !confirmValid && (
            <p className="text-xs text-danger">As senhas não coincidem.</p>
          )}
        </div>

        <label className="flex items-start gap-2 text-sm">
          <Checkbox
            checked={acceptTerms}
            onCheckedChange={(v) => setAcceptTerms(v === true)}
            className="mt-0.5"
            aria-label="Aceitar termos"
          />
          <span className="text-muted-foreground">
            Li e aceito os{" "}
            <a href="/termos" target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-2">Termos de Uso</a>{" "}
            e a{" "}
            <a href="/privacidade" target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-2">Política de Privacidade</a>.
          </span>
        </label>

        <Button type="submit" className="h-11 w-full" disabled={!canSubmit}>
          {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Cadastrar
        </Button>
      </form>

      <p className="mt-4 text-center text-sm text-muted-foreground">
        Já tem conta?{" "}
        <button type="button" onClick={onSwitchToLogin} className="font-medium text-primary hover:underline">
          Entrar
        </button>
      </p>
      <p className="mt-2 text-center text-xs text-muted-foreground">
        Ainda não assinou?{" "}
        <a
          href={KIWIFY_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-primary hover:underline"
        >
          Garanta seu acesso
        </a>
      </p>
    </>
  );
}

function passwordStrength(passed: number): {
  bars: number;
  label: string;
  color: string;
  textClass: string;
} {
  if (passed <= 1) return { bars: 1, label: "Fraca", color: "bg-danger", textClass: "text-danger" };
  if (passed === 2) return { bars: 2, label: "Média", color: "bg-warning", textClass: "text-warning" };
  if (passed === 3 || passed === 4)
    return { bars: 3, label: "Forte", color: "bg-primary", textClass: "text-primary" };
  return { bars: 4, label: "Muito forte", color: "bg-success", textClass: "text-success" };
}

