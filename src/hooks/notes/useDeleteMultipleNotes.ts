
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { getFilePathsFromContent } from './noteUtils';
import { Note } from '@/types';
import { useAuth } from '@/context/AuthContext';

export const useDeleteMultipleNotes = () => {
    const queryClient = useQueryClient();
    const { user } = useAuth();

    return useMutation({
        mutationFn: async (noteIds: string[]) => {
            if (noteIds.length === 0) return 0;
            
            const notes = queryClient.getQueryData<Note[]>(['notes', user?.id]) || [];
            const notesToDelete = notes.filter(note => noteIds.includes(note.id));

            const allFilePaths = notesToDelete.flatMap(note => getFilePathsFromContent(note.content));

            if (allFilePaths.length > 0) {
                const { error: imageError } = await supabase.storage.from('note-images').remove(allFilePaths);
                if (imageError) {
                    toast.error(`Failed to delete images: ${imageError.message}`);
                }
            }

            const { error } = await supabase.from('notes').delete().in('id', noteIds);
            if (error) {
                toast.error(error.message);
                throw error;
            }
            return noteIds.length;
        },
        onSuccess: (count) => {
            if (count > 0) {
                toast.success(`${count} note${count > 1 ? 's' : ''} deleted.`);
            }
            queryClient.invalidateQueries({ queryKey: ['notes'] });
        }
    });
};
