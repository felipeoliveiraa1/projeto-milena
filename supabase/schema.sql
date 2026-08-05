-- =============================================================================
-- Schema do Treino & Dieta da Milena
-- Cole este SQL no SQL Editor do Supabase e clique em "Run".
-- =============================================================================

-- 1) Tabela de check-ins diários (refeições, água, treino, suplementos, exercícios)
--
-- Obs.: a coluna `supplements` guarda três tipos de registro, separados pelo id:
--   - suplementos .......... nac, glutamina, b12, omega3, magnesio, colageno...
--   - rotina do protocolo .. ids começando com "r-" (r-m-agua, r-n-dormir, ...)
--   - textos do dia ........ ids começando com "txt:" (txt:gratidao, txt:sintomas),
--                            que guardam string em vez de booleano
-- É de propósito: são registros do mesmo dia, e assim a rotina e os campos de
-- texto funcionam sem precisar de migração de schema.
--
-- A coluna `water` guarda MILILITROS. Registros antigos (<= 3) são garrafas de
-- 1,2 L e o app converte na leitura — ver lib/storage.ts.
create table if not exists daily_checks (
  date date primary key,
  meals jsonb not null default '{}'::jsonb,
  water int not null default 0,
  workout boolean not null default false,
  supplements jsonb not null default '{}'::jsonb,
  exercises jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- Migration para tabela já existente (rodar 1x se você já criou daily_checks antes)
alter table daily_checks
  add column if not exists exercises jsonb not null default '{}'::jsonb;

-- 2) Tabela de histórico de peso
create table if not exists weights (
  date date primary key,
  weight numeric(5,2) not null,
  created_at timestamptz not null default now()
);

-- 3) Habilitar Row Level Security e permitir acesso anônimo (sem login)
alter table daily_checks enable row level security;
alter table weights enable row level security;

drop policy if exists "anon all daily_checks" on daily_checks;
drop policy if exists "anon all weights" on weights;

create policy "anon all daily_checks"
  on daily_checks
  for all
  to anon, authenticated
  using (true)
  with check (true);

create policy "anon all weights"
  on weights
  for all
  to anon, authenticated
  using (true)
  with check (true);

-- 4) Tabela única com estado da lista de compras (1 linha)
-- items     = ids dos ingredientes marcados como JÁ COMPRADOS
-- selected_meals = ids das refeições selecionadas (definem o que vai na lista)
create table if not exists shopping_state (
  id int primary key default 1,
  items jsonb not null default '{}'::jsonb,
  selected_meals jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  constraint shopping_state_single_row check (id = 1)
);

-- Migration para quem já criou a tabela antes
alter table shopping_state
  add column if not exists selected_meals jsonb not null default '{}'::jsonb,
  add column if not exists selected_components jsonb not null default '{}'::jsonb;

insert into shopping_state (id, items)
values (1, '{}'::jsonb)
on conflict (id) do nothing;

alter table shopping_state enable row level security;

drop policy if exists "anon all shopping_state" on shopping_state;
create policy "anon all shopping_state"
  on shopping_state
  for all
  to anon, authenticated
  using (true)
  with check (true);

-- 5) Trigger para atualizar updated_at em daily_checks
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_daily_checks_updated on daily_checks;
create trigger trg_daily_checks_updated
  before update on daily_checks
  for each row
  execute function set_updated_at();

-- =============================================================================
-- 6) Configuração do app (1 linha) — rotina e preferências editáveis pelo app
-- Sem esta tabela o app continua funcionando: ele guarda a rotina no próprio
-- aparelho (localStorage). Rodando este bloco, a rotina passa a sincronizar
-- entre celular e computador.
-- =============================================================================
create table if not exists app_config (
  id int primary key default 1,
  rotina jsonb,
  preferencias jsonb,
  updated_at timestamptz not null default now(),
  constraint app_config_single_row check (id = 1)
);

-- Migration para quem já criou a tabela antes das preferências
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

-- =============================================================================
-- 7) Medidas corporais para o antes e depois
-- Também tem queda para o aparelho caso a tabela não exista ainda.
-- =============================================================================
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
