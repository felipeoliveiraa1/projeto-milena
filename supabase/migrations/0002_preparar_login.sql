-- =============================================================================
-- 0002 — Preparar o login (NÃO quebra nada, pode rodar agora)
--
-- Cria a lista de quem pode entrar, a função que as políticas vão usar e o
-- bucket privado das fotos. As políticas antigas continuam valendo, então o app
-- que está no ar segue funcionando enquanto o login não sobe.
--
-- Depois desta migration, faça no painel:
--   Authentication → Users → Add user  (crie a conta da Milena e a sua,
--   com e-mail e senha, marcando "Auto Confirm User")
-- e insira os mesmos e-mails em allowed_users, no final deste arquivo.
-- =============================================================================

-- 1) Quem tem permissão de entrar. Ninguém lê esta tabela pela API.
create table if not exists public.allowed_users (
  email text primary key,
  nome text,
  created_at timestamptz not null default now()
);

alter table public.allowed_users enable row level security;
-- Sem policy nenhuma: nem anon nem authenticated leem isso pela API.
revoke all on public.allowed_users from anon, authenticated;

-- 2) Função usada pelas políticas. SECURITY DEFINER para conseguir consultar a
--    lista acima sem expor a tabela.
create or replace function public.is_allowed()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1
    from public.allowed_users a
    where a.email = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;

revoke all on function public.is_allowed() from public;
grant execute on function public.is_allowed() to authenticated;

-- 3) Bucket privado das fotos de progresso
insert into storage.buckets (id, name, public)
values ('progresso', 'progresso', false)
on conflict (id) do nothing;

-- Só quem está na lista mexe nas fotos.
drop policy if exists "progresso ler" on storage.objects;
create policy "progresso ler"
  on storage.objects for select to authenticated
  using (bucket_id = 'progresso' and public.is_allowed());

drop policy if exists "progresso enviar" on storage.objects;
create policy "progresso enviar"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'progresso' and public.is_allowed());

drop policy if exists "progresso apagar" on storage.objects;
create policy "progresso apagar"
  on storage.objects for delete to authenticated
  using (bucket_id = 'progresso' and public.is_allowed());

-- =============================================================================
-- 4) TROQUE PELOS E-MAILS DE VERDADE (os mesmos usados em Authentication → Users)
-- =============================================================================
insert into public.allowed_users (email, nome) values
  ('milena@exemplo.com', 'Milena'),
  ('ferramentas@triacompany.com.br', 'Felipe')
on conflict (email) do nothing;

-- Conferência:
--   select * from public.allowed_users;
--   select id, public from storage.buckets where id = 'progresso';
