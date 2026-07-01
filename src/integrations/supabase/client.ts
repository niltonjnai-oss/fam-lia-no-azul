// Supabase client — BYO project (não usa Lovable Cloud).
// As variáveis são injetadas no build via vite.config.ts:
//   - VITE_SUPABASE_URL ou APP_SUPABASE_URL → URL pública do projeto
//   - VITE_SUPABASE_PUBLISHABLE_KEY / VITE_SUPABASE_ANON_KEY ou APP_SUPABASE_PUBLISHABLE_KEY
//
// Schema ainda não foi modelado: este client está pronto para uso
// assim que tabelas, policies e GRANTs forem criados via migration.

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = (
  (import.meta.env.VITE_SUPABASE_URL as string | undefined) ??
  (import.meta.env.APP_SUPABASE_URL as string | undefined) ??
  ""
).trim();
const SUPABASE_PUBLISHABLE_KEY = (
  (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined) ??
  (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined) ??
  (import.meta.env.APP_SUPABASE_PUBLISHABLE_KEY as string | undefined) ??
  ""
)
  .trim()
  .replace(/^Bearer\s+/i, "")
  .replace(/^['\"]|['\"]$/g, "");

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_PUBLISHABLE_KEY);

if (!isSupabaseConfigured) {
  // Não derruba o app — apenas avisa em dev.
  // eslint-disable-next-line no-console
  console.warn(
    "[supabase] Configuração ausente. Verifique APP_SUPABASE_URL e APP_SUPABASE_PUBLISHABLE_KEY.",
  );
}

const createDisabledSupabaseClient = () => {
  throw new Error(
    "Supabase não configurado. Configure APP_SUPABASE_URL e APP_SUPABASE_PUBLISHABLE_KEY.",
  );
};

export const supabase = isSupabaseConfigured
  ? createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : new Proxy(
      {},
      {
        get: createDisabledSupabaseClient,
      },
    ) as ReturnType<typeof createClient>;
