
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Note } from '@/types';
import { toast } from "sonner";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { fromNoteDb, getFilePathsFromContent } from './noteUtils';

export const useSaveNote = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (noteData: Pick<Note, 'title' | 'content' | 'tags'> & { id?: string, folderId?: string | null }): Promise<Note> => {
      const noteToSave = {
        title: noteData.title,
        content: noteData.content,
        tags: noteData.tags || [],
        folder_id: noteData.folderId,
        updated_at: new Date().toISOString(),
      };

      if (noteData.id) {
        const notes = queryClient.getQueryData<Note[]>(['notes', user?.id]) || [];
        const oldNote = notes.find(n => n.id === noteData.id);
        if (oldNote?.content) {
            const oldFilePaths = getFilePathsFromContent(oldNote.content);
            const newFilePaths = getFilePathsFromContent(noteData.content);
            const pathsToDelete = oldFilePaths.filter(path => !newFilePaths.includes(path));

            if (pathsToDelete.length > 0) {
                const { error: deleteError } = await supabase.storage.from('note-images').remove(pathsToDelete);
                if (deleteError) {
                    toast.warning(`Could not clean up some images: ${deleteError.message}`);
                } else {
                    toast.info(`${pathsToDelete.length} unused image(s) cleaned up.`);
                }
            }
        }

        const { data, error } = await supabase
          .from('notes')
          .update(noteToSave)
          .eq('id', noteData.id)
          .select()
          .single();

        if (error) { throw error; }
        if (!data) throw new Error("Note not found after update.");
        toast.success(`Note "${data.title}" updated!`);
        return fromNoteDb(data);
      } else {
        if (!user) {
          toast.error("You must be logged in to create a note.");
          throw new Error("User not authenticated");
        }
        const { data, error } = await supabase
          .from('notes')
          .insert({ ...noteToSave, user_id: user.id })
          .select()
          .single();
        
        if (error) { throw error; }
        if (!data) throw new Error("Could not create note.");
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
};
