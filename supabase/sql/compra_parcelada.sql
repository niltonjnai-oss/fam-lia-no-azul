-- Execute no SQL Editor do Supabase (uma vez), ANTES do deploy da Fase 2.
--
-- COMPRA PARCELADA — Fase 2.
--
-- A Fase 1 (já no ar) espalhava a parcela pelos meses e criava a dívida, mas
-- nada ligava as duas coisas: não havia como desfazer, quitar ou corrigir uma
-- compra parcelada (apagar a dívida deixava os lançamentos órfãos nos meses).
--
-- Esta migração:
--   1. cria a tabela `compra_parcelada`, que guarda o "recibo" da operação
--      (mês inicial, valor da parcela, id da dívida, da transação e do
--      lembrete) — é ela que torna a operação reversível;
--   2. recria `registrar_compra_parcelada` gravando esse recibo e, quando for
--      boleto com dia de vencimento, criando o lembrete em Contas;
--   3. adiciona `cancelar_compra_parcelada`, `quitar_compra_parcelada` e
--      `editar_compra_parcelada`;
--   4. dá fim às contas recorrentes com prazo (`conta_recorrente.mes_fim`),
--      pra o alerta de vencimento parar sozinho na última parcela.
--
-- ATENÇÃO: compras parceladas registradas ANTES desta migração não têm recibo
-- e não vão aparecer na lista nova (nem dá pra desfazê-las pela tela).

-- ========== 0. "Hoje" em Brasília ==========
-- O banco roda em UTC: das 21h à meia-noite, `current_date` já é o dia
-- seguinte. Gasto anotado à noite ficava com a data de amanhã e sumia do
-- "Gasto hoje" do painel (e o do dia 31 iria pro mês seguinte).
-- Ver supabase/sql/fix_data_fuso_brt.sql, que também conserta o DEFAULT de
-- transacao.data (o caminho do gasto normal).

create or replace function public.hoje_brt()
returns date
language sql
stable
as $$ select (now() at time zone 'America/Sao_Paulo')::date $$;

grant execute on function public.hoje_brt() to authenticated;

-- ========== 1. Pré-requisito da Fase 1 ==========
-- O item global "Parcelas de compras" (fatia Reserva/Dívidas) tem que existir.

do $$
begin
  if not exists (
    select 1 from public.subitem where nome = 'Parcelas de compras' and user_id is null
  ) then
    raise exception 'Item global "Parcelas de compras" nao encontrado — rode primeiro o SQL da Fase 1.';
  end if;
end $$;

-- ========== 2. Contas recorrentes com prazo ==========
-- Um parcelamento é uma conta que termina. Sem isso, o lembrete de vencimento
-- ficaria avisando pra sempre depois da última parcela.

alter table public.conta_recorrente add column if not exists mes_fim text;
alter table public.conta_recorrente add column if not exists origem text;

comment on column public.conta_recorrente.mes_fim is
  'Último mês "YYYY-MM" em que a conta vence (parcelamentos). NULL = sem prazo.';

-- 'parcelamento' = a conta só LEMBRA do vencimento; o valor já entrou no
-- orçamento quando a compra foi registrada. Sem isso, o botão "Chegou o
-- boleto" lançaria a parcela uma segunda vez.
comment on column public.conta_recorrente.origem is
  'NULL = conta cadastrada pela pessoa. ''parcelamento'' = criada por uma compra parcelada.';

-- Desativa o que já passou do prazo. Roda todo dia às 7h50 BRT, pouco antes do
-- alerta das 8h — assim o alerta não precisa saber de prazo nenhum.
create or replace function public.encerrar_contas_com_prazo()
returns void
language sql
security definer
set search_path to 'public'
as $$
  update public.conta_recorrente
     set ativo = false
   where ativo
     and mes_fim is not null
     and mes_fim < to_char((now() at time zone 'America/Sao_Paulo')::date, 'YYYY-MM');
$$;

revoke execute on function public.encerrar_contas_com_prazo() from public, anon, authenticated;

do $$ begin
  perform cron.unschedule('encerrar-contas-com-prazo');
exception when others then null; end $$;

select cron.schedule('encerrar-contas-com-prazo', '50 10 * * *', $$select public.encerrar_contas_com_prazo()$$);

-- ========== 3. Tabela do recibo ==========

