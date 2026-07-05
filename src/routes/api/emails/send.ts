// Endpoint autenticado para disparo de emails Lovable (marketing/notificações).
// NÃO envia emails de auth — esses continuam no Supabase.
// Autoriza: usuário logado + role 'admin' (via has_role).

import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import {
  onboardingDia1,
  lembreteSemanal,
  marketingGenerico,
} from "@/lib/emails/templates";
import { sendEmail } from "@/lib/emails/send.server";

const schema = z.discriminatedUnion("template", [
  z.object({
    template: z.literal("onboarding-dia-1"),
    to: z.string().email(),
    nome: z.string().optional(),
  }),
  z.object({
    template: z.literal("lembrete-semanal"),
    to: z.string().email(),
    nome: z.string().optional(),
  }),
  z.object({
    template: z.literal("marketing-generico"),
    to: z.union([z.string().email(), z.array(z.string().email()).min(1).max(500)]),
    titulo: z.string().min(1).max(200),
    corpoHtml: z.string().min(1),
    ctaTexto: z.string().optional(),
    ctaUrl: z.string().url().optional(),
  }),
]);

export const Route = createFileRoute("/api/emails/send")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const auth = request.headers.get("Authorization");
        const token = auth?.replace(/^Bearer\s+/i, "");
        if (!token) return new Response("Unauthorized", { status: 401 });

        const supabase = createClient(
          process.env.SUPABASE_URL ?? process.env.APP_SUPABASE_URL ?? "",
          process.env.SUPABASE_PUBLISHABLE_KEY ??
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

        const { data: isAdmin } = await supabase.rpc("has_role", {
          _user_id: userRes.user.id,
          _role: "admin",
        });
        if (!isAdmin) return new Response("Forbidden", { status: 403 });

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

        const input = parsed.data;
        try {
          if (input.template === "onboarding-dia-1") {
            const t = onboardingDia1({ nome: input.nome });
            const r = await sendEmail({ to: input.to, ...t });
            return Response.json({ ok: true, id: r.id });
          }
          if (input.template === "lembrete-semanal") {
            const t = lembreteSemanal({ nome: input.nome });
            const r = await sendEmail({ to: input.to, ...t });
            return Response.json({ ok: true, id: r.id });
          }
          const t = marketingGenerico({
            titulo: input.titulo,
            corpoHtml: input.corpoHtml,
            ctaTexto: input.ctaTexto,
            ctaUrl: input.ctaUrl,
          });
          const r = await sendEmail({ to: input.to, ...t });
          return Response.json({ ok: true, id: r.id });
        } catch (e) {
          return Response.json(
            { error: e instanceof Error ? e.message : "send failed" },
            { status: 502 },
          );
        }
      },
    },
  },
});
