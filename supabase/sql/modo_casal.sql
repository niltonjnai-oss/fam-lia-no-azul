-- Execute no SQL Editor do Supabase (uma vez).
-- Modo Casal: o orçamento passa a pertencer a uma FAMÍLIA (grupo), não mais a
-- um usuário isolado. Cada usuário é membro de uma família (titular ou
-- cônjuge, máx. 2 membros). O titular convida o cônjuge por e-mail; o convite
-- também libera o cadastro dele sem precisar de compra própria na Kiwify.
--
-- Migra lancamento/renda/divida/transacao/reserva_config/conta_recorrente e o
-- catálogo (categoria/subitem) de "dono = user_id" para "dono = familia_id".
-- Views (v_50_30_20 etc.) e as RPCs registrar/excluir_gasto_rapido continuam
-- funcionando sem alteração de código: elas herdam o RLS da tabela via
-- security_invoker / security invoker, então passam a filtrar por família
-- automaticamente.

-- ========== 1) Tabelas de família ==========

create table if not exists public.familia (
  id uuid primary key default gen_random_uuid(),
  nome text,
  criado_por uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.familia_membro (
  id uuid primary key default gen_random_uuid(),
  familia_id uuid not null references public.familia(id) on delete cascade,
  user_id uuid not null unique references auth.users(id) on delete cascade,
  papel text not null default 'conjuge' check (papel in ('titular', 'conjuge')),
  created_at timestamptz not null default now()
);

create index if not exists familia_membro_familia_idx on public.familia_membro (familia_id);

alter table public.familia enable row level security;
alter table public.familia_membro enable row level security;

drop policy if exists "membros veem a propria familia" on public.familia;
create policy "membros veem a propria familia" on public.familia
  for select to authenticated using (
    id in (select familia_id from public.familia_membro where user_id = auth.uid())
  );

drop policy if exists "membros veem os colegas de familia" on public.familia_membro;
create policy "membros veem os colegas de familia" on public.familia_membro
  for select to authenticated using (
    familia_id in (select familia_id from public.familia_membro where user_id = auth.uid())
  );

-- Família do usuário logado — cria (get-or-create) se ele ainda não tiver
-- nenhuma. Usada como DEFAULT de familia_id nas tabelas pessoais.
create or replace function public.minha_familia_id()
returns uuid
language plpgsql
security definer
set search_path to 'public'
as $$
declare fid uuid;
begin
  select familia_id into fid from public.familia_membro where user_id = auth.uid();
  if fid is not null then
    return fid;
  end if;

  insert into public.familia (criado_por) values (auth.uid()) returning id into fid;
  insert into public.familia_membro (familia_id, user_id, papel) values (fid, auth.uid(), 'titular');
  return fid;
end $$;

revoke execute on function public.minha_familia_id() from public, anon;
grant execute on function public.minha_familia_id() to authenticated;

-- Membros da família do usuário logado (para a tela /familia).
create or replace function public.minha_familia_membros()
returns table(user_id uuid, email text, papel text)
language sql
security definer
set search_path to 'public'
as $$
  select fm.user_id, au.email, fm.papel
  from public.familia_membro fm
  join auth.users au on au.id = fm.user_id
  where fm.familia_id in (select familia_id from public.familia_membro where user_id = auth.uid())
  order by fm.papel desc;
$$;

revoke execute on function public.minha_familia_membros() from public, anon;
grant execute on function public.minha_familia_membros() to authenticated;

-- ========== 2) Convites (limite de 2 membros por família) ==========

create table if not exists public.convite_familia (
  id uuid primary key default gen_random_uuid(),
  familia_id uuid not null references public.familia(id) on delete cascade,
  email text not null,
  token text not null unique default encode(gen_random_bytes(24), 'hex'),
  criado_por uuid not null references auth.users(id) on delete cascade,
  aceito boolean not null default false,
  expira_em timestamptz not null default (now() + interval '7 days'),
  created_at timestamptz not null default now()
);

create index if not exists convite_familia_email_idx on public.convite_familia (lower(email));

alter table public.convite_familia enable row level security;

drop policy if exists "membros veem convites da propria familia" on public.convite_familia;
create policy "membros veem convites da propria familia" on public.convite_familia
  for select to authenticated using (
    familia_id in (select familia_id from public.familia_membro where user_id = auth.uid())
  );
-- Sem policy de insert/update/delete para o cliente — só via funções abaixo.

create or replace function public.criar_convite_familia(p_email text)
returns jsonb
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  fid uuid;
  qtd int;
  tok text;
  meu_email text;
