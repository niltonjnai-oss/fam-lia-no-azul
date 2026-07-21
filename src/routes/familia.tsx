// Modo Casal: mostra os membros da família (titular + cônjuge) e permite
// convidar por e-mail quando há vaga (máx. 2). O convite libera o cadastro
// do cônjuge sem precisar de compra própria — ver verificar_compra_kiwify.

import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Users, Mail, Loader2, Clock, Crown, Heart, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { PageTitle } from "@/components/PageTitle";
import { supabase } from "@/integrations/supabase/client";
import {
  fetchMinhaFamiliaMembros,
  fetchConvitesPendentes,
  cancelarConvite,
  removerMembro,
} from "@/lib/db";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/familia")({
  head: () => ({
    meta: [
      { title: "Modo Casal — Família no Azul" },
      {
        name: "description",
        content: "Convide seu cônjuge para acessar o mesmo orçamento da família.",
      },
    ],
  }),
  component: FamiliaPage,
});

const QK_MEMBROS = ["familia_membros"] as const;
const QK_CONVITES = ["convites_pendentes"] as const;

function FamiliaPage() {
  const { user } = useAuth();
  const membrosQ = useQuery({ queryKey: QK_MEMBROS, queryFn: fetchMinhaFamiliaMembros });
  const convitesQ = useQuery({ queryKey: QK_CONVITES, queryFn: fetchConvitesPendentes });
  const [email, setEmail] = useState("");
  const qc = useQueryClient();

  const membros = membrosQ.data ?? [];
  const convites = convitesQ.data ?? [];
  const vagas = 2 - membros.length - convites.length;
  const souTitular = membros.find((m) => m.user_id === user?.id)?.papel === "titular";

  const cancelar = useMutation({
    mutationFn: async (id: string) => {
      const r = await cancelarConvite(id);
      if ("error" in r) throw new Error(r.error);
    },
    onSuccess: () => {
      toast.success("Convite cancelado.");
      qc.invalidateQueries({ queryKey: QK_CONVITES });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Erro ao cancelar"),
  });

  const remover = useMutation({
    mutationFn: async (userId: string) => {
      const r = await removerMembro(userId);
      if ("error" in r) throw new Error(r.error);
    },
    onSuccess: () => {
      toast.success("Membro removido da família.");
      qc.invalidateQueries({ queryKey: QK_MEMBROS });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Erro ao remover"),
  });

  const convidar = useMutation({
    mutationFn: async () => {
      const { data: sess } = await supabase.auth.getSession();
      const token = sess.session?.access_token;
      if (!token) throw new Error("Sessão expirada");
      const res = await fetch("/api/familia/convidar", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ email }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error ? String(json.error) : `HTTP ${res.status}`);
      return json;
    },
    onSuccess: () => {
      toast.success(`Convite enviado para ${email}! 💙`);
      setEmail("");
      qc.invalidateQueries({ queryKey: QK_CONVITES });
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Erro ao enviar convite");
    },
  });

  return (
    <div className="space-y-5">
      <div>
        <PageTitle>Modo Casal</PageTitle>
        <p className="mt-1 text-sm text-muted-foreground">
          Cadastre seu cônjuge ou um familiar e gerenciem o orçamento juntos. Cada um terá seu próprio login, mantendo o controle completo das finanças em um único lugar.
        </p>
      </div>

      <section className="rounded-2xl border border-border bg-card p-5 shadow-soft">
        <h2 className="text-sm font-semibold">Quem está na família</h2>
        {membrosQ.isLoading ? (
          <div className="mt-3 space-y-2">
            <Skeleton className="h-12 w-full" />
          </div>
        ) : (
          <ul className="mt-3 space-y-2">
            {membros.map((m) => (
              <li
                key={m.user_id}
                className="flex items-center gap-3 rounded-xl border border-border bg-background p-3 text-sm"
              >
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                  {m.papel === "titular" ? (
                    <Crown className="h-4 w-4" />
                  ) : (
                    <Heart className="h-4 w-4" />
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-medium">
                    {m.nome || m.email}
                    {m.user_id === user?.id && (
                      <span className="ml-1.5 text-xs text-muted-foreground">(você)</span>
                    )}
                  </div>
                  <div className="truncate text-xs text-muted-foreground">
                    {m.papel === "titular" ? "Titular da assinatura" : "Cônjuge"}
                    {m.nome && ` · ${m.email}`}
                  </div>
                </div>
                {souTitular && m.papel === "conjuge" && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-danger hover:bg-danger/10 hover:text-danger"
                    disabled={remover.isPending}
                    onClick={() => {
                      if (confirm(`Remover ${m.nome || m.email} da família? Essa pessoa perde o acesso ao orçamento.`))
                        remover.mutate(m.user_id);
                    }}
                    aria-label="Remover membro"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </li>
            ))}
            {convites.map((c) => (
              <li
                key={c.id}
                className="flex items-center gap-3 rounded-xl border border-dashed border-warning/40 bg-warning/5 p-3 text-sm"
              >
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-warning/15 text-warning-foreground">
                  <Clock className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-medium">{c.email}</div>
                  <div className="text-xs text-muted-foreground">
                    Convite enviado — aguardando aceite
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-danger hover:bg-danger/10 hover:text-danger"
                  disabled={cancelar.isPending}
                  onClick={() => {
                    if (confirm(`Cancelar o convite para ${c.email}?`)) cancelar.mutate(c.id);
                  }}
                  aria-label="Cancelar convite"
                >
                  <X className="h-4 w-4" />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {vagas > 0 ? (
        <section className="rounded-2xl border border-primary/30 bg-primary/5 p-5 shadow-soft">
          <div className="flex items-center gap-2">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary text-primary-foreground">
              <Mail className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-sm font-semibold">Convidar seu cônjuge</h2>
              <p className="text-xs text-muted-foreground">
                Ele(a) recebe um e-mail para criar a conta — sem custo extra.
              </p>
            </div>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (email) convidar.mutate();
            }}
            className="mt-4 flex flex-col gap-2 sm:flex-row"
          >
            <div className="flex-1">
              <Label htmlFor="email-convite" className="sr-only">
                E-mail do cônjuge
              </Label>
              <Input
                id="email-convite"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@exemplo.com"
              />
            </div>
            <Button type="submit" disabled={!email || convidar.isPending}>
              {convidar.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Enviar convite
            </Button>
          </form>
        </section>
      ) : (
        <div className="flex items-center gap-2 rounded-xl bg-muted/50 p-4 text-sm text-muted-foreground">
          <Users className="h-4 w-4 shrink-0" />
          Sua família já tem os 2 membros do Modo Casal.
        </div>
      )}
    </div>
  );
}
