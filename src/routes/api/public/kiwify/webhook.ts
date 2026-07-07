// Endpoint público para webhooks da Kiwify.
// Configure o segredo em KIWIFY_WEBHOOK_SECRET e aponte a Kiwify para:
//   https://SEU-DOMINIO/api/public/kiwify/webhook
//
// A Kiwify envia o header X-Kiwify-Secret com o segredo configurado no dashboard.

import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { timingSafeEqual } from "crypto";

const schema = z.object({
  event: z.string(),
  data: z.record(z.unknown()),
});

function safeEqual(a: string, b: string) {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ba.length !== bb.length) return false;
  return timingSafeEqual(ba, bb);
}

export const Route = createFileRoute("/api/public/kiwify/webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const secret = process.env.KIWIFY_WEBHOOK_SECRET;
        if (!secret) return new Response("Not configured", { status: 500 });

        const provided = request.headers.get("x-kiwify-secret") ?? "";
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

        const { event, data } = parsed.data;

        // TODO: persistir/processar o evento no Supabase conforme a necessidade do negócio.
        // Exemplo:
        //   const { createClient } = await import("@supabase/supabase-js");
        //   const supabaseAdmin = createClient(
        //     process.env.SUPABASE_URL!,
        //     process.env.SUPABASE_SERVICE_ROLE_KEY!,
        //     { auth: { storage: undefined, persistSession: false, autoRefreshToken: false } }
        //   );
        //   await supabaseAdmin.from("kiwify_events").insert({ event, payload: data });

        return Response.json({ ok: true, event });
      },
    },
  },
});
