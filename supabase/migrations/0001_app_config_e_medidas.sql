-- =============================================================================
-- 0001 — Configuração do app e medidas corporais
--
-- Pendente de aplicação. Idempotente: pode rodar mais de uma vez sem quebrar.
--
-- O que destrava:
--   app_config  → rotina editável e preferências (meta de água, peso, ciclo)
--                 passam a sincronizar entre aparelhos
--   measurements→ medidas do antes e depois saem do aparelho para a nuvem
--
-- Sem esta migration o app continua funcionando: ele grava no localStorage e
-- mostra o selo "salva neste aparelho". O que muda é a sincronização.
-- =============================================================================

-- 1) Configuração do app — sempre uma linha só (id = 1)
create table if not exists app_config (
  id int primary key default 1,
  rotina jsonb,
  preferencias jsonb,
  updated_at timestamptz not null default now(),
  constraint app_config_single_row check (id = 1)
);

-- Para o caso de a tabela já existir sem a coluna de preferências
alter table app_config
  add column if not exists preferencias jsonb;

insert into app_config (id) values (1) on conflict (id) do nothing;

alter table app_config enable row level security;

drop policy if exists "anon all app_config" on app_config;
create policy "anon all app_config"
  on app_config
  for all
  to anon, authenticated
  using (true)
  with check (true);

-- 2) Medidas corporais, uma linha por data de medição
create table if not exists measurements (
  date date primary key,
  cintura numeric(5,1),
  abdomen numeric(5,1),
  quadril numeric(5,1),
  braco numeric(5,1),
  coxa numeric(5,1),
  created_at timestamptz not null default now()
);

alter table measurements enable row level security;

drop policy if exists "anon all measurements" on measurements;
create policy "anon all measurements"
  on measurements
  for all
  to anon, authenticated
  using (true)
  with check (true);

-- =============================================================================
-- Conferência rápida depois de rodar:
--
--   select id, preferencias is not null as tem_prefs, rotina is not null as tem_rotina
--   from app_config;
--
--   select count(*) from measurements;
--
-- No app, o selo "salva neste aparelho" some da tela de Rotina e de Ajustes.
-- =============================================================================
