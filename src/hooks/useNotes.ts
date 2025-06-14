import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Note } from '@/types';
import { toast } from "@/components/ui/sonner";
import { supabase } from '@/integrations/supabase/client';

const fromNoteDb = (dbNote: any): Note => ({
    id: dbNote.id,
    title: dbNote.title,
    content: dbNote.content,
    createdAt: new Date(dbNote.created_at),
    updatedAt: new Date(dbNote.updated_at),
    folderId: dbNote.folder_id,
    tags: dbNote.tags || [],
});

export const useNotes = () => {
  const queryClient = useQueryClient();

  const { data: notes = [], isLoading } = useQuery({
    queryKey: ['notes'],
    queryFn: async (): Promise<Note[]> => {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) {
        toast.error("Failed to load notes.");
        throw new Error(error.message);
      }
      return data.map(fromNoteDb);
    }
  });

  const saveNoteMutation = useMutation({
    mutationFn: async (noteData: Pick<Note, 'title' | 'content' | 'tags'> & { id?: string, folderId?: string | null }): Promise<Note> => {
      const noteToSave = {
        title: noteData.title,
        content: noteData.content,
        tags: noteData.tags || [],
        folder_id: noteData.folderId,
        updated_at: new Date().toISOString(),
      };

      if (noteData.id) {
        const { data, error } = await supabase
          .from('notes')
          .update(noteToSave)
          .eq('id', noteData.id)
          .select()
          .single();

        if (error) { throw error; }
        toast.success(`Note "${data.title}" updated!`);
        return fromNoteDb(data);
      } else {
        const { data, error } = await supabase
          .from('notes')
          .insert(noteToSave)
          .select()
          .single();
        
        if (error) { throw error; }
        toast.success(`Note "${data.title}" created!`);
        return fromNoteDb(data);
      }
    },
    onSuccess: (savedNote) => {
        queryClient.invalidateQueries({ queryKey: ['notes'] });
        queryClient.setQueryData(['notes', savedNote.id], savedNote);
    },
    onError: (error: any) => {
        if (error.code === '23505') {
            toast.error(`A note with that title already exists in this folder.`);
        } else {
            toast.error(error.message);
        }
    }
  });

  const deleteNoteMutation = useMutation({
      mutationFn: async (noteId: string) => {
        const { error } = await supabase.from('notes').delete().eq('id', noteId);
        if (error) {
            toast.error(error.message);
            throw error;
        }
      },
      onSuccess: () => {
          toast.error("Note deleted.");
          queryClient.invalidateQueries({ queryKey: ['notes'] });
      }
  });

  const deleteNotesByFolderIdsMutation = useMutation({
      mutationFn: async (folderIds: string[]) => {
        const { error } = await supabase.from('notes').delete().in('folder_id', folderIds);
        if (error) {
            toast.error(error.message);
            throw error;
        }
        return folderIds.length;
      },
      onSuccess: (count) => {
          if (count > 0) {
            toast.error(`${count} note${count > 1 ? 's' : ''} deleted.`);
          }
          queryClient.invalidateQueries({ queryKey: ['notes'] });
      }
  });

  return { 
    notes,
    isLoading,
    saveNote: saveNoteMutation.mutateAsync, 
    deleteNote: deleteNoteMutation.mutate, 
    deleteNotesByFolderIds: deleteNotesByFolderIdsMutation.mutateAsync 
  };
};
