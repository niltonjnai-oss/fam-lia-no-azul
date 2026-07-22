import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  Wallet,
  Home,
  Car,
  GraduationCap,
  HeartPulse,
  Music,
  CreditCard,
  Sparkles,
  Plus,
  Trash2,
  CheckCircle2,
  PartyPopper,
  BellRing,
} from "lucide-react";

import {
  qk,
  mesAtual,
  fetchCategorias,
  fetchSubitens,
  fetchRenda,
  fetchResumoMensal,
  upsertLancamento,
  upsertRendaPorDescricao,
  inserirRenda,
  inserirDivida,
  fetchContasRecorrentes,
  inserirContaRecorrente,
  garantirFamilia,
  type Categoria,
  type Subitem,
} from "@/lib/db";
import { formatBRL } from "@/lib/format";
import { Checkbox } from "@/components/ui/checkbox";

export const Route = createFileRoute("/onboarding")({
  head: () => ({
    meta: [
      { title: "Comece aqui — Família no Azul" },
      {
        name: "description",
        content: "Em 1 minuto seu orçamento inicial fica montado.",
      },
    ],
  }),
  component: OnboardingPage,
});

// ----- Utilidades de parsing/lookup -----
const parseBR = (raw: string): number => {
  if (!raw) return 0;
  const n = Number(raw.replace(/\./g, "").replace(",", "."));
  return Number.isFinite(n) && n > 0 ? n : 0;
};

const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();

function findSubitemId(
  cats: Categoria[],
  subs: Subitem[],
  catName: string,
  subName: string,
): string | null {
  const cat = cats.find((c) => norm(c.nome) === norm(catName));
  if (!cat) return null;
  const target = norm(subName);
  const exact = subs.find(
    (s) => s.categoria_id === cat.id && norm(s.nome) === target,
  );
  if (exact) return exact.id;
  const partial = subs.find(
    (s) =>
      s.categoria_id === cat.id &&
      (norm(s.nome).includes(target) || target.includes(norm(s.nome))),
  );
  return partial?.id ?? null;
}

// ----- Catálogo de perguntas por passo -----
interface DespesaQ {
  label: string;
  categoria: string;
  subitem: string;
  /** Conta com dia de vencimento por natureza (boleto/mensalidade) — candidata
   *  a lembrete por email no passo final. Combustível, material escolar etc.
   *  não têm vencimento, então ficam de fora. */
  lembrete?: boolean;
}

const PASSO_MORADIA: DespesaQ[] = [
  { label: "Aluguel ou prestação da casa", categoria: "Moradia", subitem: "Prestação ou aluguel", lembrete: true },
  { label: "Conta de luz", categoria: "Moradia", subitem: "Conta de luz", lembrete: true },
  { label: "Água e esgoto", categoria: "Moradia", subitem: "Água", lembrete: true },
  { label: "Telefone / internet", categoria: "Moradia", subitem: "Telefone", lembrete: true },
  { label: "Condomínio", categoria: "Moradia", subitem: "Condomínio", lembrete: true },
];
const PASSO_TRANSPORTE: DespesaQ[] = [
  { label: "Financiamento do carro", categoria: "Transporte", subitem: "Pagamento do veículo", lembrete: true },
  { label: "Combustível", categoria: "Transporte", subitem: "Combustível" },
  { label: "Transporte público / táxi / app", categoria: "Transporte", subitem: "Transporte público" },
];
const PASSO_EDUCACAO: DespesaQ[] = [
  { label: "Mensalidade escolar", categoria: "Educação", subitem: "Mensalidade", lembrete: true },
  { label: "Transporte escolar", categoria: "Educação", subitem: "Transporte Escolar", lembrete: true },
  { label: "Material escolar", categoria: "Educação", subitem: "Material Escolar" },
];
const PASSO_SAUDE: DespesaQ[] = [
  { label: "Plano de saúde", categoria: "Seguro", subitem: "Saúde", lembrete: true },
  { label: "Outros seguros (vida, carro, casa)", categoria: "Seguro", subitem: "Outros", lembrete: true },
];
const PASSO_ESTILO: DespesaQ[] = [
  { label: "Streaming / música", categoria: "Entretenimento", subitem: "Plataformas de música" },
  { label: "Academia", categoria: "Cuidados Pessoais", subitem: "Academia", lembrete: true },
];

