
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { getFilePathsFromContent } from './noteUtils';
import { Note } from '@/types';
import { useAuth } from '@/context/AuthContext';

export const useDeleteNote = () => {
    const queryClient = useQueryClient();
    const { user } = useAuth();

    return useMutation({
        mutationFn: async (noteId: string) => {
          const notes = queryClient.getQueryData<Note[]>(['notes', user?.id]) || [];
          const noteToDelete = notes.find(note => note.id === noteId);
          
          if (noteToDelete?.content) {
              const pathsToDelete = getFilePathsFromContent(noteToDelete.content);
              if (pathsToDelete.length > 0) {
                  const { error: imageError } = await supabase.storage.from('note-images').remove(pathsToDelete);
                  if (imageError) {
                      toast.error(`Failed to delete images: ${imageError.message}`);
                  }
              }
          }
          
          const { error } = await supabase.from('notes').delete().eq('id', noteId);
          if (error) {
              toast.error(error.message);
              throw error;
          }
        },
        onSuccess: () => {
            toast.success("Note deleted.");
            queryClient.invalidateQueries({ queryKey: ['notes'] });
        }
    });
};