create table if not exists public.compra_parcelada (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  familia_id uuid not null default public.minha_familia_id(),
  descricao text not null,
  valor_total numeric not null check (valor_total > 0),
  parcelas integer not null check (parcelas between 2 and 120),
  valor_parcela numeric not null,
  mes_inicial text not null,
  subitem_id uuid not null references public.subitem(id),
  forma_pagamento text,
  dia_vencimento integer check (dia_vencimento between 1 and 31),
  divida_id uuid references public.divida(id) on delete set null,
  transacao_id uuid references public.transacao(id) on delete set null,
  conta_recorrente_id uuid references public.conta_recorrente(id) on delete set null,
  status text not null default 'ativa' check (status in ('ativa', 'quitada')),
  -- Quantos meses, a partir do inicial, ainda têm a parcela somada no
  -- orçamento. Nasce = parcelas e encolhe na quitação antecipada; é o que
  -- impede o cancelamento de descontar duas vezes os meses já removidos.
  meses_aplicados integer not null default 0,
  -- Rastro da quitação antecipada, pra ela também ser reversível.
  mes_quitacao text,
  saldo_quitacao numeric not null default 0,
  transacao_quitacao_id uuid references public.transacao(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists compra_parcelada_familia_idx on public.compra_parcelada (familia_id);

alter table public.compra_parcelada enable row level security;

-- Sempre via familias_do_usuario() (SECURITY DEFINER) — subquery direta em
-- familia_membro recria a recursão de RLS corrigida em fix_rls_recursao_familia.sql.
drop policy if exists "familia acessa as proprias linhas" on public.compra_parcelada;
create policy "familia acessa as proprias linhas" on public.compra_parcelada
  for all to authenticated
  using (familia_id in (select public.familias_do_usuario()))
  with check (familia_id in (select public.familias_do_usuario()));

-- ========== 4. Registrar ==========
-- Assinatura mudou (ganhou vencimento/lembrete), então a versão da Fase 1 sai.

drop function if exists public.registrar_compra_parcelada(text, numeric, integer, text, text);
-- Defensivo: se sobrasse uma variante antiga com outra aridade, o PostgREST
-- não saberia qual chamar.
drop function if exists public.registrar_compra_parcelada(text, numeric, integer, text);

create or replace function public.registrar_compra_parcelada(
  p_descricao text,
  p_valor_total numeric,
  p_parcelas integer,
  p_mes_ref_inicial text,
  p_forma_pagamento text default null,
  p_dia_vencimento integer default null,
  p_criar_lembrete boolean default false
)
returns uuid
language plpgsql
set search_path to 'public'
as $$
declare
  v_nome text;
  v_subitem uuid;
  v_parcela numeric;
  v_divida uuid;
  v_transacao uuid;
  v_conta uuid;
  v_compra uuid;
  v_inicio date;
  v_mes text;
  v_data date;
  i integer;
begin
  if p_valor_total is null or p_valor_total <= 0 then
    raise exception 'Informe um valor maior que zero.';
  end if;
  if p_parcelas is null or p_parcelas < 2 then
    raise exception 'Informe 2 ou mais parcelas.';
  end if;
  if p_mes_ref_inicial !~ '^\d{4}-\d{2}$' then
    raise exception 'Mes de referencia invalido (use AAAA-MM).';
  end if;

  v_nome := coalesce(nullif(btrim(p_descricao), ''), 'Compra parcelada');
  v_inicio := to_date(p_mes_ref_inicial || '-01', 'YYYY-MM-DD');
  v_parcela := round(p_valor_total / p_parcelas, 2);

  select id into v_subitem
    from public.subitem
   where nome = 'Parcelas de compras' and user_id is null
   limit 1;
  if v_subitem is null then
    raise exception 'Item "Parcelas de compras" nao encontrado — rode o SQL da Fase 1.';
  end if;

  -- A dívida existe pra acompanhar o saldo devedor no /dividas.
  insert into public.divida (
    nome, valor_total, taxa_juros_mensal, parcela_mensal, status, parcelas_total, parcelas_pagas
  )
  values (v_nome, p_valor_total, 0, v_parcela, 'Ativa', p_parcelas, 0)
  returning id into v_divida;

  -- A parcela entra no orçamento de cada mês, do mês da compra em diante.
  for i in 0 .. p_parcelas - 1 loop
    v_mes := to_char(v_inicio + (i || ' month')::interval, 'YYYY-MM');
    insert into public.lancamento (subitem_id, mes_ref, custo_previsto, custo_real)
    values (v_subitem, v_mes, 0, v_parcela)
    on conflict (subitem_id, mes_ref, familia_id)
    do update set custo_real = lancamento.custo_real + excluded.custo_real;
  end loop;

  -- Uma transação no mês inicial só pra a compra aparecer no feed do painel.
  -- Data em BRASÍLIA, não `current_date`: o banco é UTC, então das 21h à
  -- meia-noite `current_date` já é amanhã e o gasto sumiria do "Gasto hoje".
  v_data := case
    when to_char(public.hoje_brt(), 'YYYY-MM') = p_mes_ref_inicial then public.hoje_brt()
    else v_inicio
  end;
  insert into public.transacao (subitem_id, mes_ref, valor, descricao, data, forma_pagamento)
  values (
    v_subitem, p_mes_ref_inicial, v_parcela,
    v_nome || ' (1/' || p_parcelas || ')', v_data, p_forma_pagamento
  )
  returning id into v_transacao;

  -- Boleto com dia de vencimento: lembrete no módulo Contas, com prazo.
  if coalesce(p_criar_lembrete, false) and p_dia_vencimento between 1 and 31 then
    insert into public.conta_recorrente (
      nome, valor, dia_vencimento, subitem_id, ativo, mes_fim, origem
    )
    values (
      v_nome || ' (' || p_parcelas || 'x)',
      v_parcela,
      p_dia_vencimento,
      v_subitem,
      true,
      to_char(v_inicio + ((p_parcelas - 1) || ' month')::interval, 'YYYY-MM'),
      'parcelamento'
    )
    returning id into v_conta;
  end if;

  insert into public.compra_parcelada (
    descricao, valor_total, parcelas, valor_parcela, mes_inicial, subitem_id,
    forma_pagamento, dia_vencimento, divida_id, transacao_id, conta_recorrente_id,
    meses_aplicados
  )
  values (
    v_nome, p_valor_total, p_parcelas, v_parcela, p_mes_ref_inicial, v_subitem,
    p_forma_pagamento, p_dia_vencimento, v_divida, v_transacao, v_conta,
    p_parcelas
  )
  returning id into v_compra;

  return v_compra;
end $$;

grant execute on function public.registrar_compra_parcelada(
  text, numeric, integer, text, text, integer, boolean
) to authenticated;

-- ========== 5. Cancelar (desfazer por completo) ==========
-- Tira a parcela do orçamento de TODOS os meses e apaga dívida, transação e
-- lembrete. É o "isso nunca deveria ter sido registrado".

create or replace function public.cancelar_compra_parcelada(p_id uuid)
returns void
language plpgsql
set search_path to 'public'
as $$
declare
  c public.compra_parcelada%rowtype;
  v_mes text;
  i integer;
begin
  select * into c from public.compra_parcelada where id = p_id;
  if not found then
    raise exception 'Compra parcelada nao encontrada.';
  end if;

  -- Só os meses que ainda têm a parcela somada (a quitação antecipada já
  -- pode ter removido os futuros).
  for i in 0 .. c.meses_aplicados - 1 loop
    v_mes := to_char(to_date(c.mes_inicial || '-01', 'YYYY-MM-DD') + (i || ' month')::interval, 'YYYY-MM');
    update public.lancamento
       set custo_real = greatest(0, custo_real - c.valor_parcela)
     where subitem_id = c.subitem_id and mes_ref = v_mes;
  end loop;

  -- Desfaz também o saldo lançado na quitação antecipada, se houve.
  if c.saldo_quitacao > 0 and c.mes_quitacao is not null then
    update public.lancamento
       set custo_real = greatest(0, custo_real - c.saldo_quitacao)
     where subitem_id = c.subitem_id and mes_ref = c.mes_quitacao;
  end if;
  if c.transacao_quitacao_id is not null then
    delete from public.transacao where id = c.transacao_quitacao_id;
  end if;

  if c.transacao_id is not null then
    delete from public.transacao where id = c.transacao_id;
  end if;
  if c.conta_recorrente_id is not null then
    delete from public.conta_recorrente where id = c.conta_recorrente_id;
  end if;
  if c.divida_id is not null then
    delete from public.divida where id = c.divida_id;
  end if;

  delete from public.compra_parcelada where id = p_id;
end $$;

grant execute on function public.cancelar_compra_parcelada(uuid) to authenticated;

-- ========== 6. Quitar (paguei o resto adiantado) ==========
-- Mantém o histórico já pago, tira só as parcelas dos meses FUTUROS e encerra
-- a dívida. Com p_lancar_saldo, o valor quitado entra como gasto do mês
-- corrente (foi dinheiro que saiu de verdade).

create or replace function public.quitar_compra_parcelada(
  p_id uuid,
  p_mes_corrente text,
  p_lancar_saldo boolean default false
)
returns void
language plpgsql
set search_path to 'public'
as $$
declare
  c public.compra_parcelada%rowtype;
  v_mes text;
  v_mantidos integer := 0;
  v_restantes integer := 0;
  v_saldo numeric := 0;
  v_transacao uuid;
  i integer;
begin
  if p_mes_corrente !~ '^\d{4}-\d{2}$' then
    raise exception 'Mes corrente invalido (use AAAA-MM).';
  end if;

  select * into c from public.compra_parcelada where id = p_id;
  if not found then
    raise exception 'Compra parcelada nao encontrada.';
  end if;
  if c.status = 'quitada' then
    raise exception 'Esta compra ja esta quitada.';
  end if;

  for i in 0 .. c.meses_aplicados - 1 loop
    v_mes := to_char(to_date(c.mes_inicial || '-01', 'YYYY-MM-DD') + (i || ' month')::interval, 'YYYY-MM');
    if v_mes > p_mes_corrente then
      update public.lancamento
         set custo_real = greatest(0, custo_real - c.valor_parcela)
       where subitem_id = c.subitem_id and mes_ref = v_mes;
      v_restantes := v_restantes + 1;
    else
      v_mantidos := v_mantidos + 1;
    end if;
  end loop;

  v_saldo := round(c.valor_parcela * v_restantes, 2);

  if coalesce(p_lancar_saldo, false) and v_saldo > 0 then
    insert into public.lancamento (subitem_id, mes_ref, custo_previsto, custo_real)
    values (c.subitem_id, p_mes_corrente, 0, v_saldo)
    on conflict (subitem_id, mes_ref, familia_id)
    do update set custo_real = lancamento.custo_real + excluded.custo_real;

    insert into public.transacao (subitem_id, mes_ref, valor, descricao, data, forma_pagamento)
    values (
      c.subitem_id, p_mes_corrente, v_saldo,
      c.descricao || ' (quitação)',
      case when to_char(public.hoje_brt(), 'YYYY-MM') = p_mes_corrente
           then public.hoje_brt()
           else to_date(p_mes_corrente || '-01', 'YYYY-MM-DD') end,
      c.forma_pagamento
    )
    returning id into v_transacao;
  end if;

  if c.conta_recorrente_id is not null then
    update public.conta_recorrente set ativo = false where id = c.conta_recorrente_id;
  end if;
  if c.divida_id is not null then
    update public.divida
       set status = 'Quitada',
           parcelas_pagas = c.parcelas
     where id = c.divida_id;
  end if;

  update public.compra_parcelada
     set status = 'quitada',
         meses_aplicados = v_mantidos,
         mes_quitacao = p_mes_corrente,
         -- saldo_quitacao só marca o que foi LANÇADO como gasto (é isso que o
         -- cancelamento precisa desfazer); sem lançamento, fica zero.
         saldo_quitacao = case when v_transacao is null then 0 else v_saldo end,
         transacao_quitacao_id = v_transacao
   where id = p_id;
end $$;

grant execute on function public.quitar_compra_parcelada(uuid, text, boolean) to authenticated;

-- ========== 7. Editar (corrigir o que foi registrado errado) ==========
-- Desfaz e refaz com os valores novos, na mesma transação. O mês inicial e a
-- forma de pagamento são preservados; os meses todos são recalculados (é uma
-- correção, não uma renegociação).

create or replace function public.editar_compra_parcelada(
  p_id uuid,
  p_descricao text,
  p_valor_total numeric,
  p_parcelas integer,
  p_dia_vencimento integer default null,
  p_criar_lembrete boolean default false
)
returns uuid
language plpgsql
set search_path to 'public'
as $$
declare
  c public.compra_parcelada%rowtype;
begin
  select * into c from public.compra_parcelada where id = p_id;
  if not found then
    raise exception 'Compra parcelada nao encontrada.';
  end if;

  perform public.cancelar_compra_parcelada(p_id);

  return public.registrar_compra_parcelada(
    p_descricao,
    p_valor_total,
    p_parcelas,
    c.mes_inicial,
    c.forma_pagamento,
    p_dia_vencimento,
    p_criar_lembrete
  );
end $$;

grant execute on function public.editar_compra_parcelada(
  uuid, text, numeric, integer, integer, boolean
) to authenticated;

-- Conferência rápida depois de rodar:
--   select id, descricao, parcelas, valor_parcela, mes_inicial, status
--     from public.compra_parcelada order by created_at desc;
