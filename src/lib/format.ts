export const formatBRL = (valor: number) =>
  valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  });

export const formatPct = (valor: number) =>
  `${valor.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}%`;
