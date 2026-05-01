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

---

### Como funciona

- **Sem login**: qualquer um com a URL do app vê e edita os dados (você escolheu essa opção).
- Os dados ficam salvos no banco PostgreSQL do Supabase.
- Cada dia tem uma linha em `daily_checks` com a data como chave.
- O peso fica em `weights`, indexado por data.
- Tudo é salvo automaticamente conforme você marca/desmarca.
