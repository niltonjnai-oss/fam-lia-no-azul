-- Execute no SQL Editor do Supabase (uma vez). CORREÇÃO DE FUSO.
--
-- O banco roda em UTC e o app é usado no Brasil. Das 21h à meia-noite (BRT),
-- `current_date` no banco já é o DIA SEGUINTE - então o gasto anotado à noite
-- nascia com a data de amanhã e sumia do "Gasto hoje" do painel. No fim do mês
-- era pior: o gasto do dia 31 às 22h contava como do mês seguinte.
--
-- Confirmado em 2026-08-06: current_date = 2026-08-07, Brasília = 2026-08-06.
--
-- Conserta os dois caminhos:
--   1. o DEFAULT de transacao.data (gasto normal, importação, "Chegou o
--      boleto" - tudo que não manda a data explícita);
--   2. as funções da compra parcelada, que datavam a transação na mão.
--
-- Idempotente: pode rodar mais de uma vez sem estragar nada.

-- ========== 1. "Hoje" em Brasília ==========

create or replace function public.hoje_brt()
returns date
language sql
stable
as $$ select (now() at time zone 'America/Sao_Paulo')::date $$;

grant execute on function public.hoje_brt() to authenticated;

-- ========== 2. Data padrão das transações ==========
-- Pega todo caminho que confia no default da coluna.

alter table public.transacao alter column data set default public.hoje_brt();

-- ========== 3. Funções da compra parcelada ==========
-- Mesmos corpos de compra_parcelada.sql, já com hoje_brt().

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

-- ========== 4. Conferência ==========
-- 'agora' tem que mostrar a data de hoje NO BRASIL.
-- 'transacao.data default' tem que citar hoje_brt.
-- Qualquer função listada com usa_current_date = true ainda precisa de ajuste.

select 'agora (brasilia)' as item, public.hoje_brt()::text as valor
union all
select 'transacao.data default',
       coalesce((select column_default from information_schema.columns
                  where table_schema='public' and table_name='transacao'
                    and column_name='data'), '(sem default)')
union all
select 'funcao ' || p.proname,
       (pg_get_functiondef(p.oid) ilike '%current_date%')::text || ' <- usa current_date?'
  from pg_proc p join pg_namespace n on n.oid = p.pronamespace
 where n.nspname = 'public'
   and p.proname in ('registrar_gasto_rapido','registrar_compra_parcelada',
                     'quitar_compra_parcelada','cancelar_compra_parcelada',
                     'editar_compra_parcelada','excluir_gasto_rapido')
order by 1;
