import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { formatBRL } from "@/lib/format";

interface CurrencyInputProps {
  /** Valor canônico em decimal (ex.: "5700" ou "5700.5"). */
  value: string;
  /** Recebe sempre a string canônica em decimal (ponto). */
  onChange: (canonical: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  className?: string;
  id?: string;
  label?: string;
}

/**
 * Converte texto digitado pela pessoa (pt-BR ou en) para string canônica em
 * decimal (ex.: "1234.5"). Aceita "1.234,56", "1234,56", "1234.56", "1234,5".
 */
function parseUserInput(text: string): string {
  const cleaned = text.replace(/[^\d.,]/g, "");
  if (!cleaned) return "";

  if (cleaned.includes(",")) {
    // Vírgula = decimal; pontos = separador de milhar.
    const sem = cleaned.replace(/\./g, "").replace(",", ".");
    const n = Number(sem);
    return Number.isFinite(n) ? String(n) : "";
  }

  // Só pontos: heurística — 1 ponto com 1-2 dígitos finais = decimal; resto = milhar.
  const parts = cleaned.split(".");
  if (parts.length === 2 && parts[1].length > 0 && parts[1].length <= 2) {
    const n = Number(cleaned);
    return Number.isFinite(n) ? String(n) : "";
  }
  const semPontos = cleaned.replace(/\./g, "");
  const n = Number(semPontos);
  return Number.isFinite(n) ? String(n) : "";
}

/** Formato de edição: número em pt-BR sem separador de milhar (ex.: "1234,5"). */
function formatForEdit(value: string): string {
  const n = Number(value);
  if (!Number.isFinite(n) || n === 0) return "";
  return String(n).replace(".", ",");
}

export function CurrencyInput({
  value,
  onChange,
  onBlur,
  placeholder = "R$ 0,00",
  className,
  id,
  label,
}: CurrencyInputProps) {
  const [focused, setFocused] = useState(false);
  const [local, setLocal] = useState("");

  const numValue = Number(value) || 0;
  const display = focused ? local : formatBRL(numValue);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const text = e.target.value;
      setLocal(text);
      const canonical = parseUserInput(text);
      onChange(canonical);
    },
    [onChange],
  );

  const handleFocus = useCallback(() => {
    setFocused(true);
    setLocal(formatForEdit(value));
  }, [value]);

  const handleBlur = useCallback(() => {
    setFocused(false);
    onBlur?.();
  }, [onBlur]);

  return (
    <label className="block">
      {label && (
        <span className="block text-xs font-medium text-muted-foreground">
          {label}
        </span>
      )}
      <input
        id={id}
        type="text"
        inputMode="decimal"
        value={display}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={placeholder}
        className={cn(
          "tabular mt-1 w-full rounded-xl border-2 border-primary/30 bg-background px-4 py-3 text-lg font-semibold outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20",
          className,
        )}
      />
    </label>
  );
}
