-- =============================================================================
-- 0007 — Lembretes no celular (remédios e água)
--
-- Pendente de aplicação. Idempotente: pode rodar mais de uma vez sem quebrar.
-- Precisa da 0002 antes: é ela que cria a função public.is_allowed(), usada
-- na política de acesso abaixo.
--
-- O que destrava:
--   push_subscriptions → cada celular que ativa os lembretes em Ajustes vira
--                        uma linha aqui (o endereço de push do aparelho)
--   push_envios        → o que já foi avisado no dia, para nunca avisar duas
--                        vezes o mesmo remédio ou o mesmo copo de água
--   pg_cron + pg_net   → a cada minuto o banco chama /api/lembretes no app,
--                        que confere a agenda do dia e manda o que venceu
--
-- O segredo do cron NÃO mora neste arquivo (o repositório é público). Ele fica
-- no Vault do Supabase, com o nome 'lembretes_cron_secret'. Para gravar, rode
-- o arquivo local supabase/0007_lembretes_agendar.local.sql (fora do git) ou a
-- linha comentada da seção 6 com o valor de CRON_SECRET da Vercel. Passo a
-- passo em docs/setup-lembretes.md.
--
-- Sem esta migration o app continua funcionando igual: o botão "Ativar
-- lembretes neste celular" só avisa que não conseguiu guardar o aparelho.
-- =============================================================================

-- 1) Um aparelho por linha. O endpoint é o endereço que o navegador entrega
--    ao se inscrever; p256dh e auth são as chaves para cifrar o aviso.
create table if not exists public.push_subscriptions (
  endpoint text primary key,
  p256dh text not null,
  auth text not null,
  user_agent text,             -- só para saber qual aparelho é qual
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2) Mesmo acesso das outras tabelas depois da 0003: só quem está em
--    allowed_users, e nada para quem não entrou. O app grava e apaga a
--    linha do próprio aparelho; o servidor lê tudo com a chave secreta.
alter table public.push_subscriptions enable row level security;

drop policy if exists "acesso liberado push_subscriptions" on public.push_subscriptions;
create policy "acesso liberado push_subscriptions"
  on public.push_subscriptions for all to authenticated
  using (public.is_allowed()) with check (public.is_allowed());

-- 3) Grants explícitos. Desde 30/05/2026 os projetos novos do Supabase não
--    expõem tabela nova à API por conta própria, e a regra passa a valer para
--    os projetos existentes em 30/10/2026. Sem isto, a API nem enxerga a
--    tabela, com ou sem a política acima. O anon fica de fora de propósito.
grant select, insert, update, delete on public.push_subscriptions to authenticated;
grant select, insert, update, delete on public.push_subscriptions to service_role;
revoke all on public.push_subscriptions from anon;

-- 4) O que já saiu. A chave é "AAAA-MM-DD|id do lembrete" ("2026-10-18|rem-07:40").
--    Só o servidor mexe aqui: RLS ligado e nenhuma política, então nem o app
--    logado lê ou grava pela API.
create table if not exists public.push_envios (
  chave text primary key,
  enviado_em timestamptz default now()
);

alter table public.push_envios enable row level security;

grant select, insert, update, delete on public.push_envios to service_role;
revoke all on public.push_envios from anon, authenticated;

-- 5) Agendador e chamadas HTTP de dentro do banco.
create extension if not exists pg_cron;
create extension if not exists pg_net with schema extensions;

-- =============================================================================
-- 6) Agendamento
--
-- Primeiro, uma vez só, o segredo no Vault — com o MESMO valor de CRON_SECRET
-- da Vercel. O valor de verdade nunca entra no repositório: use o arquivo
-- local supabase/0007_lembretes_agendar.local.sql, ou troque o texto abaixo
-- no SQL Editor e rode só esta linha:
--
-- select vault.create_secret('COLE_AQUI_O_CRON_SECRET', 'lembretes_cron_secret');
--
-- O job lê o segredo do Vault a cada disparo. Enquanto ele não existir, o
-- disparo sai sem senha, a rota recusa e nada é avisado — não quebra nada.
-- Trocou o segredo na Vercel? Atualize no Vault (vault.update_secret) e
-- pronto, sem reagendar.
-- =============================================================================

-- 6a) A cada minuto: chama a rota dos lembretes. Desagenda antes, para rodar
--     de novo sem duplicar o job.
select cron.unschedule(jobid) from cron.job where jobname = 'mais-leve-lembretes';

select cron.schedule(
  'mais-leve-lembretes',
  '* * * * *',
  $$
  select net.http_post(
    url := 'https://projeto-milena-theta.vercel.app/api/lembretes',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (
        select decrypted_secret from vault.decrypted_secrets
        where name = 'lembretes_cron_secret'
      )
    ),
    body := '{}'::jsonb,
    timeout_milliseconds := 20000
  );
  $$
);

-- 6b) Uma vez por dia (03:30 UTC = 00:30 em São Paulo): apaga o registro de
--     envios com mais de 7 dias (basta o do dia para não avisar em dobro) e o
--     histórico do pg_cron com mais de 7 dias, que ganha uma linha por minuto.
--     Só pela idade, sem filtrar pelo job: rodar este arquivo de novo recria
--     os jobs com outro jobid, e o histórico dos antigos nunca sairia. As
--     respostas do pg_net o próprio Supabase limpa sozinho.
select cron.unschedule(jobid) from cron.job where jobname = 'mais-leve-lembretes-limpeza';

select cron.schedule(
  'mais-leve-lembretes-limpeza',
  '30 3 * * *',
  $$
  delete from public.push_envios where enviado_em < now() - interval '7 days';
  delete from cron.job_run_details where end_time < now() - interval '7 days';
  $$
);

-- =============================================================================
-- Conferência rápida depois de rodar:
--
--   select policyname, roles, cmd
--   from pg_policies
--   where tablename in ('push_subscriptions', 'push_envios');
--
--   select table_name, grantee, string_agg(privilege_type, ', ') as pode
--   from information_schema.role_table_grants
--   where table_name in ('push_subscriptions', 'push_envios')
--   group by table_name, grantee;
--
--   select jobname, schedule, active from cron.job where jobname like 'mais-leve-%';
--
--   select name from vault.secrets where name = 'lembretes_cron_secret';
--
-- Depois de alguns minutos, os disparos e o que a rota respondeu:
--
--   select status, return_message, start_time
--   from cron.job_run_details
--   order by start_time desc limit 5;
--
--   select status_code, content, created
--   from net._http_response
--   order by created desc limit 5;
--
-- O esperado: a política "acesso liberado push_subscriptions" para
-- authenticated, nenhuma política em push_envios, o anon fora da lista de
-- grants das duas, os dois jobs ativos e o status_code 200 nas respostas
-- (401 = o segredo do Vault não bate com o CRON_SECRET da Vercel; 500 = falta
-- variável de ambiente na Vercel — o "erro" da resposta diz qual).
-- =============================================================================