begin
  fid := public.minha_familia_id();
  select email into meu_email from auth.users where id = auth.uid();

  if lower(p_email) = lower(meu_email) then
    return jsonb_build_object('error', 'Convide o e-mail do seu cônjuge, não o seu.');
  end if;

  select count(*) into qtd from public.familia_membro where familia_id = fid;
  if qtd >= 2 then
    return jsonb_build_object('error', 'Sua família já tem 2 membros (o máximo do Modo Casal).');
  end if;

  if exists (
    select 1 from public.familia_membro fm join auth.users au on au.id = fm.user_id
    where fm.familia_id = fid and lower(au.email) = lower(p_email)
  ) then
    return jsonb_build_object('error', 'Essa pessoa já faz parte da sua família.');
  end if;

  insert into public.convite_familia (familia_id, email, criado_por)
  values (fid, lower(p_email), auth.uid())
  returning token into tok;

  return jsonb_build_object('token', tok, 'email', lower(p_email));
end $$;

revoke execute on function public.criar_convite_familia(text) from public, anon;
grant execute on function public.criar_convite_familia(text) to authenticated;

-- Info pública do convite (token é aleatório de 192 bits — seguro expor por
-- token exato). Usado na página /convite/:token antes do login.
create or replace function public.info_convite_familia(p_token text)
returns jsonb
language plpgsql
security definer
set search_path to 'public'
as $$
declare conv record;
begin
  select * into conv from public.convite_familia where token = p_token;
  if conv is null then
    return jsonb_build_object('valido', false, 'motivo', 'Convite não encontrado.');
  end if;
  if conv.aceito then
    return jsonb_build_object('valido', false, 'motivo', 'Este convite já foi aceito.');
  end if;
  if conv.expira_em <= now() then
    return jsonb_build_object('valido', false, 'motivo', 'Este convite expirou.');
  end if;
  return jsonb_build_object('valido', true, 'email', conv.email);
end $$;

grant execute on function public.info_convite_familia(text) to anon, authenticated;

-- Aceitar convite: chamado pelo convidado já autenticado (o e-mail da conta
-- precisa bater com o do convite).
create or replace function public.aceitar_convite_familia(p_token text)
returns jsonb
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  conv record;
  meu_email text;
begin
  select email into meu_email from auth.users where id = auth.uid();

  select * into conv from public.convite_familia
  where token = p_token and not aceito and expira_em > now();

  if conv is null then
    return jsonb_build_object('error', 'Convite inválido ou expirado.');
  end if;

  if lower(conv.email) <> lower(meu_email) then
    return jsonb_build_object('error', 'Este convite foi enviado para outro e-mail.');
  end if;

  -- Se o convidado já tinha família própria (criada automaticamente no
  -- primeiro acesso, antes de aceitar o convite), sai dela para entrar na do
  -- titular que convidou.
  delete from public.familia_membro where user_id = auth.uid();

  insert into public.familia_membro (familia_id, user_id, papel)
  values (conv.familia_id, auth.uid(), 'conjuge');

  update public.convite_familia set aceito = true where id = conv.id;

  return jsonb_build_object('ok', true);
end $$;

revoke execute on function public.aceitar_convite_familia(text) from public, anon;
grant execute on function public.aceitar_convite_familia(text) to authenticated;

-- ========== 3) Gate de cadastro: libera também quem tem convite pendente ==========

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

  if exists (
    select 1 from public.convite_familia
    where lower(email) = novo_email and not aceito and expira_em > now()
  ) then
    return '{}'::jsonb;
  end if;

  select kp.evento into ultimo_evento
  from public.kiwify_pedidos kp
  where lower(kp.email_cliente) = novo_email
    and kp.evento in (
      'compra_aprovada', 'subscription_renewed',
      'compra_reembolsada', 'chargeback', 'subscription_canceled'
    )
  order by kp.created_at desc
  limit 1;

  if ultimo_evento in ('compra_aprovada', 'subscription_renewed') then
    return '{}'::jsonb;
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

  return jsonb_build_object(
    'error', jsonb_build_object(
      'http_code', 403,
      'message',
      'Encontramos sua compra, mas ela foi reembolsada ou cancelada. Se você acha que isso é um engano, fale com o suporte.'
    )
  );
end;
$function$;

-- ========== 4) Backfill: 1 família por usuário que já tem dados ==========

do $$
declare uid uuid;
begin
  for uid in
    select distinct user_id from public.lancamento
    union select distinct user_id from public.renda
    union select distinct user_id from public.divida
    union select distinct user_id from public.transacao
    union select distinct user_id from public.reserva_config
    union select distinct user_id from public.conta_recorrente
  loop
    if not exists (select 1 from public.familia_membro where user_id = uid) then
      declare fid uuid;
      begin
        insert into public.familia (criado_por) values (uid) returning id into fid;
        insert into public.familia_membro (familia_id, user_id, papel) values (fid, uid, 'titular');
      end;
    end if;
  end loop;
