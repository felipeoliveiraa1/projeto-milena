-- =============================================================================
-- 0003 — Fechar o acesso anônimo (RODAR SÓ DEPOIS DE O LOGIN ESTAR NO AR)
--
-- Até aqui qualquer pessoa com o endereço do projeto conseguia ler os dados —
-- peso, refeições, sintomas. Esta migration troca todas as políticas de
-- "anon, authenticated" para "só quem está em allowed_users".
--
-- Ordem certa:
--   1. rodar a 0002
--   2. criar as contas em Authentication → Users e conferir allowed_users
--   3. entrar no app com o login novo e confirmar que carrega
--   4. rodar esta migration
--
-- Se rodar antes do passo 3, o app para de carregar dados até o login subir.
-- =============================================================================

-- daily_checks --------------------------------------------------------------
drop policy if exists "anon all daily_checks" on daily_checks;
drop policy if exists "acesso liberado daily_checks" on daily_checks;
create policy "acesso liberado daily_checks"
  on daily_checks for all to authenticated
  using (public.is_allowed()) with check (public.is_allowed());

-- weights -------------------------------------------------------------------
drop policy if exists "anon all weights" on weights;
drop policy if exists "acesso liberado weights" on weights;
create policy "acesso liberado weights"
  on weights for all to authenticated
  using (public.is_allowed()) with check (public.is_allowed());

-- shopping_state ------------------------------------------------------------
drop policy if exists "anon all shopping_state" on shopping_state;
drop policy if exists "acesso liberado shopping_state" on shopping_state;
create policy "acesso liberado shopping_state"
  on shopping_state for all to authenticated
  using (public.is_allowed()) with check (public.is_allowed());

-- app_config ----------------------------------------------------------------
drop policy if exists "anon all app_config" on app_config;
drop policy if exists "acesso liberado app_config" on app_config;
create policy "acesso liberado app_config"
  on app_config for all to authenticated
  using (public.is_allowed()) with check (public.is_allowed());

-- measurements --------------------------------------------------------------
drop policy if exists "anon all measurements" on measurements;
drop policy if exists "acesso liberado measurements" on measurements;
create policy "acesso liberado measurements"
  on measurements for all to authenticated
  using (public.is_allowed()) with check (public.is_allowed());

-- =============================================================================
-- Conferência: com a chave pública e sem login, isto deve voltar vazio.
--
--   curl "$SUPABASE_URL/rest/v1/weights?select=*" \
--     -H "apikey: $CHAVE_PUBLICA" -H "Authorization: Bearer $CHAVE_PUBLICA"
--
-- Recomendado também, no painel:
--   Authentication → Sign In / Providers → Email → desligar "Allow new users
--   to sign up". A lista já barra estranhos, mas assim nem conta é criada.
-- =============================================================================
