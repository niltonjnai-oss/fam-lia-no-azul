// Motor do assistente "Entenda sua dívida": taxa implícita de um parcelamento
// (sistema Price, resolvida por busca binária) e simulação de pagamento de um
// saldo com juros mensais. Tudo em decimal (0.05 = 5% a.m.).

/** Valor presente de `n` parcelas de `parcela` à taxa mensal `i`. */
function valorPresente(parcela: number, n: number, i: number): number {
  if (i <= 0) return parcela * n;
  return (parcela * (1 - Math.pow(1 + i, -n))) / i;
}

/**
 * Taxa mensal embutida num parcelamento: quanto custava à vista vs
 * "n x de R$ parcela". Retorna 0 se não há juros (total <= à vista)
 * e null se os dados não fecham (ex.: parcela impossível de cobrir).
 */
export function taxaImplicita(
  valorVista: number,
  parcela: number,
  n: number,
): number | null {
  if (valorVista <= 0 || parcela <= 0 || n <= 0) return null;
  if (parcela * n <= valorVista + 0.005) return 0;

  let lo = 1e-7;
  let hi = 10; // 1000% a.m. — teto de segurança
  if (valorPresente(parcela, n, hi) > valorVista) return null;

  for (let iter = 0; iter < 200; iter++) {
    const mid = (lo + hi) / 2;
    if (valorPresente(parcela, n, mid) > valorVista) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

export interface ResultadoPagamento {
  meses: number;
  totalPago: number;
  totalJuros: number;
}

/**
 * Simula pagar `pagamento`/mês sobre um `saldo` que rende `taxaMes` de juros.
 * Retorna null quando o pagamento não vence os juros (dívida nunca zera).
 */
export function simularPagamento(
  saldo: number,
  taxaMes: number,
  pagamento: number,
): ResultadoPagamento | null {
  if (saldo <= 0 || pagamento <= 0) return null;
  let s = saldo;
  let totalJuros = 0;
  let totalPago = 0;
  for (let mes = 1; mes <= 600; mes++) {
    const juros = s * Math.max(0, taxaMes);
    s += juros;
    totalJuros += juros;
    const pago = Math.min(pagamento, s);
    s -= pago;
    totalPago += pago;
    if (s <= 0.005) return { meses: mes, totalPago, totalJuros };
  }
  return null;
}

export type FaixaTaxa = "baixa" | "media" | "alta";

/** Faixas de referência para juros mensais no crédito pessoal brasileiro. */
export function classificarTaxa(taxaMes: number): FaixaTaxa {
  if (taxaMes <= 0.02) return "baixa";
  if (taxaMes <= 0.05) return "media";
  return "alta";
}

export const FAIXA_INFO: Record<
  FaixaTaxa,
  { emoji: string; rotulo: string; conselho: string }
> = {
  baixa: {
    emoji: "🟢",
    rotulo: "Juros baixos",
    conselho: "Taxa razoável para o crédito no Brasil. Dá para manter o plano.",
  },
  media: {
    emoji: "🟡",
    rotulo: "Juros medianos",
    conselho:
      "Dá para pagar, mas vale pesquisar: um empréstimo mais barato pode substituir essa dívida.",
  },
  alta: {
    emoji: "🔴",
    rotulo: "Juros caros",
    conselho:
      "Essa dívida cresce rápido. Priorize quitar ou renegociar antes das outras.",
  },
};
