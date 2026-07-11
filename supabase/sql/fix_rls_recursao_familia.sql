-- Execute no SQL Editor do Supabase (uma vez). CORREÇÃO do modo_casal.sql.
--
-- Bug: as policies criadas pelo modo_casal.sql consultavam familia_membro em
-- subquery, e a própria policy de familia_membro também — recursão infinita
-- de RLS ("infinite recursion detected"). Efeito: TODAS as leituras do app
-- falhavam (painel "vazio", convites não listavam). Nenhum dado foi perdido.
--
-- Correção padrão: a subconsulta vira uma função SECURITY DEFINER (ignora o
-- RLS de familia_membro, quebrando o ciclo) e todas as policies passam a
-- usá-la.

-- Função de leitura das famílias do usuário logado (não cria nada).
create or replace function public.familias_do_usuario()
returns setof uuid
language sql
stable
security definer
set search_path to 'public'
as $$
  select familia_id from public.familia_membro where user_id = auth.uid();
$$;

revoke execute on function public.familias_do_usuario() from public, anon;
grant execute on function public.familias_do_usuario() to authenticated;

-- ========== Recria todas as policies usando a função ==========

drop policy if exists "membros veem a propria familia" on public.familia;
create policy "membros veem a propria familia" on public.familia
  for select to authenticated using (id in (select public.familias_do_usuario()));

drop policy if exists "membros veem os colegas de familia" on public.familia_membro;
create policy "membros veem os colegas de familia" on public.familia_membro
  for select to authenticated using (familia_id in (select public.familias_do_usuario()));

drop policy if exists "membros veem convites da propria familia" on public.convite_familia;
create policy "membros veem convites da propria familia" on public.convite_familia
  for select to authenticated using (familia_id in (select public.familias_do_usuario()));

drop policy if exists "familia acessa as proprias linhas" on public.lancamento;
create policy "familia acessa as proprias linhas" on public.lancamento
  for all to authenticated
  using (familia_id in (select public.familias_do_usuario()))
  with check (familia_id in (select public.familias_do_usuario()));

drop policy if exists "familia acessa as proprias linhas" on public.renda;
create policy "familia acessa as proprias linhas" on public.renda
  for all to authenticated
  using (familia_id in (select public.familias_do_usuario()))
  with check (familia_id in (select public.familias_do_usuario()));

drop policy if exists "familia acessa as proprias linhas" on public.divida;
create policy "familia acessa as proprias linhas" on public.divida
  for all to authenticated
  using (familia_id in (select public.familias_do_usuario()))
  with check (familia_id in (select public.familias_do_usuario()));

drop policy if exists "familia acessa as proprias linhas" on public.transacao;
create policy "familia acessa as proprias linhas" on public.transacao
  for all to authenticated
  using (familia_id in (select public.familias_do_usuario()))
  with check (familia_id in (select public.familias_do_usuario()));

drop policy if exists "familia acessa as proprias linhas" on public.reserva_config;
create policy "familia acessa as proprias linhas" on public.reserva_config
  for all to authenticated
  using (familia_id in (select public.familias_do_usuario()))
  with check (familia_id in (select public.familias_do_usuario()));

drop policy if exists "familia acessa as proprias linhas" on public.conta_recorrente;
create policy "familia acessa as proprias linhas" on public.conta_recorrente
  for all to authenticated
  using (familia_id in (select public.familias_do_usuario()))
  with check (familia_id in (select public.familias_do_usuario()));

drop policy if exists "le catalogo global e da familia" on public.categoria;
create policy "le catalogo global e da familia" on public.categoria
  for select to authenticated using (
    user_id is null or familia_id in (select public.familias_do_usuario())
  );

drop policy if exists "cria categoria da familia" on public.categoria;
create policy "cria categoria da familia" on public.categoria
  for insert to authenticated with check (familia_id in (select public.familias_do_usuario()));

drop policy if exists "edita categoria da familia" on public.categoria;
create policy "edita categoria da familia" on public.categoria
  for update to authenticated
  using (familia_id in (select public.familias_do_usuario()))
  with check (familia_id in (select public.familias_do_usuario()));

drop policy if exists "exclui categoria da familia" on public.categoria;
create policy "exclui categoria da familia" on public.categoria
  for delete to authenticated using (familia_id in (select public.familias_do_usuario()));

drop policy if exists "le catalogo global e da familia" on public.subitem;
create policy "le catalogo global e da familia" on public.subitem
  for select to authenticated using (
    user_id is null or familia_id in (select public.familias_do_usuario())
  );

drop policy if exists "cria subitem da familia" on public.subitem;
create policy "cria subitem da familia" on public.subitem
  for insert to authenticated with check (familia_id in (select public.familias_do_usuario()));

drop policy if exists "edita subitem da familia" on public.subitem;
create policy "edita subitem da familia" on public.subitem
  for update to authenticated
  using (familia_id in (select public.familias_do_usuario()))
  with check (familia_id in (select public.familias_do_usuario()));

drop policy if exists "exclui subitem da familia" on public.subitem;
create policy "exclui subitem da familia" on public.subitem
  for delete to authenticated using (familia_id in (select public.familias_do_usuario()));
