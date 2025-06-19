
-- Enable the pgvector extension for vector operations
CREATE EXTENSION IF NOT EXISTS vector;

-- Create a table for voice assistant conversations
CREATE TABLE public.voice_conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  session_id UUID NOT NULL DEFAULT gen_random_uuid(),
  message_type TEXT NOT NULL CHECK (message_type IN ('user', 'assistant')),
  content TEXT NOT NULL,
  audio_url TEXT,
  note_references UUID[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create a table for note embeddings (for semantic search)
CREATE TABLE public.note_embeddings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  note_id UUID REFERENCES public.notes(id) ON DELETE CASCADE NOT NULL,
  embedding VECTOR(1536), -- OpenAI embedding dimension
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for vector similarity search
CREATE INDEX ON public.note_embeddings USING ivfflat (embedding vector_cosine_ops);

-- Add Row Level Security
ALTER TABLE public.voice_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.note_embeddings ENABLE ROW LEVEL SECURITY;

-- RLS policies for voice_conversations
CREATE POLICY "Users can view their own voice conversations" 
  ON public.voice_conversations 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own voice conversations" 
  ON public.voice_conversations 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own voice conversations" 
  ON public.voice_conversations 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own voice conversations" 
  ON public.voice_conversations 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- RLS policies for note_embeddings
CREATE POLICY "Users can view embeddings for their own notes" 
  ON public.note_embeddings 
  FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.notes 
    WHERE notes.id = note_embeddings.note_id 
    AND notes.user_id = auth.uid()
  ));

CREATE POLICY "Users can create embeddings for their own notes" 
  ON public.note_embeddings 
  FOR INSERT 
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.notes 
    WHERE notes.id = note_embeddings.note_id 
    AND notes.user_id = auth.uid()
  ));

CREATE POLICY "Users can update embeddings for their own notes" 
  ON public.note_embeddings 
  FOR UPDATE 
  USING (EXISTS (
    SELECT 1 FROM public.notes 
    WHERE notes.id = note_embeddings.note_id 
    AND notes.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete embeddings for their own notes" 
  ON public.note_embeddings 
  FOR DELETE 
  USING (EXISTS (
    SELECT 1 FROM public.notes 
    WHERE notes.id = note_embeddings.note_id 
    AND notes.user_id = auth.uid()
  ));

-- Function to search notes by similarity
CREATE OR REPLACE FUNCTION public.search_notes_by_similarity(
  p_user_id UUID,
  p_query_embedding VECTOR(1536),
  p_limit INTEGER DEFAULT 5
)
RETURNS TABLE(
  note_id UUID,
  title TEXT,
  content TEXT,
  tags TEXT[],
  similarity FLOAT
)
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT 
    n.id as note_id,
    n.title,
    n.content,
    n.tags,
    1 - (ne.embedding <=> p_query_embedding) as similarity
  FROM public.note_embeddings ne
  JOIN public.notes n ON ne.note_id = n.id
  WHERE n.user_id = p_user_id
  ORDER BY ne.embedding <=> p_query_embedding
  LIMIT p_limit;
$$;
