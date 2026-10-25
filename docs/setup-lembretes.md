# Lembretes no celular (remédios e água)

O app avisa no celular a hora de cada remédio e de cada copo de água. Funciona assim:

1. Em **Ajustes → Lembretes no celular**, a Milena toca em **Ativar lembretes neste celular**. O aparelho fica guardado na tabela `push_subscriptions` do Supabase.
2. A cada minuto, o próprio Supabase (pg_cron) chama `https://projeto-milena-theta.vercel.app/api/lembretes` com uma senha (`CRON_SECRET`).
3. A rota monta a agenda do dia (a mesma que aparece em Ajustes), pega o que venceu nos últimos 15 minutos, **pula o que ela já marcou no app** (remédio já tomado, água já bebida) e manda o aviso. Cada lembrete sai uma vez só por dia.

São quatro etapas: Supabase, Vercel, iPhone e conferência.

---

## 1. Supabase — tabelas e agendamento

No painel do projeto: **SQL Editor → New query**.

1. Cole todo o conteúdo de `supabase/migrations/0007_lembretes.sql` e clique em **Run**. Ele cria as tabelas `push_subscriptions` e `push_envios`, liga o `pg_cron` e o `pg_net` e agenda os dois jobs (`mais-leve-lembretes`, a cada minuto, e `mais-leve-lembretes-limpeza`, uma vez por dia).
2. Abra outra query, cole o conteúdo de `supabase/0007_lembretes_agendar.local.sql` e clique em **Run**. Esse arquivo grava a senha do cron no **Vault** do Supabase.
   - Ele **só existe no seu computador**. Está no `.gitignore` (`supabase/*.local.sql`) porque tem a senha de verdade, e o repositório é público. Não mande esse arquivo para ninguém e não cole o conteúdo dele em issue nem em chat.
   - Não tem o arquivo, ou está em outro computador? Rode só esta linha, trocando o texto pelo valor de `CRON_SECRET` que você vai pôr na Vercel:
     ```sql
     select vault.create_secret('COLE_AQUI_O_CRON_SECRET', 'lembretes_cron_secret');
     ```
3. Confira:
   ```sql
   select jobname, schedule, active from cron.job where jobname like 'mais-leve-%';
   select name from vault.secrets where name = 'lembretes_cron_secret';
   ```
   Têm que aparecer os dois jobs com `active = true` e o segredo `lembretes_cron_secret`.

> Os dois arquivos podem rodar de novo sem problema: não duplicam nada.

## 2. Vercel — variáveis de ambiente

**Vercel → projeto → Settings → Environment Variables**, ambiente **Production**. Adicione:

| Variável | De onde vem |
|---|---|
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | do `.env.local` (chave pública VAPID) |
| `VAPID_PRIVATE_KEY` | do `.env.local` (chave privada VAPID) — marque como **Sensitive** |
| `VAPID_SUBJECT` | do `.env.local` (um `https://...` ou `mailto:...`) |
| `CRON_SECRET` | do `.env.local` — **o mesmo valor** gravado no Vault na etapa 1 — **Sensitive** |
| `SUPABASE_SECRET_KEY` | Supabase → **Project Settings → API Keys** → a chave **secret** (`sb_secret_...`). Projeto antigo, só com as chaves legadas: a **service_role**. **Sensitive** |

**A ordem importa: primeiro as variáveis, depois o código.** O código novo (a rota `/api/lembretes` e a tela de Ajustes com os lembretes) precisa estar no ar, e a `NEXT_PUBLIC_VAPID_PUBLIC_KEY` entra no app na hora do build. Então:

- Código ainda não enviado? Ponha as variáveis acima **e só depois** faça o `git push`. O deploy automático da Vercel já sai com elas — não precisa de redeploy.
- O código já estava no ar antes de você pôr as variáveis? Aí sim: **Deployments → ⋯ no último deploy → Redeploy**. Sem um deploy novo as variáveis não valem.

Depois do deploy, no iPhone, **feche o app de vez** (deslize para cima na troca de apps) e abra de novo pelo ícone. Assim a versão antiga, que ainda pode estar aberta, não grava os Ajustes no formato velho por cima dos novos.

Cuidados:

- `SUPABASE_SECRET_KEY` e `VAPID_PRIVATE_KEY` passam por cima de todas as proteções. Ficam **só** na Vercel e no `.env.local`. Nunca com o prefixo `NEXT_PUBLIC_`, nunca no código.
- Trocar as chaves VAPID desliga todos os aparelhos já ativados: cada um precisa tocar em **Ativar** de novo.
- Trocar o `CRON_SECRET`: mude na Vercel, faça o redeploy e atualize no Vault (rode o arquivo local de novo com o valor novo).

O `.env.example` tem os **nomes** dessas variáveis, sem valor, para lembrar o que precisa existir.

## 3. iPhone da Milena

Precisa do **iOS 16.4 ou mais novo**. No iPhone, notificação de site só funciona com o app instalado na Tela de Início.

