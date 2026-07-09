-- Execute no SQL Editor do Supabase (uma vez).
-- Emails automáticos via pg_cron + pg_net chamando o endpoint do app:
--   POST https://azul.educarbem.com.br/api/public/emails/cron
--   header x-cron-secret = EMAIL_CRON_SECRET (mesma variável no Vercel).
--
-- ANTES DE RODAR: troque COLOQUE_O_SECRET_AQUI pelo valor de EMAIL_CRON_SECRET
-- (está no .env local e deve estar também no Vercel).
--
-- Agenda (cron roda em UTC; Brasília = UTC-3):
--   lembrete-semanal : segunda 12:00 UTC = 9h BRT, todos os usuários confirmados
--   onboarding-dia-1 : diário 13:00 UTC = 10h BRT, contas criadas no dia anterior

create extension if not exists pg_cron;
create extension if not exists pg_net;

-- Segredo lido pelas funções abaixo (GUC do banco; vale para novas conexões,
-- o que inclui as execuções do pg_cron).
alter database postgres set app.email_cron_secret = 'COLOQUE_O_SECRET_AQUI';

-- ========== Funções de disparo ==========

create or replace function public.enviar_lembrete_semanal()
returns void
language plpgsql
security definer
set search_path to 'public'
as $$
declare u record;
begin
  for u in
    select email, coalesce(raw_user_meta_data->>'full_name', '') as nome
    from auth.users
    where email_confirmed_at is not null
  loop
    perform net.http_post(
      url := 'https://azul.educarbem.com.br/api/public/emails/cron',
      headers := jsonb_build_object(
        'content-type', 'application/json',
        'x-cron-secret', current_setting('app.email_cron_secret')
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
declare u record;
begin
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
        'x-cron-secret', current_setting('app.email_cron_secret')
      ),
      body := jsonb_build_object(
        'template', 'onboarding-dia-1',
        'to', u.email,
        'nome', u.nome
      )
    );
  end loop;
end $$;

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