/** Todas as perguntas candidatas a lembrete, em ordem de exibição. */
const TODAS_LEMBRAVEIS: DespesaQ[] = [
  ...PASSO_MORADIA,
  ...PASSO_TRANSPORTE,
  ...PASSO_EDUCACAO,
  ...PASSO_SAUDE,
  ...PASSO_ESTILO,
].filter((q) => q.lembrete);

interface DividaInput {
  nome: string;
  valor_total: string;
  parcela_mensal: string;
  taxa_juros_mensal: string;
}

function OnboardingPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const mes = mesAtual();

  // ----- Estado -----
  const [step, setStep] = useState(0);
  const [rendas, setRendas] = useState<{ descricao: string; valor: string }[]>([
    { descricao: "Renda", valor: "" },
  ]);
  // valores por chave única "Categoria::Subitem"
  const [despesas, setDespesas] = useState<Record<string, string>>({});
  const [temFilhos, setTemFilhos] = useState<"sim" | "nao" | null>(null);
  const [temDividas, setTemDividas] = useState<"sim" | "nao" | null>(null);
  const [dividas, setDividas] = useState<DividaInput[]>([
    { nome: "", valor_total: "", parcela_mensal: "", taxa_juros_mensal: "" },
  ]);
  // Lembretes do passo final: escolha por conta ("Categoria::Subitem" → marcado/dia).
  // Sem entrada no mapa = marcado por padrão, dia vazio.
  const [lembretes, setLembretes] = useState<Record<string, { marcado: boolean; dia: string }>>(
    {},
  );

  // ----- Dados do schema -----
  const catsQ = useQuery({ queryKey: qk.categorias, queryFn: fetchCategorias });
  const subsQ = useQuery({ queryKey: qk.subitens, queryFn: fetchSubitens });
  const resumoQ = useQuery({ queryKey: qk.resumo(mes), queryFn: () => fetchResumoMensal(mes) });
  const rendaAtualQ = useQuery({ queryKey: qk.renda(mes), queryFn: () => fetchRenda(mes) });

  const cats = catsQ.data ?? [];
  const subs = subsQ.data ?? [];

  // ----- Passos -----
  type Passo = { id: string; titulo: string; Icon: typeof Home };
  const passos: Passo[] = useMemo(() => {
    const base: Passo[] = [
      { id: "welcome", titulo: "Comece aqui", Icon: Sparkles },
      { id: "renda", titulo: "Renda", Icon: Wallet },
      { id: "moradia", titulo: "Moradia", Icon: Home },
      { id: "transporte", titulo: "Transporte", Icon: Car },
      { id: "filhos", titulo: "Filhos e educação", Icon: GraduationCap },
    ];
    if (temFilhos === "sim") base.push({ id: "educacao", titulo: "Despesas com educação", Icon: GraduationCap });
    base.push({ id: "saude", titulo: "Saúde e seguros", Icon: HeartPulse });
    base.push({ id: "estilo", titulo: "Assinaturas e estilo de vida", Icon: Music });
    base.push({ id: "dividas", titulo: "Dívidas", Icon: CreditCard });
    if (temDividas === "sim") base.push({ id: "dividas_detalhe", titulo: "Suas dívidas", Icon: CreditCard });
    base.push({ id: "lembretes", titulo: "Lembretes", Icon: BellRing });
    base.push({ id: "resumo", titulo: "Tudo pronto", Icon: PartyPopper });
    return base;
  }, [temFilhos, temDividas]);

  const total = passos.length;
  const atual = passos[Math.min(step, total - 1)];
  const isLast = step === total - 1;

  // ----- Helpers de estado -----
  const setDespesa = (categoria: string, subitem: string, valor: string) =>
    setDespesas((d) => ({ ...d, [`${categoria}::${subitem}`]: valor }));
  const getDespesa = (categoria: string, subitem: string) =>
    despesas[`${categoria}::${subitem}`] ?? "";

  // ----- Persistência por passo (só salva o que tiver valor) -----
  const salvarMutation = useMutation({
    mutationFn: async (passoId: string) => {
      // Provisiona a família ANTES de qualquer gravação: sem isso, o 1º insert
      // de um usuário novo falha na RLS (a família criada pelo DEFAULT não é
      // vista pelo WITH CHECK no mesmo statement). Idempotente (get-or-create).
      await garantirFamilia();

      if (passoId === "renda") {
        const validas = rendas.filter((r) => parseBR(r.valor) > 0);
        if (validas.length === 0) return;
        // primeira "Renda" via upsert para não duplicar ao refazer
        const principal = validas.find((r) => norm(r.descricao) === "renda") ?? validas[0];
        await upsertRendaPorDescricao({
          mes_ref: mes,
          descricao: principal.descricao || "Renda",
          valor: parseBR(principal.valor),
        });
        // demais rendas: inserir apenas se descrição ainda não existir neste mês
        const existentes = new Set(
          (rendaAtualQ.data ?? []).map((r) => norm(r.descricao)),
        );
        existentes.add(norm(principal.descricao || "Renda"));
        for (const r of validas) {
          if (r === principal) continue;
          const desc = r.descricao || "Outra renda";
          if (existentes.has(norm(desc))) {
            await upsertRendaPorDescricao({
              mes_ref: mes,
              descricao: desc,
              valor: parseBR(r.valor),
            });
          } else {
            await inserirRenda({ mes_ref: mes, descricao: desc, valor: parseBR(r.valor) });
            existentes.add(norm(desc));
          }
        }
        qc.invalidateQueries({ queryKey: qk.renda(mes) });
        return;
      }

      const grupo: DespesaQ[] | null =
        passoId === "moradia"
          ? PASSO_MORADIA
          : passoId === "transporte"
            ? PASSO_TRANSPORTE
            : passoId === "educacao"
              ? PASSO_EDUCACAO
              : passoId === "saude"
                ? PASSO_SAUDE
                : passoId === "estilo"
                  ? PASSO_ESTILO
                  : null;

      if (grupo) {
        for (const q of grupo) {
          const valor = parseBR(getDespesa(q.categoria, q.subitem));
          if (valor <= 0) continue;
          const subId = findSubitemId(cats, subs, q.categoria, q.subitem);
          if (!subId) continue;
          await upsertLancamento({
            subitem_id: subId,
            mes_ref: mes,
            custo_previsto: valor,
            custo_real: 0,
          });
        }
        qc.invalidateQueries({ queryKey: qk.lancamentos(mes) });
        qc.invalidateQueries({ queryKey: qk.resumo(mes) });
        qc.invalidateQueries({ queryKey: qk.bloco503020(mes) });
        return;
      }

      if (passoId === "dividas_detalhe") {
        for (const d of dividas) {
          const valor_total = parseBR(d.valor_total);
          const parcela = parseBR(d.parcela_mensal);
          if (!d.nome.trim() || valor_total <= 0 || parcela <= 0) continue;
          await inserirDivida({
            nome: d.nome.trim(),
            valor_total,
            parcela_mensal: parcela,
            // campo pede % ao mês; o banco guarda decimal (5% → 0.05)
            taxa_juros_mensal: parseBR(d.taxa_juros_mensal) / 100,
          });
        }
        qc.invalidateQueries({ queryKey: qk.dividas });
        return;
      }

      if (passoId === "lembretes") {
        // Cria conta_recorrente pra cada conta marcada COM dia válido (1-31).
        // Marcada sem dia fica de fora — sem vencimento não há quando avisar.
        const aCriar = TODAS_LEMBRAVEIS.map((q) => {
          const key = `${q.categoria}::${q.subitem}`;
          const pref = lembretes[key] ?? { marcado: true, dia: "" };
          const valor = parseBR(getDespesa(q.categoria, q.subitem));
          const dia = Number.parseInt(pref.dia, 10);
          return { q, valor, dia, marcado: pref.marcado };
        }).filter(
          (x) => x.valor > 0 && x.marcado && Number.isInteger(x.dia) && x.dia >= 1 && x.dia <= 31,
        );
        if (aCriar.length === 0) return;

        // Dedupe por nome: refazer o onboarding não duplica contas já criadas.
        let nomesExistentes = new Set<string>();
        try {
          nomesExistentes = new Set((await fetchContasRecorrentes()).map((c) => norm(c.nome)));
        } catch {
          // sem bloqueio: na dúvida cria (usuário remove na tela Contas)
        }
        for (const { q, valor, dia } of aCriar) {
          if (nomesExistentes.has(norm(q.label))) continue;
          await inserirContaRecorrente({
            nome: q.label,
            valor,
            dia_vencimento: dia,
            // Conta nasce vinculada ao item do orçamento — o "Chegou o boleto"
            // não precisa perguntar a categoria depois.
            subitem_id: findSubitemId(cats, subs, q.categoria, q.subitem),
          });
        }
        qc.invalidateQueries({ queryKey: ["conta_recorrente"] });
      }
    },
    onError: (e) => {
      // Loga o erro real (RLS, constraint, rede) — a mensagem genérica na tela
      // escondia a causa. Ajuda a diagnosticar falhas de gravação no onboarding.
      console.error("[onboarding] falha ao salvar passo:", e);
    },
  });

  const avancar = async () => {
    try {
      await salvarMutation.mutateAsync(atual.id);
    } catch (e) {
      // erro mostrado abaixo
      return;
    }
    if (isLast) return;
    setStep((s) => Math.min(total - 1, s + 1));
  };

  const pular = () => {
    if (isLast) {
      navigate({ to: "/orcamento" });
      return;
    }
    setStep((s) => Math.min(total - 1, s + 1));
  };

  // ----- Render do conteúdo por passo -----
  const Icon = atual.Icon;
  const carregandoCatalogo = catsQ.isLoading || subsQ.isLoading;

  // Resumo para a tela final
  const rendaTotalCalc = rendas.reduce((a, r) => a + parseBR(r.valor), 0);
  const fixasTotalCalc = Object.values(despesas).reduce((a, v) => a + parseBR(v), 0);

  // Contas preenchidas que têm vencimento por natureza → candidatas a lembrete.
  const candidatosLembrete = TODAS_LEMBRAVEIS.filter(
    (q) => parseBR(getDespesa(q.categoria, q.subitem)) > 0,
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto flex min-h-screen max-w-md flex-col px-5 py-6">
        {/* topo */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <span className="text-sm font-bold">Família no Azul</span>
          </div>
          {!isLast && (
            <button
              onClick={pular}
              className="text-xs font-medium text-muted-foreground hover:text-foreground"
            >
              Pular
            </button>
          )}
        </div>

        {/* progresso */}
        <div className="mt-6 flex gap-1.5">
          {passos.map((_, i) => (
            <div
              key={i}
              className={[
                "h-1.5 flex-1 rounded-full transition-colors duration-300",
                i <= step ? "bg-primary" : "bg-muted",
              ].join(" ")}
            />
          ))}
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Passo {step + 1} de {total} — {atual.titulo}
        </p>

        {/* conteúdo */}
        <div className="flex flex-1 flex-col py-6">
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-primary/10 text-primary">
            <Icon className="h-7 w-7" />
          </div>

          {atual.id === "welcome" && (
            <>
              <h1 className="mt-5 text-2xl font-bold tracking-tight">
                Vamos montar o plano do seu mês
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Em 1 minuto, você conta pra gente o que <strong>entra</strong> e o que{" "}
                <strong>sai</strong> da sua casa num mês normal.
              </p>
              <div className="mt-4 rounded-xl bg-warning/15 p-3 text-sm text-warning-foreground">
                💡 <strong>Não precisa ser exato.</strong> Use valores aproximados — pra contas que
                variam (luz, água), chute a média. Você ajusta tudo depois.
              </div>
              <p className="mt-4 text-sm text-muted-foreground">
                No final, o app divide sua renda pelo método 50-30-20 e te mostra{" "}
                <strong>quanto dá pra gastar sem aperto</strong>.
              </p>
              <ul className="mt-5 space-y-2 text-sm">
                {["Sua renda", "Casa e contas fixas", "Transporte", "Saúde e seguros"].map((t) => (
                  <li key={t} className="flex items-center gap-2 text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4 text-success" /> {t}
                  </li>
                ))}
              </ul>
            </>
          )}

          {atual.id === "renda" && (
            <>
              <h1 className="mt-5 text-2xl font-bold tracking-tight">
                Quanto entra na sua casa por mês?
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Some salários, pensões e qualquer renda fixa do mês.
              </p>

              <div className="mt-5 space-y-3">
                {rendas.map((r, i) => (
                  <div key={i} className="space-y-2 rounded-xl border border-border bg-card p-3">
                    <label className="block">
                      <span className="block text-xs font-medium text-muted-foreground">
                        Descrição
                      </span>
                      <input
                        type="text"
                        value={r.descricao}
                        onChange={(e) => {
                          const v = e.target.value;
                          setRendas((arr) => arr.map((it, j) => (j === i ? { ...it, descricao: v } : it)));
                        }}
                        className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                        placeholder="Ex: Renda, Freelas, Aluguel recebido"
                      />
                    </label>
                    <MoneyInput
                      label="Valor mensal"
                      value={r.valor}
                      onChange={(v) =>
                        setRendas((arr) => arr.map((it, j) => (j === i ? { ...it, valor: v } : it)))
                      }
                    />
                    {rendas.length > 1 && (
                      <button
                        onClick={() => setRendas((arr) => arr.filter((_, j) => j !== i))}
                        className="inline-flex items-center gap-1 text-xs font-medium text-danger hover:underline"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> remover
                      </button>
                    )}
                  </div>
                ))}
                <button
                  onClick={() =>
                    setRendas((arr) => [...arr, { descricao: "Outra renda", valor: "" }])
                  }
                  className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-dashed border-border bg-background px-3 text-sm font-medium text-muted-foreground hover:border-primary hover:text-primary"
                >
                  <Plus className="h-4 w-4" /> adicionar outra renda
                </button>
              </div>
            </>
          )}

          {(["moradia", "transporte", "educacao", "saude", "estilo"] as const).includes(
            atual.id as never,
          ) && (
            <DespesasGrupo
              titulo={
                atual.id === "moradia"
                  ? "Conte sobre sua casa"
                  : atual.id === "transporte"
                    ? "E o transporte do dia a dia?"
                    : atual.id === "educacao"
                      ? "Quanto vai pra escola?"
                      : atual.id === "saude"
                        ? "Saúde e seguros"
                        : "Assinaturas e bem-estar"
              }
              descricao="É só o que você já sabe de cabeça. Campos em branco a gente pula. Pode ser um valor aproximado — vale a média dos últimos meses."
              perguntas={
                atual.id === "moradia"
                  ? PASSO_MORADIA
                  : atual.id === "transporte"
                    ? PASSO_TRANSPORTE
                    : atual.id === "educacao"
                      ? PASSO_EDUCACAO
                      : atual.id === "saude"
                        ? PASSO_SAUDE
                        : PASSO_ESTILO
              }
              getValor={getDespesa}
              setValor={setDespesa}
              carregando={carregandoCatalogo}
            />
          )}

          {atual.id === "filhos" && (
            <>
              <h1 className="mt-5 text-2xl font-bold tracking-tight">Tem filhos na escola?</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Se sim, vamos te perguntar sobre mensalidade, transporte e material.
              </p>
              <div className="mt-5 grid grid-cols-2 gap-3">
                {(["sim", "nao"] as const).map((opt) => (
                  <button
                    key={opt}
                    onClick={() => setTemFilhos(opt)}
                    className={[
                      "min-h-[64px] rounded-xl border px-3 py-3 text-sm font-semibold transition-colors",
                      temFilhos === opt
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-card hover:border-primary/40",
                    ].join(" ")}
                  >
                    {opt === "sim" ? "Sim, tenho" : "Não, ainda não"}
                  </button>
                ))}
              </div>
            </>
          )}

          {atual.id === "dividas" && (
            <>
              <h1 className="mt-5 text-2xl font-bold tracking-tight">
                Tem alguma dívida ativa?
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Cartão, empréstimo, financiamento — qualquer coisa que ainda esteja pagando.
              </p>
              <div className="mt-5 grid grid-cols-2 gap-3">
                {(["sim", "nao"] as const).map((opt) => (
                  <button
                    key={opt}
                    onClick={() => setTemDividas(opt)}
                    className={[
                      "min-h-[64px] rounded-xl border px-3 py-3 text-sm font-semibold transition-colors",
                      temDividas === opt
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-card hover:border-primary/40",
                    ].join(" ")}
                  >
                    {opt === "sim" ? "Sim, tenho" : "Hoje não tenho"}
                  </button>
                ))}
              </div>
            </>
          )}

          {atual.id === "dividas_detalhe" && (
            <>
              <h1 className="mt-5 text-2xl font-bold tracking-tight">Conte sobre suas dívidas</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Você pode adicionar quantas precisar. Tudo aparece na tela Dívidas depois.
              </p>
              <div className="mt-5 space-y-3">
                {dividas.map((d, i) => (
                  <div key={i} className="space-y-2 rounded-xl border border-border bg-card p-3">
                    <input
                      type="text"
                      value={d.nome}
                      onChange={(e) => {
                        const v = e.target.value;
                        setDividas((arr) => arr.map((it, j) => (j === i ? { ...it, nome: v } : it)));
                      }}
                      className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                      placeholder="Nome (ex: Cartão Nubank)"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <MoneyInput
                        label="Valor total"
                        value={d.valor_total}
                        onChange={(v) =>
                          setDividas((arr) => arr.map((it, j) => (j === i ? { ...it, valor_total: v } : it)))
                        }
                      />
                      <MoneyInput
                        label="Parcela mensal"
                        value={d.parcela_mensal}
                        onChange={(v) =>
                          setDividas((arr) => arr.map((it, j) => (j === i ? { ...it, parcela_mensal: v } : it)))
                        }
                      />
                    </div>
                    <label className="block">
                      <span className="block text-xs font-medium text-muted-foreground">
                        Juros mensal (%)
                      </span>
                      <input
                        type="text"
                        inputMode="decimal"
                        value={d.taxa_juros_mensal}
                        onChange={(e) => {
                          const v = e.target.value;
                          setDividas((arr) =>
                            arr.map((it, j) => (j === i ? { ...it, taxa_juros_mensal: v } : it)),
                          );
                        }}
                        className="tabular mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                        placeholder="0,00"
                      />
                    </label>
                    {dividas.length > 1 && (
                      <button
                        onClick={() => setDividas((arr) => arr.filter((_, j) => j !== i))}
                        className="inline-flex items-center gap-1 text-xs font-medium text-danger hover:underline"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> remover
                      </button>
                    )}
                  </div>
                ))}
                <button
                  onClick={() =>
                    setDividas((arr) => [
                      ...arr,
                      { nome: "", valor_total: "", parcela_mensal: "", taxa_juros_mensal: "" },
                    ])
                  }
                  className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-dashed border-border bg-background px-3 text-sm font-medium text-muted-foreground hover:border-primary hover:text-primary"
                >
                  <Plus className="h-4 w-4" /> adicionar outra dívida
                </button>
              </div>
            </>
          )}

          {atual.id === "lembretes" && (
            <>
              <h1 className="mt-5 text-2xl font-bold tracking-tight">
                Quer que a gente te lembre dessas contas?
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Avisamos por email <strong>2 dias antes e no dia do vencimento</strong>. É só
                marcar as contas e dizer o dia que cada uma vence.
              </p>

              {candidatosLembrete.length === 0 ? (
                <p className="mt-5 rounded-xl bg-muted/50 p-3 text-sm text-muted-foreground">
                  Você não preencheu contas fixas nos passos anteriores. Sem problema — dá pra
                  cadastrar depois na tela <strong>Contas</strong>.
                </p>
              ) : (
                <div className="mt-5 space-y-2">
                  {candidatosLembrete.map((q) => {
                    const key = `${q.categoria}::${q.subitem}`;
                    const pref = lembretes[key] ?? { marcado: true, dia: "" };
                    return (
                      <div
                        key={key}
                        className={`flex items-center gap-3 rounded-xl border p-3 transition-colors ${
                          pref.marcado ? "border-border bg-card" : "border-border/50 bg-muted/30 opacity-70"
                        }`}
                      >
                        <Checkbox
                          checked={pref.marcado}
                          onCheckedChange={(v) =>
                            setLembretes((m) => ({
                              ...m,
                              [key]: { ...pref, marcado: v === true },
                            }))
                          }
                          aria-label={`Receber lembrete de ${q.label}`}
                        />
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-sm font-medium">{q.label}</div>
                          <div className="tabular text-xs text-muted-foreground">
                            {formatBRL(parseBR(getDespesa(q.categoria, q.subitem)))}
                          </div>
                        </div>
                        <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          Dia
                          <input
                            type="text"
                            inputMode="numeric"
                            maxLength={2}
                            value={pref.dia}
                            onChange={(e) => {
                              const v = e.target.value.replace(/\D/g, "");
                              setLembretes((m) => ({ ...m, [key]: { ...pref, dia: v } }));
                            }}
                            disabled={!pref.marcado}
                            placeholder="10"
                            className="tabular h-10 w-14 rounded-lg border border-input bg-background px-2 text-center text-sm font-semibold outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
                          />
                        </label>
                      </div>
                    );
                  })}
                  <p className="text-[11px] text-muted-foreground">
                    Conta marcada sem o dia fica de fora — sem vencimento, não sabemos quando
                    avisar. Dá pra ajustar tudo depois na tela <strong>Contas</strong>.
                  </p>
                </div>
              )}
            </>
          )}

          {atual.id === "resumo" && (
            <>
              <h1 className="mt-5 text-2xl font-bold tracking-tight">
                Seu orçamento inicial está pronto!
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Esses valores são o seu <strong>plano</strong>. Agora é só anotar os gastos do dia a
                dia — o app compara o planejado com o que realmente saiu e te avisa se algo passar
                do combinado.
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                Cadastramos só as <strong>despesas fixas básicas</strong>. Para acrescentar
                mercado, lazer, contas variáveis e outras entradas, é só ir em{" "}
                <strong>Orçamento</strong>.
              </p>

              <div className="mt-5 rounded-2xl border border-primary/30 bg-primary/5 p-4">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-primary">
                  <Sparkles className="h-4 w-4" /> Resumo do mês
                </div>
                <dl className="tabular mt-3 grid grid-cols-1 gap-2 text-sm">
                  <Row label="Renda total" valor={Number(resumoQ.data?.total_real ?? 0) > 0 ? undefined : rendaTotalCalc}>
                    {formatBRL(
                      (rendaAtualQ.data ?? []).reduce((a, r) => a + Number(r.valor), 0) ||
                        rendaTotalCalc,
                    )}
                  </Row>
                  <Row label="Despesas fixas previstas">
                    {formatBRL(Number(resumoQ.data?.total_previsto ?? fixasTotalCalc))}
                  </Row>
                  <Row label="Saldo estimado" destaque>
                    {formatBRL(
                      ((rendaAtualQ.data ?? []).reduce((a, r) => a + Number(r.valor), 0) ||
                        rendaTotalCalc) -
                        Number(resumoQ.data?.total_previsto ?? fixasTotalCalc),
                    )}
                  </Row>
                </dl>
              </div>

              <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-success/15 px-3 py-1.5 text-xs font-semibold text-success">
                <PartyPopper className="h-4 w-4" />
                🏅 Primeira conquista: orçamento montado!
              </div>
            </>
          )}

          {salvarMutation.isError && (
            <div className="mt-3 rounded-lg border border-danger/30 bg-danger/5 p-3 text-xs text-danger">
              <p className="font-medium">Não foi possível salvar agora.</p>
              <p className="mt-1 break-words text-danger/80">
                {salvarMutation.error instanceof Error
                  ? salvarMutation.error.message
                  : "Verifique a conexão e tente de novo."}
              </p>
            </div>
          )}
        </div>

        {/* botões */}
        <div className="flex items-center gap-3">
          {step > 0 && !isLast && (
            <button
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              className="inline-flex h-12 items-center justify-center gap-1 rounded-xl border border-border bg-background px-4 text-sm font-semibold transition-colors hover:bg-muted"
            >
              <ArrowLeft className="h-4 w-4" /> Voltar
            </button>
          )}

          {isLast ? (
            <div className="flex w-full flex-col gap-2 sm:flex-row">
              <Link
                to="/app"
                className="inline-flex h-12 flex-1 items-center justify-center gap-1 rounded-xl border border-border bg-background px-4 text-sm font-semibold transition-colors hover:bg-muted"
              >
                Ver meu Painel
              </Link>
              <Link
                to="/orcamento"
                className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-glow"
              >
                Ir para o Orçamento <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          ) : (
            <button
              onClick={avancar}
              disabled={salvarMutation.isPending}
              className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-glow disabled:opacity-60"
            >
              {salvarMutation.isPending ? "Salvando…" : "Avançar"}
              <ArrowRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ---------- Subcomponentes ----------
function MoneyInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block">
      <span className="block text-xs font-medium text-muted-foreground">{label}</span>
      <div className="relative mt-1">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
          R$
        </span>
        <input
          type="text"
          inputMode="decimal"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="0,00"
          className="tabular w-full rounded-lg border border-input bg-background py-2 pl-9 pr-3 text-sm font-semibold outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
      </div>
    </label>
  );
}

function DespesasGrupo({
  titulo,
  descricao,
  perguntas,
  getValor,
  setValor,
  carregando,
}: {
  titulo: string;
  descricao: string;
  perguntas: DespesaQ[];
  getValor: (cat: string, sub: string) => string;
  setValor: (cat: string, sub: string, v: string) => void;
  carregando: boolean;
}) {
  return (
    <>
      <h1 className="mt-5 text-2xl font-bold tracking-tight">{titulo}</h1>
      <p className="mt-2 text-sm text-muted-foreground">{descricao}</p>
      <div className="mt-5 space-y-3">
        {perguntas.map((q) => (
          <MoneyInput
            key={`${q.categoria}::${q.subitem}`}
            label={q.label}
            value={getValor(q.categoria, q.subitem)}
            onChange={(v) => setValor(q.categoria, q.subitem, v)}
          />
        ))}
        {carregando && (
          <p className="text-xs text-muted-foreground">Carregando categorias…</p>
        )}
      </div>
    </>
  );
}

function Row({
  label,
  children,
  destaque,
}: {
  label: string;
  children: React.ReactNode;
  valor?: number;
  destaque?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className={destaque ? "text-base font-bold text-primary" : "font-semibold"}>
        {children}
      </dd>
    </div>
  );
}
