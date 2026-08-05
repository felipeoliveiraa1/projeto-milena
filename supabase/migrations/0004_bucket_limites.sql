-- =============================================================================
-- 0004 — Limites do bucket de fotos (opcional, mas recomendado)
--
-- O bucket e as políticas já vieram na 0002. Isto aqui só aperta o cinto:
-- o app manda JPEG de ~250 KB, então qualquer coisa muito acima disso é
-- engano ou abuso.
-- =============================================================================

update storage.buckets
set
  file_size_limit = 5242880, -- 5 MB
  allowed_mime_types = array['image/jpeg']
where id = 'progresso';

-- Conferência do estado do bucket e das políticas:
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
