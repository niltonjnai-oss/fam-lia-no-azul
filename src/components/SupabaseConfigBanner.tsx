import { supabaseConfigIssues, isSupabaseConfigured } from "../integrations/supabase/client";

export function SupabaseConfigBanner() {
  if (isSupabaseConfigured) return null;

  return (
    <div className="fixed inset-x-0 top-0 z-[100] border-b border-amber-500/40 bg-amber-50 text-amber-900 shadow-lg dark:bg-amber-950 dark:text-amber-100">
      <div className="mx-auto max-w-4xl px-4 py-3 text-sm">
        <p className="font-semibold">⚠️ Configuração pendente</p>
        <p className="mt-1 opacity-90">
          Este ambiente ainda não recebeu as variáveis de ambiente do Supabase.
          Assim que forem preenchidas, o app volta a autenticar e carregar dados normalmente.
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