1. No **Safari**, abra https://projeto-milena-theta.vercel.app.
2. Toque em **Compartilhar** (o quadrado com a seta) → **Adicionar à Tela de Início**. Nessa tela, deixe ligado **Abrir como App Web** e toque em **Adicionar**. Já tinha o ícone? Pode usar o mesmo.
3. Abra o **Mais Leve pelo ícone** da Tela de Início (não pelo Safari) e entre com o login dela.
4. Vá em **Ajustes** (a engrenagem) → **Lembretes no celular** → **Ativar lembretes neste celular** → **Permitir**.
5. Toque em **Enviar um teste**. Em alguns segundos chega "Mais Leve · teste".
6. Na mesma tela, as chaves **Remédios** e **Água** escolhem o que avisa, e a lista mostra os horários de hoje. A hora de cada remédio muda em **Ajustes → Horários dos remédios**. Mudou algo? Salve.

Pode ativar mais de um aparelho (o seu também): cada um recebe os mesmos avisos.

O Mais Leve não aparece em **Ajustes do iPhone → Notificações**? Apague o ícone da Tela de Início e adicione de novo pelo Safari (passo 2), abra pelo ícone e ative outra vez.

**Privacidade:** o aviso mostra o nome dos remédios, e por padrão isso aparece na tela bloqueada. Para só aparecer com o iPhone desbloqueado: **Ajustes do iPhone → Notificações → Mais Leve → Mostrar Pré-visualizações → Quando Desbloqueado**.

## 4. Conferir se está rodando

Depois de alguns minutos, no **SQL Editor**:

```sql
-- os disparos do pg_cron
select status, return_message, start_time
from cron.job_run_details
order by start_time desc limit 5;

-- o que a rota respondeu
select status_code, content, created
from net._http_response
order by created desc limit 5;
```

- `200` — está funcionando.
- `401` — a senha do Vault não bate com o `CRON_SECRET` da Vercel.
- `500` — falta uma variável na Vercel; o campo `erro` diz qual (ex.: `falta SUPABASE_SECRET_KEY ...`).

Para ver o que sairia **agora**, sem mandar nada, use o `?dry=1`. No terminal (o `read -s` pede a senha sem mostrar nem guardar no histórico):

```bash
read -s CRON_SECRET
curl -s -H "Authorization: Bearer $CRON_SECRET" \
  "https://projeto-milena-theta.vercel.app/api/lembretes?dry=1"
```

A resposta tem `agora` (data e hora de São Paulo), `devidos` (o que venceu nos últimos 15 minutos e ainda não foi feito), `pulados` (o que ela já marcou), `assinaturas` (quantos aparelhos estão ativos), `enviados` e `expiradas`. Fora do `?dry=1` vêm também `erros` e `liberados`: um lembrete que não chegou a aparelho nenhum por falha do envio volta para a fila, e o disparo do minuto seguinte tenta de novo, dentro dos 15 minutos. Fora de um horário de lembrete, `devidos` vem vazio — é o normal.

Para parar tudo de uma vez (sem apagar nada):

```sql
select cron.unschedule('mais-leve-lembretes');
```

Para voltar, rode a seção 6 da `0007_lembretes.sql` de novo.

## Limitações

- **No iPhone, só com o app instalado** na Tela de Início e aberto pelo ícone ao menos uma vez. Pelo Safari comum não chega nada.
- **No iPhone, só com "Abrir como App Web" ligado** na tela de Adicionar à Tela de Início. Desligado, o ícone abre o Safari comum, e lá não chega nada.
- **Foco / Não Perturbe** silencia os avisos, como os de qualquer app. Para não perder, dá para liberar o Mais Leve no modo Foco: Ajustes do iPhone → Foco → (o modo) → Apps.
- **Resumo Agendado** junta os avisos e entrega só nos horários do resumo — o lembrete do remédio chegaria atrasado. Em Ajustes do iPhone → Notificações → Resumo Agendado, deixe o Mais Leve fora.
- É uma **notificação com som, não um despertador**: não toca sem parar e não fura o modo silencioso.
- O aviso pode atrasar um ou dois minutos (o cron roda de minuto em minuto, e a Apple entrega quando o aparelho acorda). Um aviso que não conseguiu sair em meia hora é descartado — não chega um lembrete velho.
- O lembrete some sozinho se ela **já marcou** no app antes da hora (remédio tomado ou água registrada).
- **Remédio em pausa não avisa**: os que param antes da cirurgia (pela data em Ajustes) e o que ela pausou na Farmácia — desde 24/10, o psyllium. Para voltar, é tocar em **Retomar o psyllium** no cartão dele, na aba Rotina.
- **Nenhum lembrete sai antes das 05:00**, a hora em que o dia do app vira: até lá, o que ela marca ainda vai para o dia anterior. Por isso a hora de acordar, o primeiro copo de água e a abertura da janela começam às 05:00, no mínimo, e nenhum remédio é lembrado antes da hora de acordar — a não ser que ela mesma escolha uma hora mais cedo em **Horários dos remédios** (também a partir das 05:00).
- Se os avisos pararem num aparelho (troca de celular, app reinstalado, notificação desligada nos Ajustes do iPhone): abra o app pelo ícone → Ajustes → **Desativar neste celular** → **Ativar** de novo.
