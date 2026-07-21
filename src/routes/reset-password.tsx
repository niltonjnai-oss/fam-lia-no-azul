import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Lock, Loader2, Eye, EyeOff, ShieldCheck, User as UserIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import logoVertical from "@/assets/familia_no_azul_vertical.png.asset.json";
import { assetUrl } from "@/lib/asset-url";

export const Route = createFileRoute("/reset-password")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Redefinir senha — Família no Azul" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: ResetPasswordPage,
});

const logoVerticalUrl = assetUrl(logoVertical);

function ResetPasswordPage() {
  const navigate = useNavigate();
  const { session, loading: authLoading } = useAuth();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [nome, setNome] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Convidado (cônjuge) chega sem nome no cadastro — pedimos aqui, junto da
  // senha, para ele aparecer com o nome no painel e na família. Recuperação de
  // senha de quem já tem conta não mostra o campo. Independe do hash da URL.
  const nomeAtual = (
    (session?.user?.user_metadata as { full_name?: string } | undefined)?.full_name ?? ""
  ).trim();
  const precisaNome = Boolean(session) && nomeAtual === "";

  // Detecta se veio de um link de convite/recuperação (hash do Supabase).
  const linkType = useMemo(() => {
    if (typeof window === "undefined") return null;
    const hash = window.location.hash.startsWith("#")
      ? window.location.hash.slice(1)
      : window.location.hash;
    const params = new URLSearchParams(hash);
    return params.get("type"); // "invite" | "recovery" | null
  }, []);

  const isInvite = linkType === "invite";
  const isRecovery = linkType === "recovery";

  // Se não veio de link e não há sessão, manda para /auth.
  useEffect(() => {
    if (authLoading) return;
    if (!session && !isInvite && !isRecovery) {
      navigate({ to: "/auth", replace: true });
    }
  }, [authLoading, session, isInvite, isRecovery, navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 6) {
      toast.error("A senha precisa ter pelo menos 6 caracteres.");
      return;
    }
    if (password !== confirm) {
      toast.error("As senhas não conferem.");
      return;
    }
    if (precisaNome && nome.trim().length < 2) {
      toast.error("Digite seu nome para continuar.");
      return;
    }
    setSubmitting(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password,
        ...(precisaNome ? { data: { full_name: nome.trim() } } : {}),
      });
      if (error) throw error;
      toast.success("Tudo pronto! Vamos começar.");
      if (typeof window !== "undefined") {
        window.history.replaceState(null, "", window.location.pathname);
      }

      // Quem chega aqui é usuário JÁ existente: recuperação de senha (titular ou
      // cônjuge que já usam o app) ou convite de cônjuge (família já montada).
      // Em todos os casos o destino é o painel — nunca refazer o onboarding.
      // Rede de segurança: se o orçamento estiver vazio, o próprio /app mostra o
      // card "Comece aqui" que leva ao onboarding.
      navigate({ to: "/app", replace: true });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Não foi possível definir a senha.";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  }

  const boasVindas = isInvite || precisaNome;
  const title = boasVindas ? "Bem-vindo(a) à família! 💙" : "Defina uma nova senha";
  const subtitle = boasVindas
    ? "Falta só criar seu acesso: seu nome e uma senha para entrar sempre que quiser."
    : "Escolha uma nova senha para acessar sua conta.";

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-8">
      <div className="w-full max-w-md">
        <div className="mb-6 flex flex-col items-center text-center">
          <img src={logoVerticalUrl} alt="Família no Azul" className="mb-3 h-24 w-auto" />
          <h1 className="text-xl font-semibold text-foreground">{title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
          <form onSubmit={handleSubmit} className="space-y-4">
            {precisaNome && (
              <div className="space-y-1.5">
                <Label htmlFor="nome">Seu nome</Label>
                <div className="relative">
                  <UserIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="nome"
                    type="text"
                    autoComplete="name"
                    required
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    className="pl-9"
                    placeholder="Como devemos te chamar"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="password">{precisaNome ? "Crie uma senha" : "Nova senha"}</Label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-9 pr-10"
                  placeholder="Mínimo 6 caracteres"
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

            <div className="space-y-1.5">
              <Label htmlFor="confirm">Confirmar senha</Label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="confirm"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  minLength={6}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className="pl-9"
                  placeholder="Repita a senha"
                />
              </div>
            </div>

            <Button type="submit" className="h-11 w-full" disabled={submitting || authLoading}>
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {boasVindas ? "Entrar na família" : "Salvar nova senha"}
            </Button>
          </form>

          <div className="mt-4 flex items-start gap-2 rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <span>Seus dados ficam protegidos por linha (RLS). Cada família só enxerga o que é seu.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
