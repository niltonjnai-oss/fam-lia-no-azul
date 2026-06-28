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
  dividas: ["divida"] as const,
  reserva: ["reserva_config"] as const,
};

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
    .upsert(args, { onConflict: "subitem_id,mes_ref" });
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
