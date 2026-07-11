-- Execute no SQL Editor do Supabase (uma vez).
-- Gestão da família: nome dos membros + remover convite pendente / cônjuge.

-- 1) minha_familia_membros passa a devolver o nome (full_name do metadata).
-- Drop necessário: mudar o tipo de retorno (3 -> 4 colunas) não é permitido
-- por "create or replace".
drop function if exists public.minha_familia_membros();
create or replace function public.minha_familia_membros()
returns table(user_id uuid, email text, nome text, papel text)
language sql
security definer
set search_path to 'public'
as $$
  select
    fm.user_id,
    au.email,
    coalesce(au.raw_user_meta_data->>'full_name', '') as nome,
    fm.papel
  from public.familia_membro fm
  join auth.users au on au.id = fm.user_id
  where fm.familia_id in (select public.familias_do_usuario())
  order by fm.papel desc;
$$;

revoke execute on function public.minha_familia_membros() from public, anon;
grant execute on function public.minha_familia_membros() to authenticated;

-- 2) Cancelar um convite pendente da minha família.
create or replace function public.cancelar_convite_familia(p_convite_id uuid)
returns jsonb
language plpgsql
security definer
set search_path to 'public'
as $$
declare afetados int;
begin
  delete from public.convite_familia
  where id = p_convite_id
    and not aceito
    and familia_id in (select public.familias_do_usuario());
  get diagnostics afetados = row_count;
  if afetados = 0 then
    return jsonb_build_object('error', 'Convite não encontrado ou já aceito.');
  end if;
  return jsonb_build_object('ok', true);
end $$;

revoke execute on function public.cancelar_convite_familia(uuid) from public, anon;
grant execute on function public.cancelar_convite_familia(uuid) to authenticated;

-- 3) Remover o cônjuge da família (só o titular pode; não remove o titular).
--    O usuário removido perde acesso ao orçamento; no próximo login ganha uma
--    família nova e vazia (via minha_familia_id).
create or replace function public.remover_membro_familia(p_user_id uuid)
returns jsonb
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  meu_papel text;
  fid uuid;
  alvo_papel text;
begin
  select familia_id, papel into fid, meu_papel
  from public.familia_membro where user_id = auth.uid();

  if meu_papel is distinct from 'titular' then
    return jsonb_build_object('error', 'Apenas o titular pode remover um membro.');
  end if;
  if p_user_id = auth.uid() then
    return jsonb_build_object('error', 'Você não pode remover a si mesmo.');
  end if;

  select papel into alvo_papel
  from public.familia_membro where user_id = p_user_id and familia_id = fid;
  if alvo_papel is null then
    return jsonb_build_object('error', 'Esse membro não está na sua família.');
  end if;

  delete from public.familia_membro where user_id = p_user_id and familia_id = fid;
  return jsonb_build_object('ok', true);
end $$;

revoke execute on function public.remover_membro_familia(uuid) from public, anon;
grant execute on function public.remover_membro_familia(uuid) to authenticated;