end $$;

-- ========== 5) Tabelas pessoais passam a ser da família ==========

alter table public.lancamento     add column if not exists familia_id uuid references public.familia(id) on delete cascade;
alter table public.renda          add column if not exists familia_id uuid references public.familia(id) on delete cascade;
alter table public.divida         add column if not exists familia_id uuid references public.familia(id) on delete cascade;
alter table public.transacao      add column if not exists familia_id uuid references public.familia(id) on delete cascade;
alter table public.reserva_config add column if not exists familia_id uuid references public.familia(id) on delete cascade;
alter table public.conta_recorrente add column if not exists familia_id uuid references public.familia(id) on delete cascade;

update public.lancamento l set familia_id = fm.familia_id from public.familia_membro fm where fm.user_id = l.user_id and l.familia_id is null;
update public.renda r set familia_id = fm.familia_id from public.familia_membro fm where fm.user_id = r.user_id and r.familia_id is null;
update public.divida d set familia_id = fm.familia_id from public.familia_membro fm where fm.user_id = d.user_id and d.familia_id is null;
update public.transacao t set familia_id = fm.familia_id from public.familia_membro fm where fm.user_id = t.user_id and t.familia_id is null;
update public.reserva_config rc set familia_id = fm.familia_id from public.familia_membro fm where fm.user_id = rc.user_id and rc.familia_id is null;
update public.conta_recorrente cr set familia_id = fm.familia_id from public.familia_membro fm where fm.user_id = cr.user_id and cr.familia_id is null;

alter table public.lancamento     alter column familia_id set default public.minha_familia_id();
alter table public.renda          alter column familia_id set default public.minha_familia_id();
alter table public.divida         alter column familia_id set default public.minha_familia_id();
alter table public.transacao      alter column familia_id set default public.minha_familia_id();
alter table public.reserva_config alter column familia_id set default public.minha_familia_id();
alter table public.conta_recorrente alter column familia_id set default public.minha_familia_id();

alter table public.lancamento     alter column familia_id set not null;
alter table public.renda          alter column familia_id set not null;
alter table public.divida         alter column familia_id set not null;
alter table public.transacao      alter column familia_id set not null;
alter table public.reserva_config alter column familia_id set not null;
alter table public.conta_recorrente alter column familia_id set not null;

create index if not exists lancamento_familia_idx     on public.lancamento (familia_id);
create index if not exists renda_familia_idx          on public.renda (familia_id);
create index if not exists divida_familia_idx         on public.divida (familia_id);
create index if not exists transacao_familia_idx      on public.transacao (familia_id);
create index if not exists reserva_config_familia_idx on public.reserva_config (familia_id);
create index if not exists conta_recorrente_familia_idx on public.conta_recorrente (familia_id);

-- Unicidade de lancamento passa a ser por família (o casal compartilha o
-- mesmo lançamento do mês, não um por cônjuge).
do $$
declare c record;
begin
  for c in
    select conname from pg_constraint
    where conrelid = 'public.lancamento'::regclass and contype = 'u'
  loop
    execute format('alter table public.lancamento drop constraint %I', c.conname);
  end loop;
end $$;

alter table public.lancamento
  add constraint lancamento_subitem_mes_familia_uniq unique (subitem_id, mes_ref, familia_id);

-- Policies: troca "dono = user_id" por "dono = minha família".
drop policy if exists "dono acessa as proprias linhas" on public.lancamento;
create policy "familia acessa as proprias linhas" on public.lancamento
  for all to authenticated
  using (familia_id in (select familia_id from public.familia_membro where user_id = auth.uid()))
  with check (familia_id in (select familia_id from public.familia_membro where user_id = auth.uid()));

drop policy if exists "dono acessa as proprias linhas" on public.renda;
create policy "familia acessa as proprias linhas" on public.renda
  for all to authenticated
  using (familia_id in (select familia_id from public.familia_membro where user_id = auth.uid()))
  with check (familia_id in (select familia_id from public.familia_membro where user_id = auth.uid()));

drop policy if exists "dono acessa as proprias linhas" on public.divida;
create policy "familia acessa as proprias linhas" on public.divida
  for all to authenticated
  using (familia_id in (select familia_id from public.familia_membro where user_id = auth.uid()))
  with check (familia_id in (select familia_id from public.familia_membro where user_id = auth.uid()));

drop policy if exists "dono acessa as proprias linhas" on public.transacao;
create policy "familia acessa as proprias linhas" on public.transacao
  for all to authenticated
  using (familia_id in (select familia_id from public.familia_membro where user_id = auth.uid()))
  with check (familia_id in (select familia_id from public.familia_membro where user_id = auth.uid()));

