// Endpoint público para pg_cron do Supabase disparar emails agendados
// (lembretes semanais, drips de onboarding). Verificado por header secreto.
//
// Uso no pg_cron:
//   select net.http_post(
//     url := 'https://SEU-DOMINIO/api/public/emails/cron',
//     headers := jsonb_build_object(
//       'content-type','application/json',
//       'x-cron-secret', current_setting('app.email_cron_secret')
//     ),
//     body := jsonb_build_object('template','lembrete-semanal','to','user@ex.com','nome','Ana')
//   );

import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { timingSafeEqual } from "crypto";
import {
  onboardingDia1,
  lembreteSemanal,
} from "@/lib/emails/templates";
import { sendEmail } from "@/lib/emails/send.server";

const schema = z.object({
  template: z.enum(["onboarding-dia-1", "lembrete-semanal"]),
  to: z.string().email(),
  nome: z.string().optional(),
});

function safeEqual(a: string, b: string) {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ba.length !== bb.length) return false;
  return timingSafeEqual(ba, bb);
}

export const Route = createFileRoute("/api/public/emails/cron")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const secret = process.env.EMAIL_CRON_SECRET;
        if (!secret) return new Response("Not configured", { status: 500 });
        const provided = request.headers.get("x-cron-secret") ?? "";
        if (!safeEqual(provided, secret)) {
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

        const { template, to, nome } = parsed.data;
        try {
          const t =
            template === "onboarding-dia-1"
              ? onboardingDia1({ nome })
              : lembreteSemanal({ nome });
          const r = await sendEmail({ to, ...t });
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
