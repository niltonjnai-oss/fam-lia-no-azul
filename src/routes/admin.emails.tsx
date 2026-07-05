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
  const [testing, setTesting] = useState(false);
  const [testStatus, setTestStatus] = useState<string | null>(null);

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

  async function handleTestToMe() {
    setTesting(true);
    setTestStatus(null);
    try {
      const { data: sess } = await supabase.auth.getSession();
      const token = sess.session?.access_token;
      const email = sess.session?.user?.email;
      if (!token || !email) throw new Error("Sessão expirada");

      const nomeTeste = nome || email.split("@")[0];
      let payload: Record<string, unknown>;
      if (template === "marketing-generico") {
        payload = {
          template,
          to: email,
          titulo: titulo || "[TESTE] Assunto de exemplo",
          corpoHtml:
            corpoHtml ||
            "<p>Este é um <strong>email de teste</strong> do template marketing.</p><p>Se você recebeu, o envio está funcionando ✅</p>",
          ctaTexto: ctaTexto || "Acessar plataforma",
          ctaUrl: ctaUrl || "https://educarbem.com.br",
        };
      } else {
        payload = { template, to: email, nome: nomeTeste };
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
      if (!res.ok)
        throw new Error(json.error ? JSON.stringify(json.error) : `HTTP ${res.status}`);
      setTestStatus(`✅ Teste enviado para ${email} (id: ${json.id || "—"})`);
    } catch (err) {
      setTestStatus(`❌ ${err instanceof Error ? err.message : "Falha"}`);
    } finally {
      setTesting(false);
    }
  }
  }

  if (loading) return <div className="p-8">Carregando…</div>;
  if (!user) return <Navigate to="/auth" />;
  if (!isAdmin)
    return <div className="p-8 text-red-600">Acesso restrito a administradores.</div>;

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

      <section className="mt-6 rounded-lg border border-blue-200 bg-blue-50 p-6">
        <h2 className="mb-2 text-lg font-semibold">Enviar teste para mim</h2>
        <p className="mb-3 text-sm text-slate-600">
          Dispara o template <strong>{template}</strong> para o email da sua conta
          admin, usando os campos preenchidos acima (ou valores de exemplo).
        </p>
        <button
          type="button"
          onClick={handleTestToMe}
          disabled={testing}
          className="rounded bg-blue-700 px-4 py-2 font-medium text-white disabled:opacity-50"
        >
          {testing ? "Enviando teste…" : "🧪 Enviar teste para mim"}
        </button>
        {testStatus && <div className="pt-3 text-sm">{testStatus}</div>}
      </section>

      <section className="mt-8 rounded-lg border p-6">
        <h2 className="mb-3 text-lg font-semibold">Pré-visualização</h2>
        <div className="mb-3 rounded bg-slate-50 px-3 py-2 text-sm">
          <span className="font-medium text-slate-500">Assunto: </span>
          <span>{preview.subject || <em className="text-slate-400">(vazio)</em>}</span>
        </div>
        <iframe
          title="Pré-visualização do email"
          srcDoc={preview.html}
          sandbox=""
          className="h-[600px] w-full rounded border bg-white"
        />
        <p className="mt-2 text-xs text-slate-500">
          Renderização local — nada é enviado até você clicar em <strong>Enviar</strong>.
        </p>
      </section>
    </div>
  );
}