drop policy if exists "dono acessa as proprias linhas" on public.reserva_config;
create policy "familia acessa as proprias linhas" on public.reserva_config
  for all to authenticated
  using (familia_id in (select familia_id from public.familia_membro where user_id = auth.uid()))
  with check (familia_id in (select familia_id from public.familia_membro where user_id = auth.uid()));

drop policy if exists "dono acessa as proprias linhas" on public.conta_recorrente;
create policy "familia acessa as proprias linhas" on public.conta_recorrente
  for all to authenticated
  using (familia_id in (select familia_id from public.familia_membro where user_id = auth.uid()))
  with check (familia_id in (select familia_id from public.familia_membro where user_id = auth.uid()));

-- ========== 6) registrar_gasto_rapido: novo alvo de conflito ==========

create or replace function public.registrar_gasto_rapido(
  p_subitem_id uuid, p_mes_ref text, p_valor numeric, p_descricao text default null::text
)
returns uuid
language plpgsql
as $function$
declare v_id uuid;
begin
  insert into transacao (subitem_id, mes_ref, valor, descricao)
  values (p_subitem_id, p_mes_ref, p_valor, p_descricao)
  returning id into v_id;

  insert into lancamento (subitem_id, mes_ref, custo_real)
  values (p_subitem_id, p_mes_ref, p_valor)
  on conflict (subitem_id, mes_ref, familia_id)
  do update set custo_real = lancamento.custo_real + excluded.custo_real;

  return v_id;
end;
$function$;

-- excluir_gasto_rapido não precisa mudar: é security invoker, o RLS por
-- família já garante que só enxerga/altera linhas da própria família.

-- ========== 7) Catálogo (categoria/subitem): passa a ser por família ==========
-- user_id null = template global (visível a todos); familia_id preenchido =
-- categoria/subitem privado da família (visível aos 2 membros, editável por
-- qualquer um deles).

alter table public.categoria add column if not exists familia_id uuid references public.familia(id) on delete cascade;
alter table public.subitem   add column if not exists familia_id uuid references public.familia(id) on delete cascade;

update public.categoria c set familia_id = fm.familia_id from public.familia_membro fm where fm.user_id = c.user_id and c.familia_id is null and c.user_id is not null;
update public.subitem s set familia_id = fm.familia_id from public.familia_membro fm where fm.user_id = s.user_id and s.familia_id is null and s.user_id is not null;

alter table public.categoria alter column familia_id set default public.minha_familia_id();
alter table public.subitem   alter column familia_id set default public.minha_familia_id();

drop policy if exists "le catalogo global e proprio" on public.categoria;
create policy "le catalogo global e da familia" on public.categoria
  for select to authenticated using (
    user_id is null or familia_id in (select familia_id from public.familia_membro where user_id = auth.uid())
  );

drop policy if exists "cria categoria propria" on public.categoria;
create policy "cria categoria da familia" on public.categoria
  for insert to authenticated with check (
    familia_id in (select familia_id from public.familia_membro where user_id = auth.uid())
  );

drop policy if exists "edita categoria propria" on public.categoria;
create policy "edita categoria da familia" on public.categoria
  for update to authenticated
  using (familia_id in (select familia_id from public.familia_membro where user_id = auth.uid()))
  with check (familia_id in (select familia_id from public.familia_membro where user_id = auth.uid()));

drop policy if exists "exclui categoria propria" on public.categoria;
create policy "exclui categoria da familia" on public.categoria
  for delete to authenticated using (
    familia_id in (select familia_id from public.familia_membro where user_id = auth.uid())
  );

drop policy if exists "le catalogo global e proprio" on public.subitem;
create policy "le catalogo global e da familia" on public.subitem
  for select to authenticated using (
    user_id is null or familia_id in (select familia_id from public.familia_membro where user_id = auth.uid())
  );

drop policy if exists "cria subitem proprio" on public.subitem;
create policy "cria subitem da familia" on public.subitem
  for insert to authenticated with check (
    familia_id in (select familia_id from public.familia_membro where user_id = auth.uid())
  );

drop policy if exists "edita subitem proprio" on public.subitem;
create policy "edita subitem da familia" on public.subitem
  for update to authenticated
  using (familia_id in (select familia_id from public.familia_membro where user_id = auth.uid()))
  with check (familia_id in (select familia_id from public.familia_membro where user_id = auth.uid()));

drop policy if exists "exclui subitem proprio" on public.subitem;
create policy "exclui subitem da familia" on public.subitem
  for delete to authenticated using (
    familia_id in (select familia_id from public.familia_membro where user_id = auth.uid())
  );
