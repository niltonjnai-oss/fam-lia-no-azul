// Endpoint autenticado: o titular convida o cônjuge por e-mail (Modo Casal).
// Cria o convite via RPC (limite de 2 membros, valida duplicidade) e dispara
// o e-mail de convite. Igual em espírito a /api/emails/send: usuário logado,
// sem exigir role admin (qualquer titular pode convidar seu próprio cônjuge).

import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { conviteFamilia } from "@/lib/emails/templates";
import { sendEmail } from "@/lib/emails/send.server";

const schema = z.object({ email: z.string().email() });

const APP_URL = "https://azul.educarbem.com.br";

export const Route = createFileRoute("/api/familia/convidar")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const auth = request.headers.get("Authorization");
        const token = auth?.replace(/^Bearer\s+/i, "");
        if (!token) return new Response("Unauthorized", { status: 401 });

        const supabase = createClient(
          process.env.SUPABASE_URL ??
            process.env.VITE_SUPABASE_URL ??
            process.env.APP_SUPABASE_URL ??
            "",
          process.env.SUPABASE_PUBLISHABLE_KEY ??
            process.env.VITE_SUPABASE_PUBLISHABLE_KEY ??
            process.env.VITE_SUPABASE_ANON_KEY ??
            process.env.APP_SUPABASE_PUBLISHABLE_KEY ??
            "",
          {
            auth: { persistSession: false, autoRefreshToken: false },
            global: { headers: { Authorization: `Bearer ${token}` } },
          },
        );

        const { data: userRes, error: userErr } = await supabase.auth.getUser(token);
        if (userErr || !userRes.user) {
          return new Response("Unauthorized", { status: 401 });
        }

        let body: unknown;
        try {
          body = await request.json();
        } catch {
          return new Response("Invalid JSON", { status: 400 });
        }
        const parsed = schema.safeParse(body);
        if (!parsed.success) {
          return Response.json({ error: parsed.error.flatten() }, { status: 400 });
        }

        const { data: convite, error: rpcErr } = await supabase.rpc("criar_convite_familia", {
          p_email: parsed.data.email,
        });
        if (rpcErr) {
          return Response.json({ error: rpcErr.message }, { status: 500 });
        }
        const resultado = convite as { token?: string; error?: string };
        if (resultado.error || !resultado.token) {
          return Response.json({ error: resultado.error ?? "Falha ao criar convite" }, { status: 400 });
        }

        const nomeConvidante =
          (userRes.user.user_metadata as { full_name?: string } | null)?.full_name ?? undefined;

        try {
          const t = conviteFamilia({
            nomeConvidante,
            link: `${APP_URL}/convite/${resultado.token}`,
          });
          await sendEmail({ to: parsed.data.email, ...t });
        } catch (e) {
          // O convite já foi criado no banco; o e-mail é melhor-esforço.
          console.error("[familia/convidar] falha ao enviar e-mail", e);
          return Response.json({ ok: true, emailEnviado: false });
        }

        return Response.json({ ok: true, emailEnviado: true });
      },
    },
  },
});
