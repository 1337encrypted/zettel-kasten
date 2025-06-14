
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { getFilePathsFromContent } from './noteUtils';

export const useDeleteNotesByFolder = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: async (folderIds: string[]) => {
            const { data: notesToDelete, error: fetchError } = await supabase
                .from('notes')
                .select('id, content')
                .in('folder_id', folderIds);
            
            if (fetchError) throw fetchError;
            
            if (!notesToDelete || notesToDelete.length === 0) return 0;

            const allFilePaths = notesToDelete.flatMap(note => getFilePathsFromContent(note.content));
            
            if (allFilePaths.length > 0) {
                const { error: deleteImagesError } = await supabase.storage.from('note-images').remove(allFilePaths);
                if (deleteImagesError) {
                    toast.error(`Failed to delete some images: ${deleteImagesError.message}`);
                }
            }

            const noteIdsToDelete = notesToDelete.map(note => note.id);
            const { error } = await supabase.from('notes').delete().in('id', noteIdsToDelete);
            
            if (error) throw error;
            
            return notesToDelete.length;
        },
        onSuccess: (count) => {
            if (count > 0) {
                toast.success(`${count} note${count > 1 ? 's' : ''} and associated images deleted.`);
            }
            queryClient.invalidateQueries({ queryKey: ['notes'] });
        }
    });
};
