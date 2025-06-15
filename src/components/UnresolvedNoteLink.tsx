
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Link2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface UnresolvedNoteLinkProps {
  noteId: string;
}

const UnresolvedNoteLink: React.FC<UnresolvedNoteLinkProps> = ({ noteId }) => {
  const navigate = useNavigate();

  const { data: note, isLoading, isError } = useQuery({
    queryKey: ['publicNote', noteId],
    queryFn: async () => {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(noteId)) {
        return null;
      }

      const { data, error } = await supabase
        .from('notes')
        .select('id, title, slug, user_id, is_public')
        .eq('id', noteId)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') { // Not found
          return null;
        }
        throw new Error(error.message);
      }
      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    retry: (failureCount, error: any) => {
      if (error?.code === 'PGRST116') return false;
      return failureCount < 2;
    },
  });

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if (!note || !note.slug) return;
    navigate(`/u/${note.user_id}/${note.slug}`);
  };

  if (isLoading) {
    return <span className="text-primary/50 italic animate-pulse">[[...]]</span>;
  }

  if (!isError && note && note.is_public && note.slug) {
    return (
      <a
        className="text-primary hover:underline cursor-pointer font-semibold inline-flex items-center gap-1"
        onClick={handleClick}
        href={`/u/${note.user_id}/${note.slug}`}
      >
        <Link2 className="w-4 h-4" />
        {note.title}
      </a>
    );
  }

  return (
    <span className="text-muted-foreground italic">
      {`[[${noteId}]]`}
    </span>
  );
};

export default UnresolvedNoteLink;
