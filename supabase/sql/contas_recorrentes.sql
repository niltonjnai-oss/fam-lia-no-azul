-- Execute no SQL Editor do Supabase (uma vez).
-- Contas recorrentes (tela /contas) + alerta diário por email:
-- todo dia às 8h (Brasília) avisa quem tem conta vencendo HOJE ou EM 2 DIAS,
-- num único email por usuário, via /api/public/emails/cron (template contas-vencendo).
--
-- Pré-requisitos (já feitos): pg_cron + pg_net habilitados e o segredo
-- 'email_cron_secret' no Vault.

-- ========== Tabela + RLS ==========

create table if not exists public.conta_recorrente (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  nome text not null,
  valor numeric not null default 0,
  dia_vencimento integer not null check (dia_vencimento between 1 and 31),
  ativo boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists conta_recorrente_user_idx on public.conta_recorrente (user_id);

alter table public.conta_recorrente enable row level security;

drop policy if exists "dono acessa as proprias linhas" on public.conta_recorrente;
create policy "dono acessa as proprias linhas" on public.conta_recorrente
  for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ========== Função de alerta ==========
-- Dia de vencimento maior que o último dia do mês (ex.: 31 em fevereiro)
-- conta como vencendo no último dia do mês.

create or replace function public.enviar_alerta_contas()
returns void
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  u record;
  secret text;
  hoje date := (now() at time zone 'America/Sao_Paulo')::date;
  em2 date := (now() at time zone 'America/Sao_Paulo')::date + 2;
  ult_hoje int := extract(day from (date_trunc('month', (now() at time zone 'America/Sao_Paulo')::date) + interval '1 month - 1 day'))::int;
  ult_em2 int := extract(day from (date_trunc('month', ((now() at time zone 'America/Sao_Paulo')::date + 2)) + interval '1 month - 1 day'))::int;
begin
  select decrypted_secret into secret
  from vault.decrypted_secrets where name = 'email_cron_secret';

  for u in
    select
      au.email,
      coalesce(au.raw_user_meta_data->>'full_name', '') as nome,
      jsonb_agg(
        jsonb_build_object(
          'nome', c.nome,
          'valor', c.valor,
          'quando', case
            when c.dia_vencimento = extract(day from hoje)::int
              or (c.dia_vencimento > ult_hoje and extract(day from hoje)::int = ult_hoje)
            then 'hoje'
            else 'em 2 dias'
          end
        )
        order by c.dia_vencimento
      ) as contas
    from public.conta_recorrente c
    join auth.users au on au.id = c.user_id
    where c.ativo
      and au.email_confirmed_at is not null
      and (
        -- vence hoje
        c.dia_vencimento = extract(day from hoje)::int
        or (c.dia_vencimento > ult_hoje and extract(day from hoje)::int = ult_hoje)
        -- vence em 2 dias
        or c.dia_vencimento = extract(day from em2)::int
        or (c.dia_vencimento > ult_em2 and extract(day from em2)::int = ult_em2)
      )
    group by au.id, au.email, au.raw_user_meta_data
  loop
    perform net.http_post(
      url := 'https://azul.educarbem.com.br/api/public/emails/cron',
      headers := jsonb_build_object(
        'content-type', 'application/json',
        'x-cron-secret', secret
      ),
      body := jsonb_build_object(
        'template', 'contas-vencendo',
        'to', u.email,
        'nome', u.nome,
        'contas', u.contas
      )
    );
  end loop;
end $$;

revoke execute on function public.enviar_alerta_contas() from public, anon, authenticated;

-- ========== Agendamento: diário às 11:00 UTC = 8h BRT ==========

do $$ begin
  perform cron.unschedule('alerta-contas');
exception when others then null; end $$;

select cron.schedule('alerta-contas', '0 11 * * *', $$select public.enviar_alerta_contas()$$);

-- Teste manual: cadastre uma conta com dia_vencimento = dia de hoje na tela
-- /contas e rode:  select public.enviar_alerta_contas();
-- Conferir: select id, status_code, content from net._http_response order by id desc limit 5;
