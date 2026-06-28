import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMes } from "@/lib/mes-context";
import { formatMes, shiftMes } from "@/lib/db";

export function MesSelector() {
  const { mes, setMes } = useMes();
  return (
    <div className="flex items-center justify-between rounded-2xl border border-border bg-card p-2 shadow-soft">
      <button
        onClick={() => setMes(shiftMes(mes, -1))}
        className="grid h-10 w-10 place-items-center rounded-xl hover:bg-muted"
        aria-label="Mês anterior"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <div className="tabular text-sm font-semibold sm:text-base">
        {formatMes(mes)}
      </div>
      <button
        onClick={() => setMes(shiftMes(mes, 1))}
        className="grid h-10 w-10 place-items-center rounded-xl hover:bg-muted"
        aria-label="Próximo mês"
      >
        <ChevronRight className="h-5 w-5" />
      </button>
    </div>
  );
}
