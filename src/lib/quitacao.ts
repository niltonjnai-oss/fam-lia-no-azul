// Motor do Plano de Liberdade: simula a quitação das dívidas ativas mês a mês
// pelo método avalanche (maior juro primeiro), mantendo o comprometimento
// mensal constante — quando uma dívida quita, a parcela dela "rola" para a
// próxima da fila (bola de neve do valor liberado).

import type { Divida } from "@/lib/db";

export interface DividaNoPlano {
  id: string;
  nome: string;
  /** Mês (1-based, contado a partir do próximo mês) em que a dívida zera. */
  mesQuitacao: number;
  dataQuitacao: Date;
}

export interface PlanoQuitacao {
  /** Meses até zerar todas as dívidas ativas. */
  meses: number;
  dataLiberdade: Date;
  ordem: DividaNoPlano[];
  totalJurosPagos: number;
  /** Comprometimento mensal usado na simulação (parcelas + aporte extra). */
  pagamentoMensal: number;
}

const MAX_MESES = 600;

function addMeses(base: Date, m: number): Date {
  return new Date(base.getFullYear(), base.getMonth() + m, 1);
}

/** Simula a quitação. Retorna null se não houver dívidas ativas.
 *  `inviavel: true` (plano ausente) quando o pagamento mensal não vence os
 *  juros — nesse caso `ordem` traz o que quitou antes de estagnar. */
export function simularQuitacao(
  dividas: Divida[],
  aporteExtra = 0,
): { plano: PlanoQuitacao | null; inviavel: boolean } {
  const ativas = dividas
    .filter((d) => d.status === "Ativa" && Number(d.valor_total) > 0)
    .map((d) => ({
      id: d.id,
      nome: d.nome,
      saldo: Number(d.valor_total),
      taxa: Number(d.taxa_juros_mensal),
      parcela: Number(d.parcela_mensal),
    }))
    // Avalanche: maior juro primeiro (empate: maior saldo primeiro).
    .sort((a, b) => b.taxa - a.taxa || b.saldo - a.saldo);

  if (ativas.length === 0) return { plano: null, inviavel: false };

  const pagamentoMensal = ativas.reduce((a, d) => a + d.parcela, 0) + aporteExtra;
  if (pagamentoMensal <= 0) return { plano: null, inviavel: true };

  const hoje = new Date();
  const ordem: DividaNoPlano[] = [];
  let totalJuros = 0;
  let restantes = ativas.map((d) => ({ ...d }));

  for (let mes = 1; mes <= MAX_MESES; mes++) {
    // 1) Juros do mês.
    for (const d of restantes) {
      const juros = d.saldo * d.taxa;
      d.saldo += juros;
      totalJuros += juros;
    }

    // 2) Paga a parcela mínima de cada uma (limitada ao saldo).
    let disponivel = pagamentoMensal;
    for (const d of restantes) {
      const pago = Math.min(d.parcela, d.saldo, disponivel);
      d.saldo -= pago;
      disponivel -= pago;
    }

    // 3) O que sobrou ataca a prioridade (maior juro), em cascata.
    for (const d of restantes) {
      if (disponivel <= 0) break;
      const pago = Math.min(d.saldo, disponivel);
      d.saldo -= pago;
      disponivel -= pago;
    }

    // 4) Registra quitações do mês.
    for (const d of restantes) {
      if (d.saldo <= 0.005) {
        ordem.push({ id: d.id, nome: d.nome, mesQuitacao: mes, dataQuitacao: addMeses(hoje, mes) });
      }
    }
    restantes = restantes.filter((d) => d.saldo > 0.005);

    if (restantes.length === 0) {
      return {
        plano: {
          meses: mes,
          dataLiberdade: addMeses(hoje, mes),
          ordem,
          totalJurosPagos: totalJuros,
          pagamentoMensal,
        },
        inviavel: false,
      };
    }
  }

  // Não zerou em 50 anos: os juros vencem o pagamento.
  return { plano: null, inviavel: true };
}

const MESES_CURTO = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

export function formatMesAno(d: Date): string {
  return `${MESES_CURTO[d.getMonth()]}/${d.getFullYear()}`;
}
