-- Execute no SQL Editor do Supabase (uma vez).
-- Aviso de renovação: e-mail 30 e 7 dias antes do fim dos 12 meses de acesso
-- (cumpre a promessa da LP: "perto do fim, a gente te avisa por e-mail").
-- Mesma regra de validade da tela de assinatura (get_minha_assinatura):
-- última compra_aprovada/subscription_renewed + 365 dias, invalidada por
-- reembolso/chargeback/cancelamento posterior. Renovação = nova compra com o
-- mesmo e-mail (o acesso estende automaticamente).
--
-- Pré-requisitos (já feitos): pg_cron + pg_net habilitados e o segredo
-- 'email_cron_secret' no Vault.

create or replace function public.enviar_aviso_renovacao()
returns void
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  u record;
  secret text;
  hoje date := (now() at time zone 'America/Sao_Paulo')::date;
begin
  select decrypted_secret into secret
  from vault.decrypted_secrets where name = 'email_cron_secret';

  for u in
    with ultima as (
      select distinct on (lower(kp.email_cliente))
        lower(kp.email_cliente) as email,
        kp.created_at as compra_em
      from public.kiwify_pedidos kp
      where kp.evento in ('compra_aprovada', 'subscription_renewed')
      order by lower(kp.email_cliente), kp.created_at desc
    ),
    validas as (
      select ul.email, ul.compra_em, (ul.compra_em + interval '365 days')::date as vence_em
      from ultima ul
      where not exists (
        select 1 from public.kiwify_pedidos r
        where lower(r.email_cliente) = ul.email
          and r.evento in ('compra_reembolsada', 'chargeback', 'subscription_canceled')
          and r.created_at > ul.compra_em
      )
    )
    select
      au.email,
      coalesce(au.raw_user_meta_data->>'full_name', '') as nome,
      (v.vence_em - hoje) as dias_restantes,
      to_char(v.vence_em, 'DD/MM/YYYY') as data_vencimento
    from validas v
    join auth.users au on lower(au.email) = v.email
    where au.email_confirmed_at is not null
      and (v.vence_em - hoje) in (30, 7)
  loop
    perform net.http_post(
      url := 'https://azul.educarbem.com.br/api/public/emails/cron',
      headers := jsonb_build_object(
        'content-type', 'application/json',
        'x-cron-secret', secret
      ),
      body := jsonb_build_object(
        'template', 'renovacao-aviso',
        'to', u.email,
        'nome', u.nome,
        'diasRestantes', u.dias_restantes,
        'dataVencimento', u.data_vencimento
      )
    );
  end loop;
end $$;

revoke execute on function public.enviar_aviso_renovacao() from public, anon, authenticated;

-- Diário às 12:30 UTC = 9h30 BRT (depois do alerta de contas, das 8h).
do $$ begin
  perform cron.unschedule('aviso-renovacao');
exception when others then null; end $$;

select cron.schedule('aviso-renovacao', '30 12 * * *', $$select public.enviar_aviso_renovacao()$$);

-- Teste manual: select public.enviar_aviso_renovacao();
-- (só envia se alguém estiver exatamente a 30 ou 7 dias do vencimento)
-- Conferir: select id, status_code, content from net._http_response order by id desc limit 5;
