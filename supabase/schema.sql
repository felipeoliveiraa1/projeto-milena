-- =============================================================================
-- Schema do Treino & Dieta da Milena
-- Cole este SQL no SQL Editor do Supabase e clique em "Run".
-- =============================================================================

-- 1) Tabela de check-ins diários (refeições, água, treino, suplementos, exercícios)
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
