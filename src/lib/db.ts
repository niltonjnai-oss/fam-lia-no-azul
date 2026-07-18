// Camada de acesso a dados tipada para o Supabase.
// Lê das tabelas e views criadas pelo schema. Não recalcula no front
// nada que o banco já calcula (diferenca, meses_para_quitar, reserva.*).

import { supabase } from "@/integrations/supabase/client";

// ---------- Tipos ----------
export type Classificacao = "Essencial" | "Estilo de Vida" | "Reserva/Dívidas";
export type StatusDivida = "Ativa" | "Quitada";

export interface Categoria {
  id: string;
  nome: string;
  ordem: number;
}

export interface Subitem {
  id: string;
  categoria_id: string;
  nome: string;
  classificacao: Classificacao;
  ordem: number;
  ativo: boolean;
}

export interface Lancamento {
  id: string;
  subitem_id: string;
  mes_ref: string;
  custo_previsto: number;
  custo_real: number;
  diferenca: number;
}

export interface Renda {
  id: string;
  mes_ref: string;
  descricao: string;
  valor: number;
}

export interface Divida {
  id: string;
  nome: string;
  valor_total: number;
  taxa_juros_mensal: number;
  parcela_mensal: number;
  status: StatusDivida;
  meses_para_quitar: number | null;
  parcelas_total: number | null;
  parcelas_pagas: number | null;
}

export interface ReservaConfig {
  id: string;
  custo_vida_mensal: number;
  multiplicador: number;
  valor_guardado: number;
  aporte_mensal: number;
  meta_reserva: number;
  falta_para_meta: number;
  progresso: number;
  meses_para_meta: number | null;
}

export interface ResumoMensal {
  mes_ref: string;
  total_previsto: number;
  total_real: number;
}

export interface Linha503020 {
  mes_ref: string;
  classificacao: Classificacao;
  previsto: number;
  realizado: number;
}

export interface GastosMes {
  mes_ref: string;
  total_previsto: number;
  total_real: number;
  total_comprometido: number;
}

// ---------- Helpers ----------
export const mesAtual = (): string => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
};

const MESES_PT = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

export const formatMes = (mesRef: string): string => {
  const [ano, mes] = mesRef.split("-");
  const idx = Number(mes) - 1;
  return `${MESES_PT[idx] ?? mes} de ${ano}`;
};

