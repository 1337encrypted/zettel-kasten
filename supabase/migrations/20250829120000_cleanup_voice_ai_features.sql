-- Remove voice assistant and AI features cleanup migration

-- Drop voice conversations table and related policies
DROP TABLE IF EXISTS public.voice_conversations CASCADE;

-- Drop note embeddings table and related policies  
DROP TABLE IF EXISTS public.note_embeddings CASCADE;

-- Drop vector search function
DROP FUNCTION IF EXISTS public.search_notes_by_similarity(UUID, VECTOR, INTEGER);

-- Note: We're keeping the vector extension as it might be used for other purposes
-- DROP EXTENSION IF EXISTS vector;