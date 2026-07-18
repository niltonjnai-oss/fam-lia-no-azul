// Supabase client — BYO project (não usa Lovable Cloud).
// As variáveis são injetadas no build via vite.config.ts:
//   - VITE_SUPABASE_URL ou APP_SUPABASE_URL → URL pública do projeto
//   - VITE_SUPABASE_PUBLISHABLE_KEY / VITE_SUPABASE_ANON_KEY ou APP_SUPABASE_PUBLISHABLE_KEY

import { createClient } from "@supabase/supabase-js";
import {
  PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  PUBLIC_SUPABASE_URL,
} from "./public-config";

function firstNonEmpty(...values: Array<string | undefined>): string {
  for (const value of values) {
    const trimmed = value?.trim();
    if (trimmed) return trimmed;
  }
  return "";
}

const SUPABASE_URL = firstNonEmpty(
  import.meta.env.VITE_SUPABASE_URL as string | undefined,
  import.meta.env.APP_SUPABASE_URL as string | undefined,
  PUBLIC_SUPABASE_URL,
);
const SUPABASE_PUBLISHABLE_KEY = firstNonEmpty(
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined,
  import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined,
  import.meta.env.APP_SUPABASE_PUBLISHABLE_KEY as string | undefined,
  PUBLIC_SUPABASE_PUBLISHABLE_KEY,
)
  .trim()
  .replace(/^Bearer\s+/i, "")
  .replace(/^['\"]|['\"]$/g, "");

export type SupabaseConfigIssue = {
  variable: string;
  reason: string;
};

// Trava de segurança: uma chave SECRETA (service_role JWT ou sb_secret_...) dá
// acesso de administrador e ignora o RLS — jamais pode ir ao navegador. Se uma
// variável de ambiente for mal configurada com esse tipo de chave (em qualquer
// ambiente), a detecção abaixo derruba o cliente com erro claro em vez de
// vazá-la. Só retorna true quando IDENTIFICA POSITIVAMENTE uma chave secreta —
// chaves publishable/anon e qualquer valor indecifrável passam (fail-open),
// pra nunca bloquear um login legítimo por engano.
function decodeJwtRole(jwt: string): string | null {
  const parts = jwt.split(".");
  if (parts.length !== 3) return null;
  try {
    const b64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const json =
      typeof atob === "function"
        ? decodeURIComponent(
            atob(b64)
              .split("")
              .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
              .join(""),
          )
        : Buffer.from(b64, "base64").toString("utf-8");
    const payload = JSON.parse(json) as { role?: unknown };
    return typeof payload.role === "string" ? payload.role : null;
  } catch {
    return null;
  }
}

function isSecretKey(key: string): boolean {
  if (/^sb_secret_/i.test(key)) return true;
  return decodeJwtRole(key) === "service_role";
}

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
  } else if (isSecretKey(SUPABASE_PUBLISHABLE_KEY)) {
    issues.push({
      variable: "VITE_SUPABASE_PUBLISHABLE_KEY",
      reason:
        "CRÍTICO: esta é uma chave SECRETA (service_role / sb_secret). Ela dá acesso de administrador e NUNCA pode ir ao navegador. Substitua pela publishable/anon key (sb_publishable_... ou JWT com role anon).",
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
