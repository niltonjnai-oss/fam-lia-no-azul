// Parsers de extrato bancário (OFX e CSV) — rodam 100% no navegador.
// Nenhum dado do arquivo é enviado ao servidor: o import grava só as linhas
// que o usuário confirmar, via registrar_gasto_rapido (mesmo caminho do
// lançamento manual).

export interface LinhaExtrato {
  /** YYYY-MM-DD */
  data: string;
  descricao: string;
  /** Valor com sinal do extrato: negativo = saída (gasto), positivo = entrada. */
  valor: number;
}

// ---------- OFX ----------
// Formato SGML dos bancos brasileiros: blocos <STMTTRN> com DTPOSTED (AAAAMMDD),
// TRNAMT e MEMO/NAME. Tolerante a tags sem fechamento.

export function parseOFX(texto: string): LinhaExtrato[] {
  const linhas: LinhaExtrato[] = [];
  const blocos = texto.match(/<STMTTRN>[\s\S]*?(?:<\/STMTTRN>|(?=<STMTTRN>)|$)/gi) ?? [];
  for (const bloco of blocos) {
    const dt = bloco.match(/<DTPOSTED>\s*(\d{8})/i)?.[1];
    const amtRaw = bloco.match(/<TRNAMT>\s*(-?[\d.,]+)/i)?.[1];
    const memo =
      bloco.match(/<MEMO>\s*([^\r\n<]+)/i)?.[1] ??
      bloco.match(/<NAME>\s*([^\r\n<]+)/i)?.[1] ??
      "";
    if (!dt || !amtRaw) continue;
    const valor = parseValor(amtRaw);
    if (valor === null) continue;
    linhas.push({
      data: `${dt.slice(0, 4)}-${dt.slice(4, 6)}-${dt.slice(6, 8)}`,
      descricao: memo.trim() || "Sem descrição",
      valor,
    });
  }
  return linhas;
}

// ---------- CSV ----------
// Heurístico para os CSVs variados dos bancos BR (Nubank, Inter, Itaú...):
// detecta o separador, pula cabeçalho, e em cada linha identifica a célula de
// data, a de valor e usa o maior texto restante como descrição.

export function parseCSV(texto: string): LinhaExtrato[] {
  const linhasBrutas = texto
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  if (linhasBrutas.length === 0) return [];

  const sep = detectarSeparador(linhasBrutas[0]);
  const resultado: LinhaExtrato[] = [];

  for (const linha of linhasBrutas) {
    const celulas = splitCSV(linha, sep).map((c) => c.trim());
    let data: string | null = null;
    let valor: number | null = null;
    let melhorDescricao = "";

    for (const c of celulas) {
      if (data === null) {
        const d = parseData(c);
        if (d) {
          data = d;
          continue;
        }
      }
      if (valor === null && pareceValor(c)) {
        const v = parseValor(c);
        if (v !== null) {
          valor = v;
          continue;
        }
      }
      if (c.length > melhorDescricao.length && !pareceValor(c) && !parseData(c)) {
        melhorDescricao = c;
      }
    }

    // Linha de cabeçalho ou inválida (sem data ou valor) é ignorada.
    if (data && valor !== null) {
      resultado.push({
        data,
        descricao: melhorDescricao.replace(/^"|"$/g, "") || "Sem descrição",
        valor,
      });
    }
  }
  return resultado;
}

export function parseExtrato(nomeArquivo: string, texto: string): LinhaExtrato[] {
  if (/\.ofx$/i.test(nomeArquivo) || /<OFX/i.test(texto)) return parseOFX(texto);
  return parseCSV(texto);
}

// ---------- helpers ----------

function detectarSeparador(linha: string): string {
  const contagem = (ch: string) => linha.split(ch).length - 1;
  if (contagem(";") >= contagem(",") && contagem(";") >= contagem("\t")) return ";";
  if (contagem("\t") > contagem(",")) return "\t";
  return ",";
}

/** Split simples com suporte a células entre aspas. */
function splitCSV(linha: string, sep: string): string[] {
  const out: string[] = [];
  let atual = "";
  let emAspas = false;
  for (const ch of linha) {
    if (ch === '"') {
      emAspas = !emAspas;
    } else if (ch === sep && !emAspas) {
      out.push(atual);
      atual = "";
    } else {
      atual += ch;
    }
  }
  out.push(atual);
  return out;
}

function parseData(c: string): string | null {
  const limpo = c.replace(/^"|"$/g, "");
  let m = limpo.match(/^(\d{2})\/(\d{2})\/(\d{4})$/); // DD/MM/AAAA
  if (m) return `${m[3]}-${m[2]}-${m[1]}`;
  m = limpo.match(/^(\d{4})-(\d{2})-(\d{2})$/); // AAAA-MM-DD
  if (m) return limpo;
  m = limpo.match(/^(\d{2})-(\d{2})-(\d{4})$/); // DD-MM-AAAA
  if (m) return `${m[3]}-${m[2]}-${m[1]}`;
  return null;
}

function pareceValor(c: string): boolean {
  const limpo = c.replace(/^"|"$/g, "").replace(/^R\$\s*/, "");
  return /^-?\d{1,3}(\.\d{3})*,\d{2}$/.test(limpo) || /^-?\d+([.,]\d{1,2})?$/.test(limpo);
}

function parseValor(c: string): number | null {
  let limpo = c.replace(/^"|"$/g, "").replace(/^R\$\s*/, "").trim();
  if (/^-?\d{1,3}(\.\d{3})*,\d{2}$/.test(limpo)) {
    // Formato BR: 1.234,56
    limpo = limpo.replace(/\./g, "").replace(",", ".");
  } else {
    // Formato com vírgula decimal simples (123,45) ou ponto (123.45)
    if (/^-?\d+,\d{1,2}$/.test(limpo)) limpo = limpo.replace(",", ".");
  }
  const n = Number(limpo);
  return Number.isFinite(n) ? n : null;
}
