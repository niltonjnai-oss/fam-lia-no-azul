// Importação de extrato bancário (CSV/OFX).
// Privacidade em primeiro lugar: o arquivo é lido e interpretado 100% no
// navegador — nada é enviado ao servidor. Só as linhas confirmadas viram
// gastos, pelo mesmo registrar_gasto_rapido do lançamento manual.
//
// Suporta VÁRIOS extratos de uma vez (um por banco): cada extrato é marcado
// com o banco de origem, que fica salvo no campo `banco` de cada transação.
// Um filtro de período (padrão: mês que você está vendo no app) reduz o ruído
// quando o banco só deixa baixar um intervalo grande.

import { useMemo, useRef, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Upload,
  FileText,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Plus,
  X,
  Landmark,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { PageTitle } from "@/components/PageTitle";
import { EmptyState } from "@/components/EmptyState";
import {
  qk,
  fetchCategorias,
  fetchSubitens,
  fetchTransacoesPeriodo,
  registrarGastoImportado,
  formatMes,
  mesAtual,
  shiftMes,
} from "@/lib/db";
import { useMes } from "@/lib/mes-context";
import { formatBRL } from "@/lib/format";
import { parseExtrato, type LinhaExtrato } from "@/lib/extrato";

export const Route = createFileRoute("/importar")({
  head: () => ({
    meta: [
      { title: "Importar extrato — Família no Azul" },
      {
        name: "description",
        content: "Importe o extrato do banco (CSV ou OFX) e registre os gastos de uma vez.",
      },
    ],
  }),
  component: ImportarPage,
});

/** Sugestões do seletor de banco. É um datalist: aceita qualquer texto, então
 *  cobre bancos fora da lista sem precisar de opção "Outro". */
const BANCOS_COMUNS = [
  "Nubank",
  "Inter",
  "Itaú",
  "Bradesco",
  "Caixa",
  "Banco do Brasil",
  "Santander",
  "C6 Bank",
  "PagBank",
  "Mercado Pago",
  "Sicoob",
  "Sicredi",
  "BTG",
  "Will Bank",
  "Next",
];

interface LinhaRevisao extends LinhaExtrato {
  id: number;
  arquivoId: number;
  banco: string;
  selecionada: boolean;
  subitemId: string;
  duplicata: boolean;
}

interface ArquivoCarregado {
  id: number;
  nome: string;
  banco: string;
  qtd: number;
}

type Periodo =
  | { tipo: "mes"; mes: string }
  | { tipo: "tudo" }
  | { tipo: "custom"; de: string; ate: string };

function linhaNoPeriodo(l: LinhaRevisao, p: Periodo): boolean {
  if (p.tipo === "tudo") return true;
  if (p.tipo === "mes") return l.data.slice(0, 7) === p.mes;
  return (!p.de || l.data >= p.de) && (!p.ate || l.data <= p.ate);
}

/** Chave da duplicata: mesma data + valor + banco. Bancos diferentes com mesmo
 *  dia/valor são gastos reais distintos, não duplicata. */
function chaveDup(data: string, valor: number, banco: string | null): string {
  return `${data}|${valor.toFixed(2)}|${(banco ?? "").trim().toLowerCase()}`;
}

function ImportarPage() {
  const { mes: mesContexto } = useMes();
  const inputRef = useRef<HTMLInputElement>(null);
  const idRef = useRef(0);
  const arquivoIdRef = useRef(0);

  const [bancoAtual, setBancoAtual] = useState("");
  const [linhas, setLinhas] = useState<LinhaRevisao[]>([]);
  const [arquivos, setArquivos] = useState<ArquivoCarregado[]>([]);
  const [periodo, setPeriodo] = useState<Periodo>({ tipo: "mes", mes: mesContexto });
  const [importando, setImportando] = useState(false);
  const [progresso, setProgresso] = useState(0);
  const [resultado, setResultado] = useState<{ ok: number; falhas: number } | null>(null);
  const qc = useQueryClient();

  const catsQ = useQuery({ queryKey: qk.categorias, queryFn: fetchCategorias });
  const subsQ = useQuery({ queryKey: qk.subitens, queryFn: fetchSubitens });

  const subitensPorCategoria = useMemo(() => {
    const cats = catsQ.data ?? [];
    const subs = subsQ.data ?? [];
    return cats
      .map((c) => ({ categoria: c, subitens: subs.filter((s) => s.categoria_id === c.id) }))
      .filter((g) => g.subitens.length > 0);
  }, [catsQ.data, subsQ.data]);

  async function adicionarArquivo(file: File) {
    const banco = bancoAtual.trim();
    if (!banco) {
      toast.error("Escolha o banco deste extrato antes de adicionar o arquivo.");
      return;
    }
    setResultado(null);
    const texto = await file.text();
    const parseadas = parseExtrato(file.name, texto);
    if (parseadas.length === 0) {
      toast.error("Não encontramos lançamentos nesse arquivo. Confira se é um extrato CSV ou OFX.");
      return;
    }

    // Só saídas viram gasto. Se o extrato não tiver sinais (tudo positivo),
    // tratamos todos os valores como gasto.
    const temNegativos = parseadas.some((l) => l.valor < 0);
    const gastos = temNegativos ? parseadas.filter((l) => l.valor < 0) : parseadas;
    if (gastos.length === 0) {
      toast.error("O arquivo só tem entradas (créditos) — nenhum gasto para importar.");
      return;
    }

    // Duplicatas: (a) contra o que já está salvo no banco (bank-aware) e
    // (b) contra as linhas já carregadas do MESMO banco (evita somar o mesmo
    // extrato duas vezes).
    const datas = gastos.map((l) => l.data).sort();
    let existentes: { data: string; valor: number; banco: string | null }[] = [];
    try {
      existentes = await fetchTransacoesPeriodo(datas[0], datas[datas.length - 1]);
    } catch {
      // sem bloqueio: segue sem detecção de duplicata
    }
    const chavesExistentes = new Set(
      existentes.map((t) => chaveDup(t.data, Number(t.valor), t.banco)),
    );
    for (const l of linhas) chavesExistentes.add(chaveDup(l.data, l.valor, l.banco));

    const arquivoId = arquivoIdRef.current++;
    const novas: LinhaRevisao[] = gastos.map((l) => {
      const valorAbs = Math.abs(l.valor);
      const duplicata = chavesExistentes.has(chaveDup(l.data, valorAbs, banco));
      return {
        ...l,
        valor: valorAbs,
        id: idRef.current++,
        arquivoId,
        banco,
        duplicata,
        selecionada: !duplicata,
        subitemId: "",
      };
    });

    setLinhas((prev) => [...prev, ...novas]);
    setArquivos((prev) => [...prev, { id: arquivoId, nome: file.name, banco, qtd: novas.length }]);
    toast.success(`${novas.length} gastos de ${banco} adicionados.`);
  }

  function removerArquivo(arquivoId: number) {
    setArquivos((prev) => prev.filter((a) => a.id !== arquivoId));
    setLinhas((prev) => prev.filter((l) => l.arquivoId !== arquivoId));
  }

  function aplicarCategoriaEmMassa(subitemId: string) {
    setLinhas((ls) =>
      ls.map((l) => (l.selecionada && linhaNoPeriodo(l, periodo) ? { ...l, subitemId } : l)),
    );
  }

  const visiveis = linhas.filter((l) => linhaNoPeriodo(l, periodo));
  const selecionadas = visiveis.filter((l) => l.selecionada);
  const prontas = selecionadas.filter((l) => l.subitemId);
  const totalSelecionado = selecionadas.reduce((a, l) => a + l.valor, 0);
  const foraDoPeriodo = linhas.length - visiveis.length;

  async function importar() {
    if (prontas.length === 0) return;
    setImportando(true);
    setProgresso(0);
    let ok = 0;
    let falhas = 0;
    for (const l of prontas) {
      try {
        await registrarGastoImportado({
          subitem_id: l.subitemId,
          mes_ref: l.data.slice(0, 7),
          valor: l.valor,
          descricao: l.descricao.slice(0, 120),
          data: l.data,
          banco: l.banco,
        });
        ok += 1;
      } catch {
        falhas += 1;
      }
      setProgresso(ok + falhas);
    }
    setImportando(false);
    setResultado({ ok, falhas });
    setLinhas([]);
    setArquivos([]);
    setBancoAtual("");
    qc.invalidateQueries();
    if (falhas === 0) toast.success(`${ok} gastos importados! 🎉`);
    else toast.warning(`${ok} importados, ${falhas} falharam. Tente os restantes novamente.`);
  }

  const mesAnterior = shiftMes(mesAtual(), -1);

  return (
    <div className="space-y-5">
      <div>
        <PageTitle>Importar extrato</PageTitle>
        <p className="mt-1 text-sm text-muted-foreground">
          Baixe o extrato no app do seu banco (CSV ou OFX) e registre os gastos de uma vez. Tem mais
          de um banco? Adicione um extrato de cada vez, marcando o banco.
        </p>
      </div>

      <div className="flex items-start gap-2 rounded-xl bg-muted/50 p-3 text-xs text-muted-foreground">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
        <span>
          O arquivo é lido <strong>somente no seu navegador</strong> — nada é enviado aos nossos
          servidores. Só os gastos que você confirmar são salvos na sua conta.
        </span>
      </div>

      {resultado && (
        <div className="flex items-center gap-3 rounded-2xl border border-success/30 bg-success/10 p-4 text-sm">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-success" />
          <div>
            <strong>{resultado.ok} gastos importados.</strong>{" "}
            {resultado.falhas > 0 &&
              `${resultado.falhas} falharam — importe o arquivo de novo (duplicatas são detectadas).`}{" "}
            <Link to="/app" className="font-medium text-primary hover:underline">
              Ver no painel
            </Link>
          </div>
        </div>
      )}

      {/* Adicionar extrato: escolha o banco e selecione o arquivo */}
      <div className="rounded-2xl border border-border bg-card p-4 shadow-soft">
        <label htmlFor="banco" className="text-xs font-medium text-muted-foreground">
          Banco deste extrato
        </label>
        <div className="mt-1.5 flex flex-wrap items-center gap-2">
          <div className="relative min-w-[180px] flex-1">
            <Landmark className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="banco"
              list="bancos-comuns"
              value={bancoAtual}
              onChange={(e) => setBancoAtual(e.target.value)}
              placeholder="Ex.: Nubank, Itaú, Inter…"
              className="h-11 pl-8"
              autoComplete="off"
            />
            <datalist id="bancos-comuns">
              {BANCOS_COMUNS.map((b) => (
                <option key={b} value={b} />
              ))}
            </datalist>
          </div>
          <Button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={!bancoAtual.trim()}
            className="h-11 bg-cta text-cta-foreground hover:bg-cta-hover"
          >
            <Plus className="mr-1 h-4 w-4" />
            Adicionar extrato
          </Button>
        </div>

        {arquivos.length > 0 && (
          <ul className="mt-3 flex flex-wrap gap-2">
            {arquivos.map((a) => (
              <li
                key={a.id}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5 text-xs"
              >
                <FileText className="h-3.5 w-3.5 text-primary" />
                <span className="font-medium">{a.banco}</span>
                <span className="text-muted-foreground">{a.qtd} gastos</span>
                <button
                  type="button"
                  onClick={() => removerArquivo(a.id)}
                  aria-label={`Remover extrato ${a.banco}`}
                  className="grid h-5 w-5 place-items-center rounded-full text-muted-foreground hover:bg-danger/10 hover:text-danger"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {linhas.length === 0 ? (
        <EmptyState
          title="Como baixar o extrato?"
          description="No app do seu banco, procure por 'Extrato' → 'Exportar' e escolha CSV ou OFX. Marque o banco acima e clique em Adicionar extrato. Repita para cada banco."
        />
      ) : (
        <>
          {/* Filtro de período */}
          <div className="rounded-2xl border border-border bg-card p-4 shadow-soft">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground">Período:</span>
              <PeriodoBotao
                ativo={periodo.tipo === "mes" && periodo.mes === mesAtual()}
                onClick={() => setPeriodo({ tipo: "mes", mes: mesAtual() })}
              >
                Este mês
              </PeriodoBotao>
              <PeriodoBotao
                ativo={periodo.tipo === "mes" && periodo.mes === mesAnterior}
                onClick={() => setPeriodo({ tipo: "mes", mes: mesAnterior })}
              >
                Mês passado
              </PeriodoBotao>
              <PeriodoBotao
                ativo={periodo.tipo === "tudo"}
                onClick={() => setPeriodo({ tipo: "tudo" })}
              >
                Tudo
              </PeriodoBotao>
              <PeriodoBotao
                ativo={periodo.tipo === "custom"}
                onClick={() =>
                  setPeriodo((p) =>
                    p.tipo === "custom" ? p : { tipo: "custom", de: "", ate: "" },
                  )
                }
              >
                Escolher…
              </PeriodoBotao>
            </div>

            {periodo.tipo === "custom" && (
              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                <label className="flex items-center gap-1.5">
                  De
                  <Input
                    type="date"
                    value={periodo.de}
                    onChange={(e) => setPeriodo({ ...periodo, de: e.target.value })}
                    className="h-9"
                  />
                </label>
                <label className="flex items-center gap-1.5">
                  até
                  <Input
                    type="date"
                    value={periodo.ate}
                    onChange={(e) => setPeriodo({ ...periodo, ate: e.target.value })}
                    className="h-9"
                  />
                </label>
              </div>
            )}

            <p className="mt-2 text-[11px] text-muted-foreground">
              {periodo.tipo === "mes" && `Mostrando só ${formatMes(periodo.mes)}.`}
              {periodo.tipo === "tudo" && "Mostrando todos os lançamentos dos extratos."}
              {periodo.tipo === "custom" && "Mostrando o intervalo escolhido."}
              {foraDoPeriodo > 0 && ` ${foraDoPeriodo} fora do período estão ocultos.`}
            </p>
          </div>

          {/* Categoria em massa */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4 shadow-soft">
            <div className="text-sm">
              <span className="font-medium">{visiveis.length}</span> gastos no período
            </div>
            <div className="flex items-center gap-2">
              <label htmlFor="bulk-cat" className="text-xs text-muted-foreground">
                Categoria p/ selecionados:
              </label>
              <select
                id="bulk-cat"
                className="h-9 rounded-md border border-border bg-background px-2 text-xs"
                defaultValue=""
                onChange={(e) => e.target.value && aplicarCategoriaEmMassa(e.target.value)}
              >
                <option value="">Escolher…</option>
                {subitensPorCategoria.map((g) => (
                  <optgroup key={g.categoria.id} label={g.categoria.nome}>
                    {g.subitens.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.nome}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>
          </div>

          <section className="space-y-2">
            {visiveis.map((l) => (
              <div
                key={l.id}
                className={`flex flex-wrap items-center gap-3 rounded-xl border p-3 text-sm shadow-soft ${
                  l.selecionada ? "border-border bg-card" : "border-border/50 bg-muted/30 opacity-60"
                }`}
              >
                <Checkbox
                  checked={l.selecionada}
                  onCheckedChange={(v) =>
                    setLinhas((ls) =>
                      ls.map((x) => (x.id === l.id ? { ...x, selecionada: v === true } : x)),
                    )
                  }
                  aria-label="Incluir na importação"
                />
                <div className="min-w-0 flex-1">
                  <div className="truncate font-medium">{l.descricao}</div>
                  <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                    <span>{l.data.split("-").reverse().join("/")}</span>
                    <span className="inline-flex items-center gap-1 rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                      <Landmark className="h-3 w-3" />
                      {l.banco}
                    </span>
                    {l.duplicata && (
                      <span className="inline-flex items-center gap-1 rounded bg-warning/20 px-1.5 py-0.5 text-[10px] font-semibold text-warning-foreground">
                        <AlertTriangle className="h-3 w-3" /> possível duplicata
                      </span>
                    )}
                  </div>
                </div>
                <div className="tabular font-bold">{formatBRL(l.valor)}</div>
                <select
                  className="h-9 w-44 rounded-md border border-border bg-background px-2 text-xs"
                  value={l.subitemId}
                  onChange={(e) =>
                    setLinhas((ls) =>
                      ls.map((x) => (x.id === l.id ? { ...x, subitemId: e.target.value } : x)),
                    )
                  }
                  disabled={!l.selecionada}
                >
                  <option value="">Categoria…</option>
                  {subitensPorCategoria.map((g) => (
                    <optgroup key={g.categoria.id} label={g.categoria.nome}>
                      {g.subitens.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.nome}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>
            ))}
          </section>

          <div className="sticky bottom-20 rounded-2xl border border-primary/30 bg-card p-4 shadow-elevated lg:bottom-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="text-sm">
                <strong>{selecionadas.length}</strong> selecionados ·{" "}
                <span className="tabular font-bold">{formatBRL(totalSelecionado)}</span>
                {prontas.length < selecionadas.length && (
                  <div className="text-xs text-warning-foreground">
                    {selecionadas.length - prontas.length} sem categoria — escolha para importar.
                  </div>
                )}
              </div>
              <Button
                onClick={importar}
                disabled={prontas.length === 0 || importando}
                className="bg-cta text-cta-foreground hover:bg-cta-hover"
              >
                {importando ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Importando… {progresso}/
                    {prontas.length}
                  </>
                ) : (
                  <>Importar {prontas.length} gastos</>
                )}
              </Button>
            </div>
          </div>
        </>
      )}

      <input
        ref={inputRef}
        type="file"
        accept=".csv,.ofx,.txt"
        multiple
        className="hidden"
        onChange={(e) => {
          const files = Array.from(e.target.files ?? []);
          for (const f of files) void adicionarArquivo(f);
          e.target.value = "";
        }}
      />
    </div>
  );
}

function PeriodoBotao({
  ativo,
  onClick,
  children,
}: {
  ativo: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
        ativo
          ? "bg-primary text-primary-foreground"
          : "border border-border bg-background text-foreground hover:bg-muted"
      }`}
    >
      {children}
    </button>
  );
}
