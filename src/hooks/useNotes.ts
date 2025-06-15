
import { useQuery } from '@tanstack/react-query';
import { Note } from '@/types';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { fromNoteDb } from './notes/noteUtils';
import { useSaveNote } from './notes/useSaveNote';
import { useDeleteNote } from './notes/useDeleteNote';
import { useDeleteMultipleNotes } from './notes/useDeleteMultipleNotes';
import { useDeleteNotesByFolder } from './notes/useDeleteNotesByFolder';

export const useNotes = () => {
  const { user } = useAuth();

  const { data: notes = [], isLoading } = useQuery({
    queryKey: ['notes', user?.id],
    queryFn: async (): Promise<Note[]> => {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('user_id', user!.id)
        .order('updated_at', { ascending: false });

      if (error) {
        toast.error("Failed to load notes.");
        throw new Error(error.message);
      }
      return data.map(fromNoteDb);
    },
    enabled: !!user,
  });

  const saveNoteMutation = useSaveNote();
  const deleteNoteMutation = useDeleteNote();
  const deleteMultipleNotesMutation = useDeleteMultipleNotes();
  const deleteNotesByFolderIdsMutation = useDeleteNotesByFolder();

  return {
    notes,
    isLoading,
    saveNote: saveNoteMutation.mutateAsync,
    deleteNote: deleteNoteMutation.mutate,
    deleteMultipleNotes: deleteMultipleNotesMutation.mutateAsync,
    deleteNotesByFolderIds: deleteNotesByFolderIdsMutation.mutateAsync,
  };
};
