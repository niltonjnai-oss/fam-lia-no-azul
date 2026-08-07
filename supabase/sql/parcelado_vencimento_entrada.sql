-- Execute no SQL Editor do Supabase (uma vez), ANTES do deploy.
--
-- COMPRA PARCELADA — data do 1º vencimento, entrada e uma linha por parcela.
--
-- O que estava errado: o app assumia que "comprou = já começou a pagar". Só
-- capturava o DIA do vencimento e espalhava as parcelas a partir do mês da
-- compra. Se o primeiro boleto vence 10/09 e a compra foi em agosto, o
-- orçamento inteiro ficava um mês deslocado - sobrava parcela em agosto e
-- faltava no último mês. No cartão é pior: compra depois do fechamento só cai
-- na fatura seguinte.
--
-- Agora quem manda é a DATA do primeiro vencimento (dd/mm/aaaa), e é dela que
-- saem o mês inicial e o dia. Mais duas mudanças:
--
--   * ENTRADA: R$ 180 com R$ 30 de entrada vira R$ 30 hoje + Nx de
--     (180-30)/N, e a dívida é 150 - não 180.
--   * UMA TRANSAÇÃO POR PARCELA, cada uma na data do seu vencimento. Antes só
--     o 1º mês tinha linha no feed; nos outros o valor aparecia no orçamento
--     sem nada explicando de onde veio. As parcelas futuras ficam de fora do
--     feed e do "Dias no Azul" por filtro no cliente (data <= hoje).
--
-- Depende de: compra_parcelada.sql e fix_data_fuso_brt.sql (já rodados).
-- Idempotente.

-- ========== 1. Colunas novas ==========

alter table public.compra_parcelada
  add column if not exists entrada numeric not null default 0,
  add column if not exists transacao_entrada_id uuid references public.transacao(id) on delete set null,
  add column if not exists primeiro_vencimento date;

comment on column public.compra_parcelada.entrada is
  'Valor pago à vista no ato da compra. O parcelado é (valor_total - entrada).';
comment on column public.compra_parcelada.primeiro_vencimento is
  'Data de vencimento da 1ª parcela. Define mes_inicial e dia_vencimento.';

-- Liga cada transação à compra que a gerou: é assim que o cancelamento acha
-- as N parcelas pra apagar (por descrição seria frágil).
alter table public.transacao
  add column if not exists compra_parcelada_id uuid
    references public.compra_parcelada(id) on delete set null;

create index if not exists transacao_compra_parcelada_idx
  on public.transacao (compra_parcelada_id);

-- ========== 2. Registrar ==========
-- Assinatura nova: sai p_mes_ref_inicial/p_dia_vencimento, entra
-- p_primeiro_vencimento (date) + p_entrada. p_mes_compra é o mês em que a
-- ENTRADA entra no orçamento (a compra pode ser em agosto e a 1ª parcela em
-- setembro).

drop function if exists public.registrar_compra_parcelada(text, numeric, integer, text, text, integer, boolean);
drop function if exists public.registrar_compra_parcelada(text, numeric, integer, text, text);
drop function if exists public.registrar_compra_parcelada(text, numeric, integer, text);

create or replace function public.registrar_compra_parcelada(
  p_descricao text,
  p_valor_total numeric,
  p_entrada numeric,
  p_parcelas integer,
  p_mes_compra text,
  p_primeiro_vencimento date,
  p_forma_pagamento text default null,
  p_criar_lembrete boolean default false
)
returns uuid
language plpgsql
set search_path to 'public'
as $$
declare
  v_nome text;
  v_subitem uuid;
  v_entrada numeric;
  v_financiado numeric;
  v_parcela numeric;
  v_divida uuid;
  v_conta uuid;
  v_compra uuid;
  v_transacao uuid;
  v_mes_inicial text;
  v_mes text;
  v_venc date;
  i integer;
