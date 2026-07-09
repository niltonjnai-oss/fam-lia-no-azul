-- Execute no SQL Editor do Supabase (uma vez).
-- Migração multi-tenant: isola os dados de cada família por user_id.
--
-- Antes desta migração o schema tinha uma pilha única de dados: lancamento,
-- renda, divida, transacao e reserva_config não tinham user_id, as views
-- somavam os dados de todos os usuários e o RLS (ligado, sem policies)
-- bloqueava leituras diretas. Este script:
--   1. adiciona user_id (default auth.uid()) às 5 tabelas pessoais
--   2. faz backfill dos dados existentes para o usuário dono (Nilton)
--   3. troca a unicidade de lancamento para (subitem_id, mes_ref, user_id)
--   4. catálogo híbrido: categoria/subitem com user_id NULL = globais (visíveis
--      a todos); linhas criadas por usuário ficam privadas dele
--   5. cria as policies RLS
--   6. marca as views como security_invoker (herdam o RLS de lancamento)
--   7. recria registrar_gasto_rapido com o novo alvo de conflito

-- ========== 1) user_id nas tabelas pessoais ==========

alter table public.lancamento     add column if not exists user_id uuid references auth.users(id) on delete cascade;
alter table public.renda          add column if not exists user_id uuid references auth.users(id) on delete cascade;
alter table public.divida         add column if not exists user_id uuid references auth.users(id) on delete cascade;
alter table public.transacao      add column if not exists user_id uuid references auth.users(id) on delete cascade;
alter table public.reserva_config add column if not exists user_id uuid references auth.users(id) on delete cascade;

-- ========== 2) Backfill dos dados existentes (dados de teste do dono) ==========

update public.lancamento     set user_id = 'e3338e28-cb40-46a1-99f5-26fed05fb0b6' where user_id is null;
update public.renda          set user_id = 'e3338e28-cb40-46a1-99f5-26fed05fb0b6' where user_id is null;
update public.divida         set user_id = 'e3338e28-cb40-46a1-99f5-26fed05fb0b6' where user_id is null;
update public.transacao      set user_id = 'e3338e28-cb40-46a1-99f5-26fed05fb0b6' where user_id is null;
update public.reserva_config set user_id = 'e3338e28-cb40-46a1-99f5-26fed05fb0b6' where user_id is null;

-- Default + NOT NULL (novas linhas recebem o uid de quem insere)
alter table public.lancamento     alter column user_id set default auth.uid();
alter table public.renda          alter column user_id set default auth.uid();
alter table public.divida         alter column user_id set default auth.uid();
alter table public.transacao      alter column user_id set default auth.uid();
alter table public.reserva_config alter column user_id set default auth.uid();

alter table public.lancamento     alter column user_id set not null;
alter table public.renda          alter column user_id set not null;
alter table public.divida         alter column user_id set not null;
alter table public.transacao     alter column user_id set not null;
alter table public.reserva_config alter column user_id set not null;

create index if not exists lancamento_user_idx     on public.lancamento (user_id);
create index if not exists renda_user_idx          on public.renda (user_id);
create index if not exists divida_user_idx         on public.divida (user_id);
create index if not exists transacao_user_idx      on public.transacao (user_id);
create index if not exists reserva_config_user_idx on public.reserva_config (user_id);

-- ========== 3) Unicidade de lancamento passa a incluir user_id ==========
-- (sem isso, duas famílias colidiriam no mesmo lançamento do mesmo subitem/mês)

do $$
declare c record;
begin
  for c in
    select conname from pg_constraint
    where conrelid = 'public.lancamento'::regclass and contype = 'u'
  loop
    execute format('alter table public.lancamento drop constraint %I', c.conname);
  end loop;
end $$;

alter table public.lancamento
  add constraint lancamento_subitem_mes_user_uniq unique (subitem_id, mes_ref, user_id);

-- ========== 4) Catálogo híbrido (categoria/subitem) ==========
-- Linhas existentes ficam com user_id NULL = template global visível a todos.
-- Linhas criadas por um usuário (tela Orçamento) recebem o uid dele e são privadas.

