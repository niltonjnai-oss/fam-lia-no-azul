-- Execute no SQL Editor do Supabase (uma vez), ANTES do deploy.
--
-- CARTÕES DE CRÉDITO — em que fatura a compra cai.
--
-- Sem saber o dia de FECHAMENTO, o app erra o mês de qualquer compra no
-- crédito: quem compra depois do fechamento só paga na fatura seguinte, o que
-- pode passar de 30 dias. E não dá pra deduzir o fechamento a partir do
-- vencimento - o Banco Central não define esse intervalo (é contrato entre
-- banco e cliente) e na prática ele varia de 5 a 10 dias por emissor.
--
-- Só tabela + RLS: o cálculo mora no cliente (src/lib/cartao.ts), porque a
-- tela precisa mostrar a fatura enquanto a pessoa digita.
--
-- Idempotente.

create table if not exists public.cartao (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  familia_id uuid not null default public.minha_familia_id(),
  nome text not null,
  dia_fechamento integer not null check (dia_fechamento between 1 and 31),
  dia_vencimento integer not null check (dia_vencimento between 1 and 31),
  ativo boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists cartao_familia_idx on public.cartao (familia_id);

alter table public.cartao enable row level security;

-- Sempre via familias_do_usuario() (SECURITY DEFINER): subquery direta em
-- familia_membro recria a recursão de RLS corrigida em
-- fix_rls_recursao_familia.sql.
drop policy if exists "familia acessa as proprias linhas" on public.cartao;
create policy "familia acessa as proprias linhas" on public.cartao
  for all to authenticated
  using (familia_id in (select public.familias_do_usuario()))
  with check (familia_id in (select public.familias_do_usuario()));

-- De propósito, NADA de cartao_id em transacao/compra_parcelada por enquanto:
-- guardar qual cartão pagou exigiria mexer de novo nas RPCs de gasto, e o
-- cartão aqui serve só pra CALCULAR a data da fatura. Quando existir relatório
-- por cartão, a coluna entra junto com a mudança das RPCs.

-- Conferência:
--   select nome, dia_fechamento, dia_vencimento, ativo from public.cartao;
