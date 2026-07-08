-- Execute no SQL Editor do seu projeto Supabase.
-- Cria as tabelas usadas pelo webhook da Kiwify
-- (src/routes/api/public/kiwify/webhook.ts). Ainda não existiam no schema do projeto.

create table if not exists public.assinaturas (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  user_id uuid references auth.users(id) on delete set null,
  nome text,
  produto_id text,
  produto_nome text,
  plano text,
  status text not null default 'ativa' check (status in ('ativa', 'atrasada', 'cancelada')),
  kiwify_order_id text,
  kiwify_subscription_id text,
  data_inicio timestamptz,
  data_expiracao timestamptz,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

create index if not exists assinaturas_user_id_idx on public.assinaturas (user_id);
create index if not exists assinaturas_status_idx on public.assinaturas (status);

create table if not exists public.pagamentos (
  id uuid primary key default gen_random_uuid(),
  kiwify_order_id text not null,
  kiwify_subscription_id text,
  evento text not null,       -- nome bruto recebido da Kiwify (ex.: compra_aprovada)
  evento_tipo text not null,  -- tipo normalizado interno (ex.: pagamento_aprovado)
  email text,
  produto_id text,
  produto_nome text,
  valor_centavos integer,
  moeda text,
  payload_bruto jsonb,
  criado_em timestamptz not null default now(),
  unique (kiwify_order_id, evento)
);

create index if not exists pagamentos_email_idx on public.pagamentos (email);

-- RLS: estas tabelas só devem ser escritas pelo service role (o webhook usa a
-- SUPABASE_SERVICE_ROLE_KEY, que ignora RLS). Leitura liberada para o próprio usuário
-- autenticado, para a tela "Sua assinatura" (src/routes/assinatura.tsx) mostrar dado
-- real em vez do mock (src/lib/mockAssinaturaApp.ts).
alter table public.assinaturas enable row level security;
alter table public.pagamentos enable row level security;

create policy "usuário lê a própria assinatura"
  on public.assinaturas for select
  using (auth.uid() = user_id);

create policy "usuário lê os próprios pagamentos"
  on public.pagamentos for select
  using (
    email in (select a.email from public.assinaturas a where a.user_id = auth.uid())
  );

-- Nenhuma policy de insert/update/delete é criada de propósito: só o service role
-- (usado pelo webhook) pode escrever nessas tabelas.
