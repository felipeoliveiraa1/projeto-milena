-- =============================================================================
-- 0004 — Teto de tamanho no bucket de fotos (opcional)
--
-- O bucket e as políticas já vieram na 0002; isto aqui é só cinto de segurança.
-- O app comprime toda foto para ~250 KB antes de enviar, então o teto de 5 MB
-- nunca é alcançado no uso normal — ele serve para o caso de alguém enviar
-- direto pela API, fora do app.
--
-- Rodar é opcional. Não muda nada no dia a dia.
-- =============================================================================

update storage.buckets
set file_size_limit = 5242880 -- 5 MB
where id = 'progresso';

-- -----------------------------------------------------------------------------
-- Travar o formato NÃO está incluído de propósito.
--
-- O app sempre converte para JPEG antes de subir, então hoje isto funcionaria:
--
--   update storage.buckets
--   set allowed_mime_types = array['image/jpeg']
--   where id = 'progresso';
--
-- Só que no dia em que o app passar a mandar outro formato (WebP, por
-- exemplo), o upload começaria a falhar aqui no banco, longe de onde o erro
-- aparece. O ganho é pequeno e o custo de depurar é alto — por isso ficou
-- comentado.
-- -----------------------------------------------------------------------------

-- Conferência do bucket e das políticas:
--
--   select id, public, file_size_limit, allowed_mime_types
--   from storage.buckets where id = 'progresso';
--
--   select policyname, cmd
--   from pg_policies
--   where schemaname = 'storage' and tablename = 'objects'
--     and policyname like 'progresso%';
--
-- O esperado: public = false e três políticas (ler, enviar, apagar).
