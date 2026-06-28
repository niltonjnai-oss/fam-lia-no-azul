// Supabase client — BYO project (não usa Lovable Cloud).
// As variáveis são injetadas no build via vite.config.ts:
//   - APP_SUPABASE_URL          → URL pública do projeto
//   - APP_SUPABASE_PUBLISHABLE_KEY → anon/public key (segura no browser, protegida por RLS)
//
// Schema ainda não foi modelado: este client está pronto para uso
// assim que tabelas, policies e GRANTs forem criados via migration.

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.APP_SUPABASE_URL as string;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.APP_SUPABASE_PUBLISHABLE_KEY as string;

if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
  // Não derruba o app — apenas avisa em dev.
  // eslint-disable-next-line no-console
  console.warn(
    "[supabase] Configuração ausente. Verifique APP_SUPABASE_URL e APP_SUPABASE_PUBLISHABLE_KEY.",
  );
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
