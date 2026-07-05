import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { useIsAdmin } from "@/lib/use-is-admin";
import {
  onboardingDia1,
  lembreteSemanal,
  marketingGenerico,
} from "@/lib/emails/templates";

export const Route = createFileRoute("/admin/emails")({
  head: () => ({
    meta: [
      { title: "Admin • Emails • Família no Azul" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: AdminEmailsPage,
});

type Template = "onboarding-dia-1" | "lembrete-semanal" | "marketing-generico";

function AdminEmailsPage() {
  const { user, loading } = useAuth();
  const isAdmin = useIsAdmin();
  const [template, setTemplate] = useState<Template>("marketing-generico");
  const [to, setTo] = useState("");
  const [nome, setNome] = useState("");
  const [titulo, setTitulo] = useState("");
  const [corpoHtml, setCorpoHtml] = useState("");
  const [ctaTexto, setCtaTexto] = useState("");
  const [ctaUrl, setCtaUrl] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  if (loading) return <div className="p-8">Carregando…</div>;
  if (!user) return <Navigate to="/auth" />;
  if (!isAdmin)
    return <div className="p-8 text-red-600">Acesso restrito a administradores.</div>;

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    setStatus(null);
    try {
      const { data: sess } = await supabase.auth.getSession();
      const token = sess.session?.access_token;
      if (!token) throw new Error("Sessão expirada");

      const payload: Record<string, unknown> = { template, to };
      if (template === "marketing-generico") {
        Object.assign(payload, {
          to: to.includes(",") ? to.split(",").map((s) => s.trim()) : to,
          titulo,
          corpoHtml,
          ctaTexto: ctaTexto || undefined,
          ctaUrl: ctaUrl || undefined,
        });
      } else {
        payload.nome = nome || undefined;
      }

      const res = await fetch("/api/emails/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error ? JSON.stringify(json.error) : `HTTP ${res.status}`);
      setStatus(`✅ Enviado (id: ${json.id || "—"})`);
    } catch (err) {
      setStatus(`❌ ${err instanceof Error ? err.message : "Falha"}`);
    } finally {
      setSending(false);
    }
  }

  const preview = useMemo(() => {
    try {
      if (template === "onboarding-dia-1") return onboardingDia1({ nome });
      if (template === "lembrete-semanal") return lembreteSemanal({ nome });
      return marketingGenerico({
        titulo: titulo || "(sem título)",
        corpoHtml: corpoHtml || "<p><em>(corpo vazio)</em></p>",
        ctaTexto: ctaTexto || undefined,
        ctaUrl: ctaUrl || undefined,
      });
    } catch {
      return { subject: "", html: "" };
    }
  }, [template, nome, titulo, corpoHtml, ctaTexto, ctaUrl]);

  return (
    <div className="mx-auto max-w-3xl p-6">
      <h1 className="mb-2 text-2xl font-bold">Envio de Emails</h1>
      <p className="mb-6 text-sm text-slate-600">
        Emails de auth (confirmação, reset) continuam no Supabase. Aqui só marketing,
        onboarding, lembretes e notificações.
      </p>

      <form onSubmit={handleSend} className="space-y-4 rounded-lg border p-6">

        <label className="block">
          <span className="mb-1 block text-sm font-medium">Template</span>
          <select
            value={template}
            onChange={(e) => setTemplate(e.target.value as Template)}
            className="w-full rounded border px-3 py-2"
          >
            <option value="marketing-generico">Marketing genérico</option>
            <option value="onboarding-dia-1">Onboarding dia 1</option>
            <option value="lembrete-semanal">Lembrete semanal</option>
          </select>
        </label>

        <label className="block">
          <span className="mb-1 block text-sm font-medium">
            Destinatário{template === "marketing-generico" ? "s (separe por vírgula)" : ""}
          </span>
          <input
            type="text"
            required
            value={to}
            onChange={(e) => setTo(e.target.value)}
            placeholder="alguem@exemplo.com"
            className="w-full rounded border px-3 py-2"
          />
        </label>

        {template !== "marketing-generico" && (
          <label className="block">
            <span className="mb-1 block text-sm font-medium">Nome (opcional)</span>
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="w-full rounded border px-3 py-2"
            />
          </label>
        )}

        {template === "marketing-generico" && (
          <>
            <label className="block">
              <span className="mb-1 block text-sm font-medium">Título / assunto</span>
              <input
                type="text"
                required
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                className="w-full rounded border px-3 py-2"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-medium">Corpo (HTML)</span>
              <textarea
                required
                value={corpoHtml}
                onChange={(e) => setCorpoHtml(e.target.value)}
                rows={6}
                className="w-full rounded border px-3 py-2 font-mono text-sm"
                placeholder="<p>Olá,</p><p>Novidades da semana...</p>"
              />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="mb-1 block text-sm font-medium">CTA texto (opcional)</span>
                <input
                  type="text"
                  value={ctaTexto}
                  onChange={(e) => setCtaTexto(e.target.value)}
                  className="w-full rounded border px-3 py-2"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-sm font-medium">CTA URL (opcional)</span>
                <input
                  type="url"
                  value={ctaUrl}
                  onChange={(e) => setCtaUrl(e.target.value)}
                  className="w-full rounded border px-3 py-2"
                />
              </label>
            </div>
          </>
        )}

        <button
          type="submit"
          disabled={sending}
          className="rounded bg-blue-700 px-4 py-2 font-medium text-white disabled:opacity-50"
        >
          {sending ? "Enviando…" : "Enviar"}
        </button>

        {status && <div className="pt-2 text-sm">{status}</div>}
      </form>
    </div>
  );
}
