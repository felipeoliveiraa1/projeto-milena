# Configurar Supabase

## 1. Criar o projeto

1. Acesse https://supabase.com e faça login.
2. Clique em **New Project** dentro de uma organização.
3. Preencha:
   - **Name**: `treino-milena` (ou o que quiser)
   - **Database Password**: crie uma senha forte e guarde
   - **Region**: `South America (São Paulo)` (mais próximo do Brasil)
4. Clique **Create new project** e aguarde ~2 min.

## 2. Rodar o schema (criar tabelas)

1. No menu lateral do projeto, abra **SQL Editor**.
2. Clique **New query**.
3. Cole o conteúdo de `supabase/schema.sql` (na raiz deste projeto).
4. Clique **Run** (canto inferior direito).
5. Confirme que viu **Success. No rows returned** — as tabelas `daily_checks` e `weights` foram criadas.

## 3. Pegar URL e chave anônima

1. No menu lateral abra **Project Settings** → **API**.
2. Copie:
   - **Project URL** (ex.: `https://abcd1234.supabase.co`)
   - **anon public** key (a chave longa que começa com `eyJ...`)

## 4. Configurar o app

Crie o arquivo `.env.local` na raiz do projeto (ele já é ignorado pelo git):

```
NEXT_PUBLIC_SUPABASE_URL=https://SEU-PROJETO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJI...
```

Reinicie o servidor de desenvolvimento:

```
npm run dev
```

## 5. Deploy na Vercel

Quando subir na Vercel, adicione as MESMAS duas variáveis de ambiente nas configurações do projeto:

1. Vercel → seu projeto → **Settings** → **Environment Variables**
2. Adicione `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
3. Faça redeploy.

## 6. Migrations

Depois do schema, rode os arquivos de `supabase/migrations/` em ordem, um por vez, do mesmo jeito: **SQL Editor** → **New query** → colar → **Run**. O cabeçalho de cada arquivo diz o que ele destrava e se tem pré-requisito — a 0003, por exemplo, só roda depois de o login estar no ar.

> **Não rode o `schema.sql` de novo num projeto que já tem login.** Ele recria as políticas `anon all`, e como as políticas do Postgres se somam, o acesso sem login voltaria para as tabelas antigas. Em projeto que já existe, mudança vai só pelas migrations.

### 0006 — Exames de bioimpedância

A aba **Progresso → Exame** guarda os exames de bioimpedância na tabela `bioimpedance`.

1. Confirme que a `0002_preparar_login.sql` já rodou: ela cria a função `public.is_allowed()`, usada na política de acesso.
2. Rode `supabase/migrations/0006_bioimpedancia.sql`.
3. Rode as consultas de conferência do fim do arquivo: tem que aparecer a política `acesso liberado bioimpedance`, e o `anon` não pode estar nos grants.

- Enquanto a tabela não existir, o app guarda os exames no aparelho e mostra o aviso "ainda só neste aparelho". Quando a tabela passar a existir, o que ficou pendente sobe sozinho na próxima vez que a aba abrir — no mesmo aparelho em que foi salvo.
- Exame apagado sem a nuvem confirmar (sem internet, sessão vencida ou tabela ainda inexistente) entra numa fila de exclusões do aparelho: some da tela na hora e é apagado da nuvem na próxima leitura que a encontrar no ar. Até lá, o histórico avisa "A exclusão de 1 exame ainda não chegou à nuvem". Sem essa fila, a leitura seguinte, que confia na nuvem, traria o exame de volta.
- A migration já traz os grants explícitos que o Supabase passou a exigir para tabela nova (projetos novos desde 30/05/2026; os existentes a partir de 30/10/2026).
- O exame de 12/08/2026, ponto de partida, não vai para o banco: está no código (`data/bioimpedancia.ts`) e aparece sempre.

---

### Como funciona

- **Com login**: só entra quem tem conta em Authentication → Users e está na tabela `allowed_users` (migrations 0002, 0003 e 0005).
- Os dados ficam salvos no banco PostgreSQL do Supabase.
- Cada dia tem uma linha em `daily_checks` com a data como chave.
- O peso fica em `weights`, indexado por data; os exames de bioimpedância, em `bioimpedance`.
- Tudo é salvo automaticamente conforme você marca/desmarca.
