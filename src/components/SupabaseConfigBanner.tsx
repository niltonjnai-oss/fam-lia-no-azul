import { supabaseConfigIssues, isSupabaseConfigured } from "../integrations/supabase/client";

export function SupabaseConfigBanner() {
  if (isSupabaseConfigured) return null;

  return (
    <div className="fixed inset-x-0 top-0 z-[100] border-b border-destructive/40 bg-destructive text-destructive-foreground shadow-lg">
      <div className="mx-auto max-w-4xl px-4 py-3 text-sm">
        <p className="font-semibold">⚠️ Supabase não está configurado</p>
        <p className="mt-1 opacity-90">
          O app não conseguirá autenticar nem ler dados até que as variáveis de ambiente sejam definidas.
        </p>
        <ul className="mt-2 space-y-1 font-mono text-xs">
          {supabaseConfigIssues.map((issue) => (
            <li key={issue.variable}>
              <span className="font-semibold">{issue.variable}</span>: {issue.reason}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
