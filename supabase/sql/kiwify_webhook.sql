-- Execute no SQL Editor do seu projeto Supabase.
--
-- O webhook da Kiwify (src/routes/api/public/kiwify/webhook.ts) grava em
-- public.kiwify_pedidos, a MESMA tabela que o restante do app já lê:
--   - verificar_compra_kiwify (Auth Hook "before user created"): libera o cadastro
--     quando existe linha com evento in ('compra_aprovada','subscription_renewed').
--   - get_minha_assinatura (tela "Sua assinatura").
--
-- A tabela kiwify_pedidos já existe no projeto. Este script só adiciona o índice
-- único que garante idempotência (reenvios da Kiwify não duplicam linhas), usado
-- pelo upsert onConflict do webhook.

create unique index if not exists kiwify_pedidos_order_evento_uniq
  on public.kiwify_pedidos (order_id, evento);

-- (Opcional) Limpeza: as tabelas assinaturas/pagamentos foram criadas numa tentativa
-- anterior e NÃO são lidas por nenhuma parte do app (o gate e a tela de assinatura usam
-- kiwify_pedidos). Se quiser remover para evitar confusão, descomente as linhas abaixo:
--
-- drop table if exists public.pagamentos;
-- drop table if exists public.assinaturas;