begin
  if p_valor_total is null or p_valor_total <= 0 then
    raise exception 'Informe um valor maior que zero.';
  end if;
  if p_parcelas is null or p_parcelas < 2 then
    raise exception 'Informe 2 ou mais parcelas.';
  end if;
  if p_primeiro_vencimento is null then
    raise exception 'Informe a data do primeiro vencimento.';
  end if;
  if p_mes_compra !~ '^\d{4}-\d{2}$' then
    raise exception 'Mes da compra invalido (use AAAA-MM).';
  end if;

  v_entrada := greatest(0, coalesce(p_entrada, 0));
  if v_entrada >= p_valor_total then
    raise exception 'A entrada tem que ser menor que o valor total.';
  end if;

  v_nome := coalesce(nullif(btrim(p_descricao), ''), 'Compra parcelada');
  v_financiado := p_valor_total - v_entrada;
  v_parcela := round(v_financiado / p_parcelas, 2);
  v_mes_inicial := to_char(p_primeiro_vencimento, 'YYYY-MM');

  select id into v_subitem
    from public.subitem
   where nome = 'Parcelas de compras' and user_id is null
   limit 1;
  if v_subitem is null then
    raise exception 'Item "Parcelas de compras" nao encontrado — rode o SQL da Fase 1.';
  end if;

  -- A dívida é o que ficou DEVENDO: total menos entrada.
  insert into public.divida (
    nome, valor_total, taxa_juros_mensal, parcela_mensal, status, parcelas_total, parcelas_pagas
  )
  values (v_nome, v_financiado, 0, v_parcela, 'Ativa', p_parcelas, 0)
  returning id into v_divida;

  -- O recibo nasce antes das transações: elas apontam pra ele.
  insert into public.compra_parcelada (
    descricao, valor_total, entrada, parcelas, valor_parcela, mes_inicial,
    primeiro_vencimento, subitem_id, forma_pagamento,
    dia_vencimento, divida_id, meses_aplicados
  )
  values (
    v_nome, p_valor_total, v_entrada, p_parcelas, v_parcela, v_mes_inicial,
    p_primeiro_vencimento, v_subitem, p_forma_pagamento,
    extract(day from p_primeiro_vencimento)::int, v_divida, p_parcelas
  )
  returning id into v_compra;

  -- Uma parcela por mês, do 1º vencimento em diante. `+ i month` já resolve
  -- fim de mês (31/01 + 1 mês = 28/02).
  for i in 0 .. p_parcelas - 1 loop
    v_venc := (p_primeiro_vencimento + (i || ' month')::interval)::date;
    v_mes := to_char(v_venc, 'YYYY-MM');

    insert into public.lancamento (subitem_id, mes_ref, custo_previsto, custo_real)
    values (v_subitem, v_mes, 0, v_parcela)
    on conflict (subitem_id, mes_ref, familia_id)
    do update set custo_real = lancamento.custo_real + excluded.custo_real;

    insert into public.transacao (
      subitem_id, mes_ref, valor, descricao, data, forma_pagamento, compra_parcelada_id
    )
    values (
      v_subitem, v_mes, v_parcela,
      v_nome || ' (' || (i + 1) || '/' || p_parcelas || ')',
      v_venc, p_forma_pagamento, v_compra
    );
  end loop;

  -- A entrada é gasto de HOJE, no mês da compra - não do 1º vencimento.
  if v_entrada > 0 then
    insert into public.lancamento (subitem_id, mes_ref, custo_previsto, custo_real)
    values (v_subitem, p_mes_compra, 0, v_entrada)
    on conflict (subitem_id, mes_ref, familia_id)
    do update set custo_real = lancamento.custo_real + excluded.custo_real;

    insert into public.transacao (
      subitem_id, mes_ref, valor, descricao, data, forma_pagamento, compra_parcelada_id
    )
    values (
      v_subitem, p_mes_compra, v_entrada,
      v_nome || ' (entrada)',
      case when to_char(public.hoje_brt(), 'YYYY-MM') = p_mes_compra
           then public.hoje_brt()
           else to_date(p_mes_compra || '-01', 'YYYY-MM-DD') end,
      p_forma_pagamento, v_compra
    )
    returning id into v_transacao;

    update public.compra_parcelada
       set transacao_entrada_id = v_transacao
     where id = v_compra;
  end if;

  -- Boleto: lembrete no módulo Contas, com prazo na última parcela.
  if coalesce(p_criar_lembrete, false) then
    insert into public.conta_recorrente (
      nome, valor, dia_vencimento, subitem_id, ativo, mes_fim, origem
    )
    values (
      v_nome || ' (' || p_parcelas || 'x)',
      v_parcela,
      extract(day from p_primeiro_vencimento)::int,
      v_subitem,
      true,
      to_char((p_primeiro_vencimento + ((p_parcelas - 1) || ' month')::interval)::date, 'YYYY-MM'),
      'parcelamento'
    )
    returning id into v_conta;

    update public.compra_parcelada
       set conta_recorrente_id = v_conta
     where id = v_compra;
  end if;

  return v_compra;
