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

  // 1ª passada: extrai data/valor e coleta os candidatos a descrição de cada
  // linha, contando a frequência de cada texto no arquivo inteiro. Textos que
  // se repetem em quase todas as linhas (nome do banco, "Débito", instituição)
  // são ruído — a descrição real é a que varia (loja, destinatário).
  interface LinhaParcial {
    data: string;
    valor: number;
    candidatos: string[];
  }
  const parciais: LinhaParcial[] = [];
  const frequencia = new Map<string, number>();

  for (const linha of linhasBrutas) {
    const celulas = splitCSV(linha, sep).map((c) => c.trim().replace(/^"|"$/g, ""));
    let data: string | null = null;
    let valor: number | null = null;
    const candidatos: string[] = [];

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
      if (pareceTextoDescritivo(c)) candidatos.push(c);
    }

    // Linha de cabeçalho ou inválida (sem data ou valor) é ignorada.
    if (data && valor !== null) {
      parciais.push({ data, valor, candidatos });
      for (const c of new Set(candidatos)) {
        frequencia.set(c, (frequencia.get(c) ?? 0) + 1);
      }
    }
  }

  // 2ª passada: escolhe a descrição menos repetida (mais específica da linha);
  // empate decide pelo texto mais longo.
  const total = parciais.length;
  return parciais.map((p) => {
    let melhor = "";
    let melhorFreq = Infinity;
    for (const c of p.candidatos) {
      const f = frequencia.get(c) ?? 0;
      const repetida = total >= 3 && f > total * 0.6;
      if (repetida) continue;
      if (f < melhorFreq || (f === melhorFreq && c.length > melhor.length)) {
        melhor = c;
        melhorFreq = f;
      }
    }
    // Se tudo era repetido (arquivo pequeno/uniforme), usa o candidato mais longo.
    if (!melhor && p.candidatos.length > 0) {
      melhor = p.candidatos.reduce((a, b) => (b.length > a.length ? b : a), "");
    }
    return { data: p.data, valor: p.valor, descricao: melhor || "Sem descrição" };
  });
}

/** Filtra células que não servem como descrição: valores, datas, horários,
 *  CPF/CNPJ, números de agência/conta e rótulos curtos demais. */
function pareceTextoDescritivo(c: string): boolean {
  if (c.length < 3) return false;
  if (pareceValor(c) || parseData(c)) return false;
  if (/^R\$/.test(c)) return false;
  if (/^\d{1,2}:\d{2}/.test(c)) return false; // horário
  if (/^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(c)) return false; // CPF
  if (/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/.test(c)) return false; // CNPJ
  if (/^[\d\s./-]+$/.test(c)) return false; // só números (agência, conta, doc)
  return /[a-zA-ZÀ-ú]{3,}/.test(c);
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
  // Aceita hora após a data (ex.: "10/07/2026 14:53" no CSV da Stone).
  let m = limpo.match(/^(\d{2})\/(\d{2})\/(\d{4})(\s+\d{1,2}:\d{2}.*)?$/); // DD/MM/AAAA [hh:mm]
  if (m) return `${m[3]}-${m[2]}-${m[1]}`;
  m = limpo.match(/^(\d{4})-(\d{2})-(\d{2})([T\s].*)?$/); // AAAA-MM-DD [hora]
  if (m) return `${m[1]}-${m[2]}-${m[3]}`;
  m = limpo.match(/^(\d{2})-(\d{2})-(\d{4})(\s+\d{1,2}:\d{2}.*)?$/); // DD-MM-AAAA [hh:mm]
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
