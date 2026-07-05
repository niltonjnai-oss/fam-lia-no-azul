// Supabase client — BYO project (não usa Lovable Cloud).
// As variáveis são injetadas no build via vite.config.ts:
//   - VITE_SUPABASE_URL ou APP_SUPABASE_URL → URL pública do projeto
//   - VITE_SUPABASE_PUBLISHABLE_KEY / VITE_SUPABASE_ANON_KEY ou APP_SUPABASE_PUBLISHABLE_KEY

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

export type SupabaseConfigIssue = {
  variable: string;
  reason: string;
};

function validateSupabaseConfig(): SupabaseConfigIssue[] {
  const issues: SupabaseConfigIssue[] = [];

  if (!SUPABASE_URL) {
    issues.push({
      variable: "VITE_SUPABASE_URL",
      reason: "Variável ausente. Defina a URL pública do projeto Supabase (ex.: https://xxxx.supabase.co).",
    });
  } else {
    try {
      const url = new URL(SUPABASE_URL);
      if (url.protocol !== "https:") {
        issues.push({
          variable: "VITE_SUPABASE_URL",
          reason: `Protocolo inválido (${url.protocol}). Use https://.`,
        });
      } else if (!/supabase\.(co|in|net)$/i.test(url.hostname) && !url.hostname.endsWith("localhost")) {
        issues.push({
          variable: "VITE_SUPABASE_URL",
          reason: `Host não parece ser do Supabase: ${url.hostname}.`,
        });
      }
    } catch {
      issues.push({
        variable: "VITE_SUPABASE_URL",
        reason: `Valor não é uma URL válida: "${SUPABASE_URL}".`,
      });
    }
  }

  if (!SUPABASE_PUBLISHABLE_KEY) {
    issues.push({
      variable: "VITE_SUPABASE_PUBLISHABLE_KEY",
      reason: "Variável ausente. Cole a publishable/anon key do projeto Supabase.",
    });
  } else {
    const isJwt = SUPABASE_PUBLISHABLE_KEY.split(".").length === 3;
    const isNewKey = /^sb_(publishable|secret)_/i.test(SUPABASE_PUBLISHABLE_KEY);
    if (!isJwt && !isNewKey) {
      issues.push({
        variable: "VITE_SUPABASE_PUBLISHABLE_KEY",
        reason: "Formato inválido. Esperado JWT (3 partes separadas por ponto) ou chave sb_publishable_...",
      });
    } else if (SUPABASE_PUBLISHABLE_KEY.length < 40) {
      issues.push({
        variable: "VITE_SUPABASE_PUBLISHABLE_KEY",
        reason: "Chave muito curta — provavelmente truncada.",
      });
    }
  }

  return issues;
}

export const supabaseConfigIssues = validateSupabaseConfig();
export const isSupabaseConfigured = supabaseConfigIssues.length === 0;

if (!isSupabaseConfigured) {
  // eslint-disable-next-line no-console
  console.error(
    "[supabase] Configuração inválida:\n" +
      supabaseConfigIssues.map((i) => `  • ${i.variable}: ${i.reason}`).join("\n"),
  );
}

const createDisabledSupabaseClient = () => {
  throw new Error(
    "Supabase não configurado. Verifique VITE_SUPABASE_URL e VITE_SUPABASE_PUBLISHABLE_KEY.",
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
  : (new Proxy(
      {},
      {
        get: createDisabledSupabaseClient,
      },
    ) as ReturnType<typeof createClient>);