alter table public.categoria add column if not exists user_id uuid references auth.users(id) on delete cascade;
alter table public.subitem   add column if not exists user_id uuid references auth.users(id) on delete cascade;

alter table public.categoria alter column user_id set default auth.uid();
alter table public.subitem   alter column user_id set default auth.uid();

-- ========== 5) Policies RLS ==========

-- Tabelas pessoais: cada usuário só enxerga e mexe nas próprias linhas.
drop policy if exists "dono acessa as proprias linhas" on public.lancamento;
create policy "dono acessa as proprias linhas" on public.lancamento
  for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "dono acessa as proprias linhas" on public.renda;
create policy "dono acessa as proprias linhas" on public.renda
  for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "dono acessa as proprias linhas" on public.divida;
create policy "dono acessa as proprias linhas" on public.divida
  for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "dono acessa as proprias linhas" on public.transacao;
create policy "dono acessa as proprias linhas" on public.transacao
  for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "dono acessa as proprias linhas" on public.reserva_config;
create policy "dono acessa as proprias linhas" on public.reserva_config
  for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Catálogo: lê globais (user_id null) + os próprios; escreve só nos próprios.
drop policy if exists "le catalogo global e proprio" on public.categoria;
create policy "le catalogo global e proprio" on public.categoria
  for select to authenticated using (user_id is null or user_id = auth.uid());

drop policy if exists "cria categoria propria" on public.categoria;
create policy "cria categoria propria" on public.categoria
  for insert to authenticated with check (user_id = auth.uid());

drop policy if exists "edita categoria propria" on public.categoria;
create policy "edita categoria propria" on public.categoria
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "exclui categoria propria" on public.categoria;
create policy "exclui categoria propria" on public.categoria
  for delete to authenticated using (user_id = auth.uid());

drop policy if exists "le catalogo global e proprio" on public.subitem;
create policy "le catalogo global e proprio" on public.subitem
  for select to authenticated using (user_id is null or user_id = auth.uid());

drop policy if exists "cria subitem proprio" on public.subitem;
create policy "cria subitem proprio" on public.subitem
  for insert to authenticated with check (user_id = auth.uid());

drop policy if exists "edita subitem proprio" on public.subitem;
create policy "edita subitem proprio" on public.subitem
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "exclui subitem proprio" on public.subitem;
create policy "exclui subitem proprio" on public.subitem
  for delete to authenticated using (user_id = auth.uid());

-- ========== 6) Views herdam o RLS (security_invoker) ==========
-- Rodando como o usuário que consulta, o RLS de lancamento filtra as linhas —
-- os totais passam a ser só da família logada, sem misturar usuários.

alter view public.v_50_30_20      set (security_invoker = on);
alter view public.v_gastos_mes    set (security_invoker = on);
alter view public.v_resumo_mensal set (security_invoker = on);

-- ========== 7) registrar_gasto_rapido com o novo alvo de conflito ==========
-- Continua security invoker: roda como o usuário logado, então o default
-- auth.uid() preenche user_id e o RLS protege as linhas.

create or replace function public.registrar_gasto_rapido(
  p_subitem_id uuid, p_mes_ref text, p_valor numeric, p_descricao text default null::text
)
returns uuid
language plpgsql
as $function$
declare v_id uuid;
begin
  insert into transacao (subitem_id, mes_ref, valor, descricao)
  values (p_subitem_id, p_mes_ref, p_valor, p_descricao)
  returning id into v_id;

  insert into lancamento (subitem_id, mes_ref, custo_real)
  values (p_subitem_id, p_mes_ref, p_valor)
  on conflict (subitem_id, mes_ref, user_id)
  do update set custo_real = lancamento.custo_real + excluded.custo_real;

  return v_id;
end;
$function$;

-- excluir_gasto_rapido não precisa mudar: é security invoker, então o RLS
-- garante que só enxerga/altera as linhas do próprio usuário.