end $$;

grant execute on function public.registrar_compra_parcelada(
  text, numeric, numeric, integer, text, date, text, boolean
) to authenticated;

-- ========== 3. Cancelar ==========
-- Agora apaga as N transações de uma vez pelo vínculo, mais a da entrada.

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

  -- Entrada: saiu do orçamento do mês da compra.
  if c.entrada > 0 and c.transacao_entrada_id is not null then
    update public.lancamento l
       set custo_real = greatest(0, l.custo_real - c.entrada)
      from public.transacao t
     where t.id = c.transacao_entrada_id
       and l.subitem_id = c.subitem_id
       and l.mes_ref = t.mes_ref;
  end if;

  -- Saldo lançado numa quitação antecipada, se houve.
  if c.saldo_quitacao > 0 and c.mes_quitacao is not null then
    update public.lancamento
       set custo_real = greatest(0, custo_real - c.saldo_quitacao)
     where subitem_id = c.subitem_id and mes_ref = c.mes_quitacao;
  end if;

  -- Todas as transações da compra (parcelas, entrada e quitação).
  delete from public.transacao where compra_parcelada_id = p_id;
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

-- ========== 4. Quitar ==========
-- Igual, mas agora também apaga as transações das parcelas futuras (elas
-- deixaram de existir).

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

  -- As parcelas futuras somem do feed junto com o valor.
  delete from public.transacao
   where compra_parcelada_id = p_id
     and mes_ref > p_mes_corrente;

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
         saldo_quitacao = case when v_transacao is null then 0 else v_saldo end,
         transacao_quitacao_id = v_transacao
   where id = p_id;
end $$;

grant execute on function public.quitar_compra_parcelada(uuid, text, boolean) to authenticated;

-- ========== 5. Editar ==========

drop function if exists public.editar_compra_parcelada(uuid, text, numeric, integer, integer, boolean);

create or replace function public.editar_compra_parcelada(
  p_id uuid,
  p_descricao text,
  p_valor_total numeric,
  p_entrada numeric,
  p_parcelas integer,
  p_primeiro_vencimento date,
  p_criar_lembrete boolean default false
)
returns uuid
language plpgsql
set search_path to 'public'
as $$
declare
  c public.compra_parcelada%rowtype;
  v_mes_compra text;
begin
  select * into c from public.compra_parcelada where id = p_id;
  if not found then
    raise exception 'Compra parcelada nao encontrada.';
  end if;

  -- Mês em que a entrada foi lançada (ou o mês da 1ª parcela, se não houve).
  v_mes_compra := coalesce(
    (select t.mes_ref from public.transacao t where t.id = c.transacao_entrada_id),
    c.mes_inicial
  );

  perform public.cancelar_compra_parcelada(p_id);

  return public.registrar_compra_parcelada(
    p_descricao,
    p_valor_total,
    p_entrada,
    p_parcelas,
    v_mes_compra,
    p_primeiro_vencimento,
    c.forma_pagamento,
    p_criar_lembrete
  );
end $$;

grant execute on function public.editar_compra_parcelada(
  uuid, text, numeric, numeric, integer, date, boolean
) to authenticated;

-- Conferência:
--   select descricao, valor_total, entrada, parcelas, valor_parcela,
--          primeiro_vencimento, mes_inicial, status
--     from public.compra_parcelada order by created_at desc;
