-- =============================================================================
-- 0006 — Exames de bioimpedância
--
-- Pendente de aplicação. Idempotente: pode rodar mais de uma vez sem quebrar.
-- Precisa da 0002 antes: é ela que cria a função public.is_allowed(), usada
-- na política de acesso abaixo.
--
-- O que destrava:
--   bioimpedance → os exames que a Milena registra em Progresso → Exame saem
--                  do aparelho e passam a sincronizar entre celular e computador
--
-- Sem esta migration o app continua funcionando: guarda os exames no próprio
-- aparelho, avisa "ainda só neste aparelho" e, na primeira vez que abrir a
-- aba depois de a tabela existir, sobe sozinho o que ficou pendente.
--
-- O exame de partida (12/08/2026) NÃO entra aqui: ele mora no código, em
-- data/bioimpedancia.ts, e aparece sempre — mesmo com a tabela vazia. Um exame
-- salvo com a mesma data vale por cima dele (é assim que se corrige o laudo).
-- =============================================================================

-- 1) Um exame por data, com os números do laudo
create table if not exists public.bioimpedance (
  date date primary key,
  peso numeric(5,1),         -- kg
  gordura numeric(4,1),      -- % de gordura corporal
  musculo numeric(4,1),      -- % de músculo esquelético
  visceral numeric(3,1),     -- nível; alguns aparelhos marcam meio nível (9,5)
  metabolismo numeric(6,1),  -- metabolismo em repouso, kcal por dia
  idade_corporal smallint,   -- anos, estimada pela balança
  idade smallint,            -- idade dela no dia do exame: as faixas mudam aos 40
  obs text,                  -- anotação livre: horário, aparelho, fase do ciclo
  created_at timestamptz not null default now()
);

-- 2) Mesmo acesso das outras tabelas depois da 0003: só quem está em
--    allowed_users, e nada para quem não entrou.
alter table public.bioimpedance enable row level security;

drop policy if exists "acesso liberado bioimpedance" on public.bioimpedance;
create policy "acesso liberado bioimpedance"
  on public.bioimpedance for all to authenticated
  using (public.is_allowed()) with check (public.is_allowed());

-- 3) Grants explícitos. Desde 30/05/2026 os projetos novos do Supabase não
--    expõem tabela nova à API por conta própria, e a regra passa a valer para
--    os projetos existentes em 30/10/2026. Sem isto, a API nem enxerga a
--    tabela, com ou sem a política acima. O anon fica de fora de propósito.
grant select, insert, update, delete on public.bioimpedance to authenticated;
grant select, insert, update, delete on public.bioimpedance to service_role;
revoke all on public.bioimpedance from anon;

-- =============================================================================
-- Conferência rápida depois de rodar:
--
--   select date, peso, gordura, musculo, visceral, metabolismo, idade_corporal
--   from public.bioimpedance
--   order by date;
--
--   select policyname, roles, cmd
--   from pg_policies
--   where tablename = 'bioimpedance';
--
--   select grantee, string_agg(privilege_type, ', ') as pode
--   from information_schema.role_table_grants
--   where table_name = 'bioimpedance'
--   group by grantee;
--
-- O esperado: a política "acesso liberado bioimpedance" para authenticated, e
-- o anon fora da lista de grants. No app, o aviso "ainda só neste aparelho"
-- some do histórico da aba Exame.
-- =============================================================================
