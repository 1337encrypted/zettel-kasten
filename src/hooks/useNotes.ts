
import { useQuery } from '@tanstack/react-query';
import { Note } from '@/types';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
// fromNoteDb is in a read-only file, so we can't update it. We'll map the data manually.
// import { fromNoteDb } from './notes/noteUtils';
import { useSaveNote } from './notes/useSaveNote';
import { useDeleteNote } from './notes/useDeleteNote';
import { useDeleteMultipleNotes } from './notes/useDeleteMultipleNotes';
import { useDeleteNotesByFolder } from './notes/useDeleteNotesByFolder';

export const useNotes = () => {
  const { user } = useAuth();

  const { data: notes = [], isLoading } = useQuery<Note[]>({
    queryKey: ['notes', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) {
        toast.error("Failed to load notes.");
        throw new Error(error.message);
      }
      
      return data.map((dbNote: any) => ({
        id: dbNote.id,
        title: dbNote.title,
        content: dbNote.content || '',
        createdAt: new Date(dbNote.created_at),
        updatedAt: new Date(dbNote.updated_at),
        folderId: dbNote.folder_id,
        tags: dbNote.tags || [],
        isPublic: dbNote.is_public,
        slug: dbNote.slug,
        userId: dbNote.user_id,
      }));
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
