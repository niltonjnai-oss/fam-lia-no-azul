// Mock isolado da assinatura do próprio app "Família no Azul".
// Substituir por fetcher real (Kiwify + Supabase) quando o schema existir.

export type StatusAssinaturaApp = "ativa" | "expirando" | "expirada";

export interface AssinaturaApp {
  plano: string;
  dataCompra: string; // ISO
  dataVencimento: string; // ISO
}

// Simula: comprou há ~2 meses, vence em ~10 meses.
const hoje = new Date();
const compra = new Date(hoje);
compra.setMonth(compra.getMonth() - 2);
const vencimento = new Date(compra);
vencimento.setDate(vencimento.getDate() + 365);

export const assinaturaAppMock: AssinaturaApp = {
  plano: "Anual",
  dataCompra: compra.toISOString(),
  dataVencimento: vencimento.toISOString(),
};

export function diasRestantes(dataVencimento: string): number {
  const ms = new Date(dataVencimento).getTime() - Date.now();
  return Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)));
}

export function progressoAno(dataCompra: string, dataVencimento: string): number {
  const ini = new Date(dataCompra).getTime();
  const fim = new Date(dataVencimento).getTime();
  const agora = Date.now();
  if (fim <= ini) return 0;
  return Math.min(1, Math.max(0, (agora - ini) / (fim - ini)));
}

export function statusAssinatura(dataVencimento: string): StatusAssinaturaApp {
  const dias = diasRestantes(dataVencimento);
  if (dias <= 0) return "expirada";
  if (dias <= 30) return "expirando";
  return "ativa";
}

export const indicacaoMock = {
  desconto: "10% off",
};

export function linkIndicacao(): string {
  return "https://familianoazul.com.br/indicacao/AMIGO123";
}

export function formatDataBR(iso: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(iso));
}
