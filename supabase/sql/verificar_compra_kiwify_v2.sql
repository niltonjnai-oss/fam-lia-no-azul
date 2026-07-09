-- Execute no SQL Editor do seu projeto Supabase.
--
-- v2 do gate de cadastro (Auth Hook "before user created").
-- Correção: a v1 liberava o cadastro se existisse QUALQUER linha 'compra_aprovada'
-- para o e-mail — quem era reembolsado ou dava chargeback continuava passando.
-- A v2 olha o ÚLTIMO evento relevante (por created_at) em kiwify_pedidos:
--   - aprovação/renovação mais recente  -> libera
--   - reembolso/chargeback/cancelamento -> bloqueia (mensagem específica)
--   - nenhum evento                     -> bloqueia (mensagem "compra não encontrada")
-- Se o cliente comprar de novo após um reembolso, a nova aprovação é mais recente
-- e o cadastro volta a ser liberado.
-- 'subscription_late' (cobrança em retry) NÃO revoga acesso de propósito.

create or replace function public.verificar_compra_kiwify(event jsonb)
returns jsonb
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  novo_email text;
  ultimo_evento text;
begin
  novo_email := lower(event->'user'->>'email');

  -- Último evento que libera ou revoga acesso para este e-mail.
  select kp.evento into ultimo_evento
  from public.kiwify_pedidos kp
  where lower(kp.email_cliente) = novo_email
    and kp.evento in (
      'compra_aprovada', 'subscription_renewed',                  -- liberam
      'compra_reembolsada', 'chargeback', 'subscription_canceled' -- revogam
    )
  order by kp.created_at desc
  limit 1;

  if ultimo_evento in ('compra_aprovada', 'subscription_renewed') then
    return '{}'::jsonb;  -- permite o cadastro
  end if;

  if ultimo_evento is null then
    return jsonb_build_object(
      'error', jsonb_build_object(
        'http_code', 403,
        'message',
        'Não encontramos uma compra aprovada com este e-mail. Use o mesmo e-mail da compra na Kiwify ou fale com o suporte.'
      )
    );
  end if;

  -- Último evento foi reembolso/chargeback/cancelamento.
  return jsonb_build_object(
    'error', jsonb_build_object(
      'http_code', 403,
      'message',
      'Encontramos sua compra, mas ela foi reembolsada ou cancelada. Se você acha que isso é um engano, fale com o suporte.'
    )
  );
end;
$function$;
