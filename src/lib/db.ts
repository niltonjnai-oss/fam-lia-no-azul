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
    .select("id, data, valor, descricao, subitem_id, mes_ref")
    .eq("data", data)
    .order("created_at", { ascending: false });
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
    .upsert(args, { onConflict: "subitem_id,mes_ref,user_id" });
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
}): Promise<void> {
  const { error } = await supabase
    .from("divida")
    .insert({ status: "Ativa", ...args });
  if (error) throw new Error(error.message);
}

export async function atualizarDivida(
  id: string,
  patch: Partial<Pick<Divida, "nome" | "valor_total" | "taxa_juros_mensal" | "parcela_mensal" | "status">>,
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
