// Assistente "Entenda sua dívida": traduz parcelamentos, juros e propostas de
// acordo para linguagem simples. Três caminhos, resultado ao vivo, e a opção
// de salvar direto na lista de dívidas (com a taxa já calculada).

import { useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Lightbulb,
  ShoppingCart,
  CalendarClock,
  Handshake,
  ArrowLeft,
  Plus,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CurrencyInput } from "@/components/CurrencyInput";
import { qk, inserirDivida } from "@/lib/db";
import { formatBRL } from "@/lib/format";
import {
  taxaImplicita,
  simularPagamento,
  classificarTaxa,
  FAIXA_INFO,
} from "@/lib/juros";

type Caminho = "parcelas" | "juros" | "acordo";

const num = (s: string) => Math.max(0, Number(s) || 0);
const pctParaDecimal = (s: string) => {
  const n = Number(s.replace(",", "."));
  return Number.isFinite(n) && n > 0 ? n / 100 : 0;
};
const fmtTaxa = (t: number) => `${(t * 100).toFixed(1).replace(".", ",")}%`;

export function AssistenteDividaCard() {
  const [open, setOpen] = useState(false);
  const [caminho, setCaminho] = useState<Caminho | null>(null);

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) setCaminho(null);
      }}
    >
      <DialogTrigger asChild>
        <button
          type="button"
          className="flex w-full items-center gap-3 rounded-2xl border border-primary/30 bg-primary/5 p-4 text-left shadow-soft transition-colors hover:bg-primary/10"
        >
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground">
            <Lightbulb className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-semibold">🧮 Entenda sua dívida</div>
            <div className="text-xs text-muted-foreground">
              Descubra o custo real, quando ela acaba e como negociar melhor.
            </div>
          </div>
        </button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
        {caminho === null ? (
          <>
            <DialogHeader>
              <DialogTitle>O que você quer descobrir?</DialogTitle>
              <DialogDescription>
                Escolha a pergunta que mais parece com a sua situação.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-2">
              <OpcaoCaminho
                Icon={ShoppingCart}
                titulo="Quanto essa dívida me custa de verdade?"
                sub="Para quem parcelou uma compra ou um acordo."
                onClick={() => setCaminho("parcelas")}
              />
              <OpcaoCaminho
                Icon={CalendarClock}
                titulo="Quando essa dívida acaba?"
                sub="Para quem sabe os juros (cartão, cheque especial, empréstimo)."
                onClick={() => setCaminho("juros")}
              />
              <OpcaoCaminho
                Icon={Handshake}
                titulo="Essa proposta de acordo vale a pena?"
                sub="Para quem recebeu uma oferta de negociação."
                onClick={() => setCaminho("acordo")}
              />
            </div>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={() => setCaminho(null)}
              className="inline-flex w-fit items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> voltar
            </button>
            {caminho === "parcelas" && <CaminhoParcelas onDone={() => setOpen(false)} />}
            {caminho === "juros" && <CaminhoJuros onDone={() => setOpen(false)} />}
            {caminho === "acordo" && <CaminhoAcordo onDone={() => setOpen(false)} />}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function OpcaoCaminho({
  Icon,
  titulo,
  sub,
  onClick,
}: {
  Icon: typeof Lightbulb;
  titulo: string;
  sub: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-xl border border-border bg-card p-3 text-left transition-colors hover:border-primary/40 hover:bg-primary/5"
    >
      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <div className="text-sm font-semibold">{titulo}</div>
        <div className="text-xs text-muted-foreground">{sub}</div>
      </div>
    </button>
  );
}

// ---------- Caminho 1: quanto custa de verdade ----------

function CaminhoParcelas({ onDone }: { onDone: () => void }) {
  const [vista, setVista] = useState("");
  const [nParcelas, setNParcelas] = useState("");
  const [parcela, setParcela] = useState("");

  const vistaN = num(vista);
  const n = Math.floor(num(nParcelas));
  const parcelaN = num(parcela);
  const pronto = vistaN > 0 && n > 0 && parcelaN > 0;

  const resultado = useMemo(() => {
    if (!pronto) return null;
    const total = parcelaN * n;
    const juros = total - vistaN;
    const taxa = taxaImplicita(vistaN, parcelaN, n);
    return { total, juros, taxa };
  }, [pronto, vistaN, parcelaN, n]);

  return (
    <div className="space-y-4">
      <DialogHeader>
        <DialogTitle>Quanto custa de verdade</DialogTitle>
        <DialogDescription>
          Conte como foi o parcelamento e a gente mostra o tamanho dos juros.
        </DialogDescription>
      </DialogHeader>

      <CurrencyInput
        label="Quanto custava à vista? (ou quanto era a dívida)"
        value={vista}
        onChange={setVista}
      />
      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className="block text-xs font-medium text-muted-foreground">
            Em quantas parcelas?
          </span>
          <Input
            inputMode="numeric"
            value={nParcelas}
            onChange={(e) => setNParcelas(e.target.value.replace(/\D/g, ""))}
            placeholder="Ex.: 12"
            className="tabular mt-1 h-12"
          />
        </label>
        <CurrencyInput label="Valor de cada parcela" value={parcela} onChange={setParcela} />
      </div>

      {resultado && resultado.juros < -0.005 && (
        <p className="rounded-xl bg-warning/15 p-3 text-xs font-medium text-warning-foreground">
          As parcelas somam menos que o valor à vista ({formatBRL(resultado.total)} vs{" "}
          {formatBRL(vistaN)}) — confira se os números estão certos.
        </p>
      )}

      {resultado && resultado.taxa === null && (
        <p className="rounded-xl bg-danger/10 p-3 text-xs font-medium text-danger">
          Esses números não fecham — confira se o valor à vista e as parcelas estão certos.
        </p>
      )}

      {resultado && resultado.taxa !== null && resultado.juros >= -0.005 && (
        <>
          <ResultadoCusto
            original={vistaN}
            total={resultado.total}
            juros={resultado.juros}
            taxa={resultado.taxa}
            fraseTotal={`Você vai pagar ${formatBRL(resultado.total)} (${n}x de ${formatBRL(parcelaN)}) por algo que custava ${formatBRL(vistaN)}.`}
          />
          <SalvarDivida
            nomeSugestao="Parcelamento"
            valor_total={vistaN}
            parcela_mensal={parcelaN}
            taxa_juros_mensal={resultado.taxa}
            onDone={onDone}
          />
        </>
      )}
    </div>
  );
}

// ---------- Caminho 2: quando acaba ----------

function CaminhoJuros({ onDone }: { onDone: () => void }) {
  const [saldo, setSaldo] = useState("");
  const [taxaPct, setTaxaPct] = useState("");
  const [pagamento, setPagamento] = useState("");

  const saldoN = num(saldo);
  const taxa = pctParaDecimal(taxaPct);
  const pagamentoN = num(pagamento);
  const pronto = saldoN > 0 && pagamentoN > 0;

  const resultado = useMemo(
    () => (pronto ? simularPagamento(saldoN, taxa, pagamentoN) : null),
    [pronto, saldoN, taxa, pagamentoN],
  );
  const comExtra = useMemo(
    () => (pronto ? simularPagamento(saldoN, taxa, pagamentoN + 50) : null),
    [pronto, saldoN, taxa, pagamentoN],
  );

  return (
    <div className="space-y-4">
      <DialogHeader>
        <DialogTitle>Quando essa dívida acaba</DialogTitle>
        <DialogDescription>
          Informe o saldo, os juros e quanto você paga por mês.
        </DialogDescription>
      </DialogHeader>

      <CurrencyInput label="Quanto você deve hoje?" value={saldo} onChange={setSaldo} />
      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className="block text-xs font-medium text-muted-foreground">
            Juros por mês (%)
          </span>
          <Input
            inputMode="decimal"
            value={taxaPct}
            onChange={(e) => setTaxaPct(e.target.value)}
            placeholder="Ex.: 8"
            className="tabular mt-1 h-12"
          />
        </label>
        <CurrencyInput
          label="Quanto paga por mês?"
          value={pagamento}
          onChange={setPagamento}
        />
      </div>

      {pronto && !resultado && (
        <p className="rounded-xl bg-danger/10 p-3 text-xs font-medium text-danger">
          Pagando {formatBRL(pagamentoN)}/mês, essa dívida <strong>nunca acaba</strong> — os
          juros crescem mais do que você paga. Aumente o valor mensal ou renegocie a taxa.
        </p>
      )}

      {resultado && (
        <>
          <div className="rounded-xl border-2 border-primary/30 bg-primary/5 p-4 text-sm">
            <p>
              Pagando <strong>{formatBRL(pagamentoN)}/mês</strong>, você termina em{" "}
              <strong>{resultado.meses} {resultado.meses === 1 ? "mês" : "meses"}</strong> e
              paga <strong className="text-danger">{formatBRL(resultado.totalJuros)}</strong>{" "}
              só de juros.
            </p>
            {comExtra && comExtra.meses < resultado.meses && (
              <p className="mt-2 text-xs text-muted-foreground">
                💡 Com R$ 50 a mais por mês, você terminaria{" "}
                <strong className="text-success">
                  {resultado.meses - comExtra.meses}{" "}
                  {resultado.meses - comExtra.meses === 1 ? "mês" : "meses"} antes
                </strong>{" "}
                e economizaria {formatBRL(resultado.totalJuros - comExtra.totalJuros)} em juros.
              </p>
            )}
            {taxa > 0 && <SeloTaxa taxa={taxa} />}
          </div>
          <SalvarDivida
            nomeSugestao=""
            valor_total={saldoN}
            parcela_mensal={pagamentoN}
            taxa_juros_mensal={taxa}
            onDone={onDone}
          />
        </>
      )}
    </div>
  );
}

// ---------- Caminho 3: proposta de acordo ----------

function CaminhoAcordo({ onDone }: { onDone: () => void }) {
  const [devido, setDevido] = useState("");
  const [tipo, setTipo] = useState<"vista" | "parcelado">("vista");
  const [propostaVista, setPropostaVista] = useState("");
  const [nParcelas, setNParcelas] = useState("");
  const [parcela, setParcela] = useState("");

  const devidoN = num(devido);
  const vistaN = num(propostaVista);
  const n = Math.floor(num(nParcelas));
  const parcelaN = num(parcela);

  const avaliacao = useMemo(() => {
    if (devidoN <= 0) return null;
    if (tipo === "vista") {
      if (vistaN <= 0) return null;
      const desconto = devidoN - vistaN;
      const pct = (desconto / devidoN) * 100;
      return { kind: "vista" as const, desconto, pct };
    }
    if (n <= 0 || parcelaN <= 0) return null;
    const total = n * parcelaN;
    const taxa = taxaImplicita(devidoN, parcelaN, n);
    return { kind: "parcelado" as const, total, taxa, desconto: devidoN - total };
  }, [devidoN, tipo, vistaN, n, parcelaN]);

  return (
    <div className="space-y-4">
      <DialogHeader>
        <DialogTitle>A proposta vale a pena?</DialogTitle>
        <DialogDescription>
          Compare o que dizem que você deve com o que estão oferecendo.
        </DialogDescription>
      </DialogHeader>

      <CurrencyInput
        label="Quanto dizem que você deve?"
        value={devido}
        onChange={setDevido}
      />

      <div className="grid grid-cols-2 gap-1 rounded-xl bg-muted p-1">
        {(
          [
            { key: "vista", label: "À vista com desconto" },
            { key: "parcelado", label: "Parcelado" },
          ] as const
        ).map((opt) => (
          <button
            key={opt.key}
            type="button"
            onClick={() => setTipo(opt.key)}
            className={[
              "min-h-[44px] rounded-lg px-2 py-2 text-xs font-semibold transition-colors",
              tipo === opt.key
                ? "bg-card text-foreground shadow-soft"
                : "text-muted-foreground hover:text-foreground",
            ].join(" ")}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {tipo === "vista" ? (
        <CurrencyInput
          label="Qual o valor da proposta à vista?"
          value={propostaVista}
          onChange={setPropostaVista}
        />
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="block text-xs font-medium text-muted-foreground">
              Em quantas parcelas?
            </span>
            <Input
              inputMode="numeric"
              value={nParcelas}
              onChange={(e) => setNParcelas(e.target.value.replace(/\D/g, ""))}
              placeholder="Ex.: 10"
              className="tabular mt-1 h-12"
            />
          </label>
          <CurrencyInput label="Valor de cada parcela" value={parcela} onChange={setParcela} />
        </div>
      )}

      {avaliacao?.kind === "vista" && (
        <div
          className={[
            "rounded-xl border-2 p-4 text-sm",
            avaliacao.desconto > 0
              ? "border-success/40 bg-success/10"
              : "border-danger/40 bg-danger/10",
          ].join(" ")}
        >
          {avaliacao.desconto > 0 ? (
            <p>
              🟢 O acordo à vista te dá{" "}
              <strong>{formatBRL(avaliacao.desconto)} de desconto real</strong> (
              {avaliacao.pct.toFixed(0)}% a menos). Vale a pena{" "}
              <strong>se você tiver o dinheiro sem desmontar sua reserva</strong>.
            </p>
          ) : (
            <p>
              🔴 Essa proposta é <strong>maior</strong> do que a própria dívida — não aceite.
              Peça o valor atualizado por escrito e negocie de novo.
            </p>
          )}
        </div>
      )}

      {avaliacao?.kind === "parcelado" && avaliacao.taxa !== null && (
        <div className="rounded-xl border-2 border-primary/30 bg-primary/5 p-4 text-sm">
          <p>
            No total, você pagaria <strong>{formatBRL(avaliacao.total)}</strong>
            {avaliacao.desconto > 0 ? (
              <>
                {" "}
                — <strong className="text-success">{formatBRL(avaliacao.desconto)} a menos</strong>{" "}
                do que a dívida de hoje. 🟢 Desconto mesmo parcelado: proposta boa.
              </>
            ) : (
              <>
                {" "}
                — {formatBRL(-avaliacao.desconto)} a mais do que a dívida de hoje. A proposta
                tem <strong>{fmtTaxa(avaliacao.taxa)} de juros ao mês embutidos</strong>.
              </>
            )}
          </p>
          {avaliacao.desconto <= 0 && <SeloTaxa taxa={avaliacao.taxa} />}
        </div>
      )}

      <DicasNegociacao />
    </div>
  );
}

// ---------- Peças compartilhadas ----------

function ResultadoCusto({
  original,
  total,
  juros,
  taxa,
  fraseTotal,
}: {
  original: number;
  total: number;
  juros: number;
  taxa: number;
  fraseTotal: string;
}) {
  const pctMais = original > 0 ? (juros / original) * 100 : 0;
  const pctJurosBarra = total > 0 ? Math.max(0, Math.min(100, (juros / total) * 100)) : 0;

  return (
    <div className="rounded-xl border-2 border-primary/30 bg-primary/5 p-4 text-sm">
      <p>{fraseTotal}</p>
      {juros > 0.005 ? (
        <>
          <p className="mt-1">
            São <strong className="text-danger">{formatBRL(juros)} de juros</strong> —{" "}
            {pctMais.toFixed(0)}% a mais. Isso equivale a{" "}
            <strong>{fmtTaxa(taxa)} ao mês</strong>.
          </p>
          <div
            className="mt-3 flex h-4 overflow-hidden rounded-full"
            role="img"
            aria-label={`Do total, ${formatBRL(original)} é o valor original e ${formatBRL(juros)} são juros.`}
          >
            <div className="bg-primary" style={{ width: `${100 - pctJurosBarra}%` }} />
            <div className="bg-danger" style={{ width: `${pctJurosBarra}%` }} />
          </div>
          <div className="mt-1 flex justify-between text-[11px] text-muted-foreground">
            <span>■ valor original</span>
            <span className="text-danger">■ juros</span>
          </div>
          <SeloTaxa taxa={taxa} />
        </>
      ) : (
        <p className="mt-1 text-success">
          <strong>Sem juros:</strong> você paga o mesmo que o valor à vista. 🎉
        </p>
      )}
    </div>
  );
}

function SeloTaxa({ taxa }: { taxa: number }) {
  const faixa = classificarTaxa(taxa);
  const info = FAIXA_INFO[faixa];
  return (
    <p className="mt-3 rounded-lg bg-background/70 p-2 text-xs">
      <strong>
        {info.emoji} {info.rotulo} ({fmtTaxa(taxa)} a.m.)
      </strong>{" "}
      <span className="text-muted-foreground">{info.conselho}</span>
    </p>
  );
}

const DICAS = [
  "Pergunte sempre o valor à vista primeiro — é a base para saber se o parcelado compensa.",
  "Peça toda proposta por escrito antes de aceitar (protocolo, boleto ou contrato).",
  "Não aceite parcela que não cabe no seu mês — acordo quebrado vira dívida pior.",
  "Juros acima de 5% ao mês? Pesquise um empréstimo mais barato para trocar de dívida.",
];

function DicasNegociacao() {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <h3 className="text-sm font-semibold">🤝 Como negociar melhor</h3>
      <ul className="mt-2 space-y-1.5 text-xs text-muted-foreground">
        {DICAS.map((d) => (
          <li key={d} className="flex gap-2">
            <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-success" />
            <span>{d}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function SalvarDivida({
  nomeSugestao,
  valor_total,
  parcela_mensal,
  taxa_juros_mensal,
  onDone,
}: {
  nomeSugestao: string;
  valor_total: number;
  parcela_mensal: number;
  taxa_juros_mensal: number;
  onDone: () => void;
}) {
  const [nome, setNome] = useState(nomeSugestao);
  const qc = useQueryClient();
  const mut = useMutation({
    mutationFn: () =>
      inserirDivida({ nome: nome.trim(), valor_total, parcela_mensal, taxa_juros_mensal }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.dividas });
      toast.success("Dívida adicionada à sua lista. 💙");
      onDone();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="rounded-xl border border-dashed border-border p-3">
      <div className="mb-2 text-xs font-medium text-muted-foreground">
        Quer acompanhar essa dívida no app? A taxa já vai preenchida.
      </div>
      <div className="flex items-end gap-2">
        <label className="block flex-1">
          <span className="block text-xs font-medium text-muted-foreground">Nome</span>
          <Input
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Ex.: Cartão, Loja de móveis"
            className="mt-1 h-11"
          />
        </label>
        <Button
          onClick={() => mut.mutate()}
          disabled={!nome.trim() || mut.isPending}
          className="h-11"
        >
          <Plus className="h-4 w-4" /> Adicionar
        </Button>
      </div>
    </div>
  );
}
