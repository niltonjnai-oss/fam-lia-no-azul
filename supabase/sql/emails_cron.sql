-- Execute no SQL Editor do Supabase (uma vez).
-- Emails automáticos via pg_cron + pg_net chamando o endpoint do app:
--   POST https://azul.educarbem.com.br/api/public/emails/cron
--   header x-cron-secret = EMAIL_CRON_SECRET (mesma variável no Vercel).
--
-- ANTES DE RODAR: troque COLOQUE_O_SECRET_AQUI (linha do vault.create_secret)
-- pelo valor de EMAIL_CRON_SECRET (está no .env local e no Vercel).
-- O segredo fica no Supabase Vault ("alter database set" não é permitido no
-- Supabase; foi o erro 42501 na primeira tentativa).
--
-- Agenda (cron roda em UTC; Brasília = UTC-3):
--   lembrete-semanal : segunda 12:00 UTC = 9h BRT, todos os usuários confirmados
--   onboarding-dia-1 : diário 13:00 UTC = 10h BRT, contas criadas no dia anterior

create extension if not exists pg_cron;
create extension if not exists pg_net;

-- Segredo no Vault (idempotente: atualiza se já existir).
do $$
declare sid uuid;
begin
  select id into sid from vault.secrets where name = 'email_cron_secret';
  if sid is null then
    perform vault.create_secret('COLOQUE_O_SECRET_AQUI', 'email_cron_secret');
  else
    perform vault.update_secret(sid, 'COLOQUE_O_SECRET_AQUI');
  end if;
end $$;

-- ========== Funções de disparo ==========

create or replace function public.enviar_lembrete_semanal()
returns void
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  u record;
  secret text;
begin
  select decrypted_secret into secret
  from vault.decrypted_secrets where name = 'email_cron_secret';

  for u in
    select email, coalesce(raw_user_meta_data->>'full_name', '') as nome
    from auth.users
    where email_confirmed_at is not null
  loop
    perform net.http_post(
      url := 'https://azul.educarbem.com.br/api/public/emails/cron',
      headers := jsonb_build_object(
        'content-type', 'application/json',
        'x-cron-secret', secret
      ),
      body := jsonb_build_object(
        'template', 'lembrete-semanal',
        'to', u.email,
        'nome', u.nome
      )
    );
  end loop;
end $$;

create or replace function public.enviar_onboarding_dia1()
returns void
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  u record;
  secret text;
begin
  select decrypted_secret into secret
  from vault.decrypted_secrets where name = 'email_cron_secret';

  -- Contas criadas entre 24h e 48h atrás (rodando 1x/dia, cada conta entra
  -- exatamente uma vez nesta janela).
  for u in
    select email, coalesce(raw_user_meta_data->>'full_name', '') as nome
    from auth.users
    where email_confirmed_at is not null
      and created_at >= now() - interval '2 days'
      and created_at <  now() - interval '1 day'
  loop
    perform net.http_post(
      url := 'https://azul.educarbem.com.br/api/public/emails/cron',
      headers := jsonb_build_object(
        'content-type', 'application/json',
        'x-cron-secret', secret
      ),
      body := jsonb_build_object(
        'template', 'onboarding-dia-1',
        'to', u.email,
        'nome', u.nome
      )
    );
  end loop;
end $$;

-- Só o cron/postgres executa essas funções; usuários do app não.
revoke execute on function public.enviar_lembrete_semanal() from public, anon, authenticated;
revoke execute on function public.enviar_onboarding_dia1() from public, anon, authenticated;

-- ========== Agendamentos ==========
-- unschedule antes para o script poder ser rodado de novo sem duplicar jobs.

do $$ begin
  perform cron.unschedule('lembrete-semanal');
exception when others then null; end $$;

do $$ begin
  perform cron.unschedule('onboarding-dia-1');
exception when others then null; end $$;

select cron.schedule('lembrete-semanal', '0 12 * * 1', $$select public.enviar_lembrete_semanal()$$);
select cron.schedule('onboarding-dia-1', '0 13 * * *', $$select public.enviar_onboarding_dia1()$$);

-- ========== Verificação / testes úteis ==========
-- Jobs agendados:            select jobid, jobname, schedule from cron.job;
-- Disparo manual (teste):    select public.enviar_lembrete_semanal();
-- Últimas execuções do cron: select * from cron.job_run_details order by start_time desc limit 10;
-- Respostas HTTP do pg_net:  select id, status_code, content from net._http_response order by id desc limit 10;
