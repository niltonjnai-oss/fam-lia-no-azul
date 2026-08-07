// Em que fatura uma compra no crédito cai.
//
// Não existe norma do Banco Central sobre o intervalo entre fechamento e
// vencimento: é contrato entre banco e cliente, e na prática varia de 5 a 10
// dias por emissor. Por isso os DOIS dias são cadastrados - deduzir um a
// partir do outro erraria em boa parte dos cartões.
//
// A mecânica, essa sim, é igual em todo lugar: compra até o fechamento entra
// na fatura que vence em seguida; compra depois do fechamento vai pra
// próxima. É daí que sai o "melhor dia de compra".
//
// O que NÃO é modelado: fim de semana e feriado deslocando datas. Cada
// emissor faz diferente (uns antecipam, outros empurram), e chutar daria
// falsa precisão - por isso a data calculada continua editável na tela.

const pad = (n: number) => String(n).padStart(2, "0");

/** Último dia do mês (mes de 1 a 12). O dia 0 do mês seguinte é ele. */
function ultimoDia(ano: number, mes: number): number {
  return new Date(ano, mes, 0).getDate();
}

/** Dia do mês existente: cartão que fecha dia 31 fecha dia 28 em fevereiro. */
function diaValido(ano: number, mes: number, dia: number): number {
  return Math.min(dia, ultimoDia(ano, mes));
}

export interface Fatura {
  /** Data (YYYY-MM-DD) em que a fatura da compra fecha. */
  fechamento: string;
  /** Data (YYYY-MM-DD) em que essa fatura vence. */
  vencimento: string;
  /** Mês do orçamento em que o gasto entra ("YYYY-MM") = mês do vencimento. */
  mesRef: string;
}

/**
 * Fatura em que cai uma compra feita em `dataCompra` (YYYY-MM-DD).
 *
 * Exemplo do cartão que fecha dia 2 e vence dia 9:
 *   compra 01/08 (até o fechamento) → fecha 02/08, vence 09/08
 *   compra 05/08 (depois)           → fecha 02/09, vence 09/09
 *
 * E o caso que quebra a conta ingênua - cartão que fecha dia 28 e vence dia
 * 5: como o vencimento é um número MENOR que o fechamento, ele cai sempre no
 * mês seguinte ao do fechamento (compra 20/08 → fecha 28/08, vence 05/09).
 */
export function faturaDaCompra(
  dataCompra: string,
  diaFechamento: number,
  diaVencimento: number,
): Fatura {
  const [ano, mes, dia] = dataCompra.split("-").map(Number);

  // 1. Qual fatura recebe a compra: a que fecha neste mês ou a do mês que vem.
  let fAno = ano;
  let fMes = mes;
  if (dia > diaValido(ano, mes, diaFechamento)) {
    fMes += 1;
    if (fMes > 12) {
      fMes = 1;
      fAno += 1;
    }
  }

  // 2. Quando essa fatura vence. Dia de vencimento maior que o de fechamento
  //    = vence no mesmo mês em que fechou; menor ou igual = no mês seguinte.
  let vAno = fAno;
  let vMes = fMes;
  if (diaVencimento <= diaFechamento) {
    vMes += 1;
    if (vMes > 12) {
      vMes = 1;
      vAno += 1;
    }
  }

  return {
    fechamento: `${fAno}-${pad(fMes)}-${pad(diaValido(fAno, fMes, diaFechamento))}`,
    vencimento: `${vAno}-${pad(vMes)}-${pad(diaValido(vAno, vMes, diaVencimento))}`,
    mesRef: `${vAno}-${pad(vMes)}`,
  };
}

/** Vencimento cai em sábado ou domingo? A cobrança costuma andar pro dia
 *  útil seguinte, mas cada banco faz de um jeito - serve só pra avisar. */
export function venceEmFimDeSemana(dataISO: string): boolean {
  const [a, m, d] = dataISO.split("-").map(Number);
  const dow = new Date(a, m - 1, d).getDay();
  return dow === 0 || dow === 6;
}
