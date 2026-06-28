import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { mesAtual } from "@/lib/db";

interface MesCtx {
  mes: string;
  setMes: (m: string) => void;
}

const Ctx = createContext<MesCtx | null>(null);

export function MesProvider({ children }: { children: ReactNode }) {
  const [mes, setMes] = useState<string>(() => mesAtual());
  const value = useMemo(() => ({ mes, setMes }), [mes]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useMes(): MesCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useMes deve ser usado dentro de <MesProvider>");
  return ctx;
}
