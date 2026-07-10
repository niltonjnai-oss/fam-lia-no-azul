-- Execute no SQL Editor do Supabase (uma vez).
-- Email "Seu mês em números": todo dia 1º às 9h (Brasília), cada usuário com
-- movimento no mês anterior recebe o fechamento (previsto vs gasto, estouros,
-- categoria campeã) via /api/public/emails/cron (template resumo-mensal).
--
-- Pré-requisitos (já feitos): pg_cron + pg_net habilitados e o segredo
-- 'email_cron_secret' no Vault (ver supabase/sql/emails_cron.sql).

create or replace function public.enviar_resumo_mensal()
returns void
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  u record;
  top record;
  secret text;
  mes_prev text := to_char((now() at time zone 'America/Sao_Paulo') - interval '1 month', 'YYYY-MM');
begin
  select decrypted_secret into secret
  from vault.decrypted_secrets where name = 'email_cron_secret';

  for u in
    select
      au.id as uid,
      au.email,
      coalesce(au.raw_user_meta_data->>'full_name', '') as nome,
      coalesce(sum(l.custo_previsto), 0) as previsto,
      coalesce(sum(l.custo_real), 0) as gasto,
      count(*) filter (where l.custo_real > l.custo_previsto and l.custo_previsto > 0) as estouros
    from public.lancamento l
    join auth.users au on au.id = l.user_id
    where l.mes_ref = mes_prev
      and au.email_confirmed_at is not null
    group by au.id, au.email, au.raw_user_meta_data
    having coalesce(sum(l.custo_real), 0) > 0 or coalesce(sum(l.custo_previsto), 0) > 0
  loop
    -- Categoria com maior gasto real do usuário no mês.
    select c.nome, sum(l2.custo_real) as total into top
    from public.lancamento l2
    join public.subitem s on s.id = l2.subitem_id
    join public.categoria c on c.id = s.categoria_id
    where l2.user_id = u.uid and l2.mes_ref = mes_prev and l2.custo_real > 0
    group by c.nome
    order by sum(l2.custo_real) desc
    limit 1;

    perform net.http_post(
      url := 'https://azul.educarbem.com.br/api/public/emails/cron',
      headers := jsonb_build_object(
        'content-type', 'application/json',
        'x-cron-secret', secret
      ),
      body := jsonb_build_object(
        'template', 'resumo-mensal',
        'to', u.email,
        'nome', u.nome,
        'mesRef', mes_prev,
        'totalPrevisto', u.previsto,
        'totalReal', u.gasto,
        'estouros', u.estouros,
        'categoriaTop', top.nome,
        'categoriaTopValor', top.total
      )
    );
  end loop;
end $$;

revoke execute on function public.enviar_resumo_mensal() from public, anon, authenticated;

do $$ begin
  perform cron.unschedule('resumo-mensal');
exception when others then null; end $$;

-- Dia 1 de cada mês, 12:00 UTC = 9h BRT.
select cron.schedule('resumo-mensal', '0 12 1 * *', $$select public.enviar_resumo_mensal()$$);

-- Teste manual (usa o mês anterior; só envia p/ quem teve movimento):
--   select public.enviar_resumo_mensal();
-- Conferir respostas: select id, status_code, content from net._http_response order by id desc limit 5;