export const shiftMes = (mesRef: string, delta: number): string => {
  const [ano, mes] = mesRef.split("-").map(Number);
  const d = new Date(ano, mes - 1 + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
};

// ---------- Query keys ----------
export const qk = {
  categorias: ["categoria"] as const,
  subitens: ["subitem"] as const,
  lancamentos: (mes: string) => ["lancamento", mes] as const,
  renda: (mes: string) => ["renda", mes] as const,
  resumo: (mes: string) => ["v_resumo_mensal", mes] as const,
  bloco503020: (mes: string) => ["v_50_30_20", mes] as const,
  gastosMes: (mes: string) => ["v_gastos_mes", mes] as const,
  dividas: ["divida"] as const,
  reserva: ["reserva_config"] as const,
  transacoesHoje: (data: string) => ["transacao", "dia", data] as const,
  transacoesRecentes: ["transacao", "recentes"] as const,
};

export const hojeISO = (): string => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

export interface TransacaoDia {
  id: string;
  data: string;
  valor: number;
  descricao: string | null;
  subitem_id: string;
  mes_ref: string;
  banco: string | null;
}

// ---------- Importação de extrato ----------

/** Grava um gasto vindo do extrato preservando a data original da transação.
 *  Mesmo efeito do registrar_gasto_rapido (transacao + acumula custo_real do
 *  lancamento do mês), mas com `data` explícita. */
export async function registrarGastoImportado(args: {
  subitem_id: string;
  mes_ref: string;
  valor: number;
  descricao?: string | null;
  data: string; // YYYY-MM-DD
  banco?: string | null;
}): Promise<void> {
  const { error: tErr } = await supabase.from("transacao").insert({
    subitem_id: args.subitem_id,
    mes_ref: args.mes_ref,
    valor: args.valor,
    descricao: args.descricao ?? null,
    data: args.data,
    banco: args.banco ?? null,
  });
  if (tErr) throw new Error(tErr.message);

  // Acumula no lancamento do mês (cria se não existir).
  const { data: existente, error: selErr } = await supabase
    .from("lancamento")
    .select("id, custo_real")
    .eq("subitem_id", args.subitem_id)
    .eq("mes_ref", args.mes_ref)
    .maybeSingle();
  if (selErr) throw new Error(selErr.message);

  if (existente) {
    const { error } = await supabase
      .from("lancamento")
      .update({ custo_real: Number((existente as { custo_real: number }).custo_real) + args.valor })
      .eq("id", (existente as { id: string }).id);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await supabase.from("lancamento").insert({
      subitem_id: args.subitem_id,
      mes_ref: args.mes_ref,
      custo_real: args.valor,
    });
    if (error) throw new Error(error.message);
  }
}

/** Transações num intervalo de datas (para detectar duplicatas no import).
 *  Traz o banco também: como cada import guarda o banco de origem, a detecção
 *  de duplicata distingue mesma data+valor de bancos diferentes (gastos reais
 *  distintos, não duplicata). */
export async function fetchTransacoesPeriodo(
  de: string,
  ate: string,
): Promise<{ data: string; valor: number; banco: string | null }[]> {
  const { data, error } = await supabase
    .from("transacao")
    .select("data, valor, banco")
    .gte("data", de)
    .lte("data", ate);
  if (error) throw new Error(error.message);
  return (data ?? []) as { data: string; valor: number; banco: string | null }[];
}

// ---------- Contas recorrentes (vencimentos mensais com alerta) ----------

export interface ContaRecorrente {
  id: string;
  nome: string;
  valor: number;
  dia_vencimento: number;
  ativo: boolean;
  /** Item do orçamento onde o "Chegou o boleto" lança o gasto real. */
  subitem_id: string | null;
  /** "YYYY-MM" do último lançamento via "Chegou o boleto" — badge ✓ paga. */
  ultimo_mes_pago: string | null;
}

export async function fetchContasRecorrentes(): Promise<ContaRecorrente[]> {
  const { data, error } = await supabase
    .from("conta_recorrente")
    .select("id, nome, valor, dia_vencimento, ativo, subitem_id, ultimo_mes_pago")
    .order("dia_vencimento", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []) as ContaRecorrente[];
}

export async function inserirContaRecorrente(args: {
  nome: string;
  valor: number;
  dia_vencimento: number;
  subitem_id?: string | null;
}): Promise<void> {
  const { error } = await supabase
    .from("conta_recorrente")
    .insert({ ...args, subitem_id: args.subitem_id ?? null, ativo: true });
  if (error) throw new Error(error.message);
}

export async function atualizarContaRecorrente(
  id: string,
  patch: Partial<
    Pick<
      ContaRecorrente,
      "nome" | "valor" | "dia_vencimento" | "ativo" | "subitem_id" | "ultimo_mes_pago"
    >
  >,
): Promise<void> {
  const { error } = await supabase.from("conta_recorrente").update(patch).eq("id", id);
  if (error) throw new Error(error.message);
}

/** "Chegou o boleto": lança o valor REAL da conta como gasto do mês corrente
 *  (mesmo caminho da importação: transacao + acumula no lancamento, então o
 *  painel/50-30-20 recalculam na hora) e marca a conta como paga neste mês.
 *  Opcionalmente grava o vínculo escolhido e atualiza o valor padrão. */
export async function registrarPagamentoConta(args: {
  conta: ContaRecorrente;
  subitem_id: string;
  valor: number;
  atualizarValorPadrao: boolean;
}): Promise<void> {
  const mes = mesAtual();
  await registrarGastoImportado({
    subitem_id: args.subitem_id,
    mes_ref: mes,
    valor: args.valor,
    descricao: args.conta.nome,
    data: hojeISO(),
  });
  const patch: Partial<Pick<ContaRecorrente, "subitem_id" | "ultimo_mes_pago" | "valor">> = {
    ultimo_mes_pago: mes,
  };
  if (args.conta.subitem_id !== args.subitem_id) patch.subitem_id = args.subitem_id;
  if (args.atualizarValorPadrao) patch.valor = args.valor;
  await atualizarContaRecorrente(args.conta.id, patch);
}

export async function excluirContaRecorrente(id: string): Promise<void> {
  const { error } = await supabase.from("conta_recorrente").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

// ---------- Dias no Azul (streak de registro diário) ----------

/** Datas (YYYY-MM-DD) com pelo menos uma transação nos últimos `dias` dias.
 *  Base do contador "Dias no Azul" do painel. RLS garante que só vêm as do usuário. */
export async function fetchDiasComRegistro(dias = 60): Promise<string[]> {
  const desde = new Date(Date.now() - dias * 86_400_000);
  const desdeISO = `${desde.getFullYear()}-${String(desde.getMonth() + 1).padStart(2, "0")}-${String(desde.getDate()).padStart(2, "0")}`;
  const { data, error } = await supabase
    .from("transacao")
    .select("data")
    .gte("data", desdeISO);
  if (error) throw new Error(error.message);
  return Array.from(new Set((data ?? []).map((r) => (r as { data: string }).data)));
}

// ---------- Modo Casal (família compartilhada) ----------

export interface MembroFamilia {
  user_id: string;
  email: string;
  nome: string;
  papel: "titular" | "conjuge";
}

export async function fetchMinhaFamiliaMembros(): Promise<MembroFamilia[]> {
  const { data, error } = await supabase.rpc("minha_familia_membros");
  if (error) throw new Error(error.message);
  return (data ?? []) as MembroFamilia[];
}

export async function cancelarConvite(
  conviteId: string,
): Promise<{ ok: true } | { error: string }> {
  const { data, error } = await supabase.rpc("cancelar_convite_familia", {
    p_convite_id: conviteId,
  });
  if (error) throw new Error(error.message);
  return data as { ok: true } | { error: string };
}

export async function removerMembro(
  userId: string,
): Promise<{ ok: true } | { error: string }> {
  const { data, error } = await supabase.rpc("remover_membro_familia", {
    p_user_id: userId,
  });
  if (error) throw new Error(error.message);
  return data as { ok: true } | { error: string };
}

export interface ConviteFamilia {
  id: string;
  email: string;
  expira_em: string;
}

export async function fetchConvitesPendentes(): Promise<ConviteFamilia[]> {
  const { data, error } = await supabase
    .from("convite_familia")
    .select("id, email, expira_em")
    .eq("aceito", false)
    .gt("expira_em", new Date().toISOString());
  if (error) throw new Error(error.message);
  return (data ?? []) as ConviteFamilia[];
}

/** Cria o convite no banco (RPC) — o envio do e-mail é feito à parte, pela
 *  rota /api/familia/convidar (precisa da service role para disparar). */
export async function criarConvite(
  email: string,
): Promise<{ token: string; email: string } | { error: string }> {
  const { data, error } = await supabase.rpc("criar_convite_familia", { p_email: email });
  if (error) throw new Error(error.message);
  return data as { token: string; email: string } | { error: string };
}

export async function infoConvite(
  token: string,
): Promise<{ valido: true; email: string } | { valido: false; motivo: string }> {
  const { data, error } = await supabase.rpc("info_convite_familia", { p_token: token });
  if (error) throw new Error(error.message);
  return data as { valido: true; email: string } | { valido: false; motivo: string };
}

export async function aceitarConvite(
  token: string,
): Promise<{ ok: true } | { error: string }> {
  const { data, error } = await supabase.rpc("aceitar_convite_familia", { p_token: token });
  if (error) throw new Error(error.message);
  return data as { ok: true } | { error: string };
}

// ---------- Assinatura (kiwify_pedidos via get_minha_assinatura) ----------

export interface MinhaAssinatura {
  plano: string;
  data_compra: string;
  data_vencimento: string;
  ativa: boolean;
}

/** Lê a assinatura real do usuário logado (RPC security definer que consulta
 *  kiwify_pedidos pelo email). Retorna null se não houver compra registrada. */
export async function fetchMinhaAssinatura(): Promise<MinhaAssinatura | null> {
  const { data, error } = await supabase.rpc("get_minha_assinatura");
  if (error) throw new Error(error.message);
  const rows = (data ?? []) as MinhaAssinatura[];
  return rows[0] ?? null;
}

export async function fetchTransacoesDoDia(data: string): Promise<TransacaoDia[]> {
  const { data: rows, error } = await supabase
    .from("transacao")
    .select("id, data, valor, descricao, subitem_id, mes_ref, banco")
    .eq("data", data)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (rows ?? []) as TransacaoDia[];
}

/** Últimos lançamentos da família (qualquer dia), pro feed do painel.
 *  RLS garante que só vêm os da família do usuário. */
export async function fetchTransacoesRecentes(limite = 5): Promise<TransacaoDia[]> {
  const { data: rows, error } = await supabase
    .from("transacao")
    .select("id, data, valor, descricao, subitem_id, mes_ref, banco")
    .order("created_at", { ascending: false })
    .limit(limite);
  if (error) throw new Error(error.message);
  return (rows ?? []) as TransacaoDia[];
}

export async function registrarGasto(args: {
  subitem_id: string;
  mes_ref: string;
  valor: number;
  descricao?: string | null;
}): Promise<void> {
  const { error } = await supabase.rpc("registrar_gasto_rapido", {
    p_subitem_id: args.subitem_id,
    p_mes_ref: args.mes_ref,
    p_valor: args.valor,
    p_descricao: args.descricao ?? null,
  });
  if (error) throw new Error(error.message);
}

export async function excluirGastoRapido(id: string): Promise<void> {
  const { error } = await supabase.rpc("excluir_gasto_rapido", {
    p_transacao_id: id,
  });
  if (error) throw new Error(error.message);
}

export async function fetchSubitemOutros(categoriaId: string): Promise<string | null> {
  const { data, error } = await supabase
    .from("subitem")
    .select("id")
    .eq("categoria_id", categoriaId)
    .eq("nome", "Outros")
    .maybeSingle();
  if (error) throw new Error(error.message);
  return (data as { id: string } | null)?.id ?? null;
}

// ---------- Fetchers ----------
function throwIf<T>(data: T | null, error: { message: string } | null): T {
  if (error) throw new Error(error.message);
  return (data ?? ([] as unknown as T)) as T;
}

export async function fetchCategorias(): Promise<Categoria[]> {
  const { data, error } = await supabase
    .from("categoria")
    .select("id, nome, ordem")
    .order("ordem", { ascending: true });
  return throwIf<Categoria[]>(data as Categoria[] | null, error);
}

export async function fetchSubitens(): Promise<Subitem[]> {
  const { data, error } = await supabase
    .from("subitem")
    .select("id, categoria_id, nome, classificacao, ordem, ativo")
    .eq("ativo", true)
    .order("ordem", { ascending: true });
  return throwIf<Subitem[]>(data as Subitem[] | null, error);
}

export async function fetchLancamentos(mes: string): Promise<Lancamento[]> {
  const { data, error } = await supabase
    .from("lancamento")
    .select("id, subitem_id, mes_ref, custo_previsto, custo_real, diferenca")
    .eq("mes_ref", mes);
  return throwIf<Lancamento[]>(data as Lancamento[] | null, error);
}

export async function fetchRenda(mes: string): Promise<Renda[]> {
  const { data, error } = await supabase
    .from("renda")
    .select("id, mes_ref, descricao, valor")
    .eq("mes_ref", mes);
  return throwIf<Renda[]>(data as Renda[] | null, error);
}

export async function fetchGastosMes(mes: string): Promise<GastosMes | null> {
  const { data, error } = await supabase
    .from("v_gastos_mes")
    .select("mes_ref, total_previsto, total_real, total_comprometido")
    .eq("mes_ref", mes)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return (data as GastosMes | null) ?? null;
}

export async function fetchResumoMensal(mes: string): Promise<ResumoMensal | null> {
  const { data, error } = await supabase
    .from("v_resumo_mensal")
    .select("mes_ref, total_previsto, total_real")
    .eq("mes_ref", mes)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return (data as ResumoMensal | null) ?? null;
}

export async function fetch503020(mes: string): Promise<Linha503020[]> {
  const { data, error } = await supabase
    .from("v_50_30_20")
    .select("mes_ref, classificacao, previsto, realizado")
    .eq("mes_ref", mes);
  return throwIf<Linha503020[]>(data as Linha503020[] | null, error);
}

export async function fetchDividas(): Promise<Divida[]> {
  const { data, error } = await supabase
    .from("divida")
    .select(
      "id, nome, valor_total, taxa_juros_mensal, parcela_mensal, status, meses_para_quitar",
    )
    .order("created_at", { ascending: true });
  return throwIf<Divida[]>(data as Divida[] | null, error);
}

export async function fetchReservaConfig(): Promise<ReservaConfig | null> {
  const { data, error } = await supabase
    .from("reserva_config")
    .select(
      "id, custo_vida_mensal, multiplicador, valor_guardado, aporte_mensal, meta_reserva, falta_para_meta, progresso, meses_para_meta",
    )
    .limit(1)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return (data as ReservaConfig | null) ?? null;
}

// ---------- Mutations ----------
export async function upsertLancamento(args: {
  subitem_id: string;
  mes_ref: string;
  custo_previsto: number;
  custo_real: number;
}): Promise<void> {
  const { error } = await supabase
    .from("lancamento")
    .upsert(args, { onConflict: "subitem_id,mes_ref,familia_id" });
  if (error) throw new Error(error.message);
}

export async function inserirCategoria(nome: string, ordem: number): Promise<void> {
  const { error } = await supabase.from("categoria").insert({ nome, ordem });
  if (error) throw new Error(error.message);
}

export async function inserirSubitem(args: {
  categoria_id: string;
  nome: string;
  classificacao: Classificacao;
  ordem: number;
}): Promise<void> {
  const { error } = await supabase
    .from("subitem")
    .insert({ ...args, ativo: true });
  if (error) throw new Error(error.message);
}

export async function inserirRenda(args: {
  mes_ref: string;
  descricao: string;
  valor: number;
}): Promise<void> {
  const { error } = await supabase.from("renda").insert(args);
  if (error) throw new Error(error.message);
}

/** Atualiza (ou insere) uma renda no mês para uma descrição específica.
 *  Sem unique constraint no schema, fazemos select+update / insert. */
export async function upsertRendaPorDescricao(args: {
  mes_ref: string;
  descricao: string;
  valor: number;
}): Promise<void> {
  const { data, error } = await supabase
    .from("renda")
    .select("id")
    .eq("mes_ref", args.mes_ref)
    .eq("descricao", args.descricao)
    .limit(1);
  if (error) throw new Error(error.message);
  if (data && data.length > 0) {
    const { error: upErr } = await supabase
      .from("renda")
      .update({ valor: args.valor })
      .eq("id", (data[0] as { id: string }).id);
    if (upErr) throw new Error(upErr.message);
  } else {
    const { error: insErr } = await supabase.from("renda").insert(args);
    if (insErr) throw new Error(insErr.message);
  }
}

export async function inserirDivida(args: {
  nome: string;
  valor_total: number;
  taxa_juros_mensal: number;
  parcela_mensal: number;
  status?: StatusDivida;
  parcelas_total?: number | null;
  parcelas_pagas?: number | null;
}): Promise<void> {
  const { error } = await supabase
    .from("divida")
    .insert({ status: "Ativa", ...args });
  if (error) throw new Error(error.message);
}

export async function atualizarDivida(
  id: string,
  patch: Partial<
    Pick<
      Divida,
      | "nome"
      | "valor_total"
      | "taxa_juros_mensal"
      | "parcela_mensal"
      | "status"
      | "parcelas_total"
      | "parcelas_pagas"
    >
  >,
): Promise<void> {
  const { error } = await supabase.from("divida").update(patch).eq("id", id);
  if (error) throw new Error(error.message);
}

export async function excluirDivida(id: string): Promise<void> {
  const { error } = await supabase.from("divida").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export async function atualizarReservaConfig(
  id: string,
  patch: Partial<Pick<ReservaConfig, "custo_vida_mensal" | "multiplicador" | "valor_guardado" | "aporte_mensal">>,
): Promise<void> {
  const { error } = await supabase.from("reserva_config").update(patch).eq("id", id);
  if (error) throw new Error(error.message);
}
