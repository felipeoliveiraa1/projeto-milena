-- =============================================================================
-- 0005 — Liberar o e-mail real da Milena
--
-- A 0002 subiu com um e-mail de exemplo. A conta criada de verdade foi
-- generozomilena@gmail.com, então ela entrava e batia na tela "Conta sem
-- acesso". Este arquivo acerta a lista.
-- =============================================================================

insert into public.allowed_users (email, nome)
values ('generozomilena@gmail.com', 'Milena')
on conflict (email) do nothing;

delete from public.allowed_users where email = 'milena@exemplo.com';

-- A checagem compara sempre em minúsculas (ver public.is_allowed).
-- Isto conserta qualquer e-mail que tenha entrado com maiúscula.
update public.allowed_users
set email = lower(email)
where email <> lower(email);

-- Conferência:
--   select email, nome from public.allowed_users;
--
-- E, para ver conta criada x conta liberada de uma vez:
--   select u.email, (a.email is not null) as liberado
--   from auth.users u
--   left join public.allowed_users a on a.email = lower(u.email);
