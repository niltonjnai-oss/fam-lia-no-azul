// Importação de extrato bancário (CSV/OFX).
// Privacidade em primeiro lugar: o arquivo é lido e interpretado 100% no
// navegador — nada é enviado ao servidor. Só as linhas confirmadas viram
// gastos, pelo mesmo registrar_gasto_rapido do lançamento manual.

import { useMemo, useRef, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Upload, FileText, ShieldCheck, CheckCircle2, AlertTriangle, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { PageTitle } from "@/components/PageTitle";
import { EmptyState } from "@/components/EmptyState";
import {
  qk,
  fetchCategorias,
  fetchSubitens,
  fetchTransacoesPeriodo,
  registrarGastoImportado,
} from "@/lib/db";
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

interface LinhaRevisao extends LinhaExtrato {
  id: number;
  selecionada: boolean;
  subitemId: string;
  duplicata: boolean;
}

function ImportarPage() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [nomeArquivo, setNomeArquivo] = useState<string | null>(null);
  const [linhas, setLinhas] = useState<LinhaRevisao[]>([]);
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

  async function aoEscolherArquivo(file: File) {
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

    // Duplicatas: gasto com mesma data e mesmo valor já registrado no app.
    const datas = gastos.map((l) => l.data).sort();
    let existentes: { data: string; valor: number }[] = [];
    try {
      existentes = await fetchTransacoesPeriodo(datas[0], datas[datas.length - 1]);
    } catch {
      // sem bloqueio: segue sem detecção de duplicata
    }
    const chaveExistente = new Set(existentes.map((t) => `${t.data}|${Number(t.valor).toFixed(2)}`));

    setNomeArquivo(file.name);
    setLinhas(
      gastos.map((l, i) => {
        const valorAbs = Math.abs(l.valor);
        const duplicata = chaveExistente.has(`${l.data}|${valorAbs.toFixed(2)}`);
        return {
          ...l,
          valor: valorAbs,
          id: i,
          duplicata,
          selecionada: !duplicata,
          subitemId: "",
        };
      }),
    );
  }

  function aplicarCategoriaEmMassa(subitemId: string) {
    setLinhas((ls) => ls.map((l) => (l.selecionada ? { ...l, subitemId } : l)));
  }

  const selecionadas = linhas.filter((l) => l.selecionada);
  const prontas = selecionadas.filter((l) => l.subitemId);
  const totalSelecionado = selecionadas.reduce((a, l) => a + l.valor, 0);

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
    setNomeArquivo(null);
    qc.invalidateQueries();
    if (falhas === 0) toast.success(`${ok} gastos importados! 🎉`);
    else toast.warning(`${ok} importados, ${falhas} falharam. Tente os restantes novamente.`);
  }

  return (
    <div className="space-y-5">
      <div>
        <PageTitle>Importar extrato</PageTitle>
        <p className="mt-1 text-sm text-muted-foreground">
          Baixe o extrato no app do seu banco (CSV ou OFX) e registre os gastos de uma vez.
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
            {resultado.falhas > 0 && `${resultado.falhas} falharam — importe o arquivo de novo (duplicatas são detectadas).`}{" "}
            <Link to="/app" className="font-medium text-primary hover:underline">
              Ver no painel
            </Link>
          </div>
        </div>
      )}

      {linhas.length === 0 ? (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex w-full flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-border bg-card p-10 text-center shadow-soft transition-colors hover:border-primary/50 hover:bg-primary/5"
        >
          <span className="grid h-14 w-14 place-items-center rounded-2xl bg-primary/10 text-primary">
            <Upload className="h-6 w-6" />
          </span>
          <span className="text-sm font-semibold">Escolher arquivo do extrato</span>
          <span className="text-xs text-muted-foreground">
            CSV ou OFX — Nubank, Inter, Itaú, Bradesco, Caixa e outros
          </span>
        </button>
      ) : (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4 shadow-soft">
            <div className="flex items-center gap-2 text-sm">
              <FileText className="h-4 w-4 text-primary" />
              <span className="font-medium">{nomeArquivo}</span>
              <span className="text-xs text-muted-foreground">
                {linhas.length} gastos encontrados
              </span>
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
            {linhas.map((l) => (
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
                  <div className="text-xs text-muted-foreground">
                    {l.data.split("-").reverse().join("/")}
                    {l.duplicata && (
                      <span className="ml-2 inline-flex items-center gap-1 rounded bg-warning/20 px-1.5 py-0.5 text-[10px] font-semibold text-warning-foreground">
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
              <Button onClick={importar} disabled={prontas.length === 0 || importando}>
                {importando ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Importando… {progresso}/{prontas.length}
                  </>
                ) : (
                  <>Importar {prontas.length} gastos</>
                )}
              </Button>
            </div>
          </div>
        </>
      )}

      {linhas.length === 0 && !resultado && (
        <EmptyState
          title="Como baixar o extrato?"
          description="No app do seu banco, procure por 'Extrato' → 'Exportar' e escolha CSV ou OFX. Depois selecione o arquivo aqui."
        />
      )}

      <input
        ref={inputRef}
        type="file"
        accept=".csv,.ofx,.txt"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) void aoEscolherArquivo(f);
          e.target.value = "";
        }}
      />
    </div>
  );
}
