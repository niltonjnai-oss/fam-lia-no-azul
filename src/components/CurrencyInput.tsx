import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";

interface CurrencyInputProps {
  value: string;
  onChange: (raw: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  className?: string;
  id?: string;
  label?: string;
}

function formatCurrencyDisplay(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  const num = Number(digits) || 0;
  return num.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
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

  const displayValue = focused ? value : formatCurrencyDisplay(value);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value.replace(/\D/g, "");
      onChange(raw);
    },
    [onChange]
  );

  const handleFocus = useCallback(() => {
    setFocused(true);
  }, []);

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
        inputMode="numeric"
        value={displayValue}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={placeholder}
        className={cn(
          "tabular mt-1 w-full rounded-xl border-2 border-primary/30 bg-background px-4 py-3 text-lg font-semibold outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20",
          className
        )}
      />
    </label>
  );
}
