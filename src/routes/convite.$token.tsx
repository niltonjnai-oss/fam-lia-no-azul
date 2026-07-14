// Página pública de aceite de convite do Modo Casal.
// - Sem sessão: mostra o e-mail convidado e leva para /auth (guarda o token
//   para retomar depois do login/cadastro — ver auth.tsx).
// - Com sessão: aceita automaticamente (RPC) e redireciona pro painel.

import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Heart, Loader2, CheckCircle2, AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { infoConvite, aceitarConvite } from "@/lib/db";

export const CONVITE_PENDENTE_KEY = "fna_convite_pendente";
export const CONVITE_EMAIL_KEY = "fna_convite_email";

export const Route = createFileRoute("/convite/$token")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Convite para a família — Família no Azul" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: ConvitePage,
});

type Estado =
  | { tipo: "carregando" }
  | { tipo: "invalido"; motivo: string }
  | { tipo: "pendente_login"; email: string }
  | { tipo: "aceitando" }
  | { tipo: "aceito" }
  | { tipo: "erro"; mensagem: string };

function ConvitePage() {
  const { token } = Route.useParams();
  const { session, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [estado, setEstado] = useState<Estado>({ tipo: "carregando" });

  useEffect(() => {
    if (authLoading) return;

    let cancelado = false;
    async function run() {
      if (session) {
        setEstado({ tipo: "aceitando" });
        try {
          const r = await aceitarConvite(token);
          if (cancelado) return;
          if ("error" in r) {
            setEstado({ tipo: "erro", mensagem: r.error });
          } else {
            window.sessionStorage.removeItem(CONVITE_PENDENTE_KEY);
            setEstado({ tipo: "aceito" });
            setTimeout(() => navigate({ to: "/app", replace: true }), 2000);
          }
        } catch (e) {
          if (!cancelado) {
            setEstado({ tipo: "erro", mensagem: e instanceof Error ? e.message : "Erro inesperado" });
          }
        }
        return;
      }

      try {
        const info = await infoConvite(token);
        if (cancelado) return;
        if (!info.valido) {
          setEstado({ tipo: "invalido", motivo: info.motivo });
        } else {
          window.sessionStorage.setItem(CONVITE_PENDENTE_KEY, token);
          window.sessionStorage.setItem(CONVITE_EMAIL_KEY, info.email);
          setEstado({ tipo: "pendente_login", email: info.email });
        }
      } catch (e) {
        if (!cancelado) {
          setEstado({ tipo: "erro", mensagem: e instanceof Error ? e.message : "Erro inesperado" });
        }
      }
    }
    void run();
    return () => {
      cancelado = true;
    };
  }, [session, authLoading, token, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-8">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 text-center shadow-soft">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-primary/10 text-primary">
          <Heart className="h-6 w-6" />
        </div>

        {(estado.tipo === "carregando" || estado.tipo === "aceitando") && (
          <>
            <h1 className="mt-4 text-lg font-semibold">
              {estado.tipo === "aceitando" ? "Confirmando seu convite…" : "Carregando convite…"}
            </h1>
            <Loader2 className="mx-auto mt-3 h-5 w-5 animate-spin text-muted-foreground" />
          </>
        )}

        {estado.tipo === "pendente_login" && (
          <>
            <h1 className="mt-4 text-lg font-semibold">Você foi convidado(a)! 💙</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Crie sua conta com o e-mail <strong>{estado.email}</strong> para entrar no orçamento
              da família.
            </p>
            <div className="mt-5 flex flex-col gap-2">
              <Button asChild>
                <a href="/auth?modo=signup">Criar minha conta</a>
              </Button>
              <Button asChild variant="outline">
                <a href="/auth?modo=login">Já tenho conta, entrar</a>
              </Button>
            </div>
          </>
        )}

        {estado.tipo === "aceito" && (
          <>
            <CheckCircle2 className="mx-auto mt-4 h-10 w-10 text-success" />
            <h1 className="mt-3 text-lg font-semibold">Pronto! Vocês já dividem o mesmo azul 💙</h1>
            <p className="mt-2 text-sm text-muted-foreground">Te levando para o painel…</p>
          </>
        )}

        {(estado.tipo === "invalido" || estado.tipo === "erro") && (
          <>
            <AlertTriangle className="mx-auto mt-4 h-10 w-10 text-warning" />
            <h1 className="mt-3 text-lg font-semibold">Não foi possível usar este convite</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {estado.tipo === "invalido" ? estado.motivo : estado.mensagem}
            </p>
            <Button asChild className="mt-5">
              <Link to="/auth">Ir para o login</Link>
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
