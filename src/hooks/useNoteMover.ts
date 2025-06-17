
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/components/ui/sonner';
import { supabase } from '@/integrations/supabase/client';
import { Note } from '@/types';

export const useNoteMover = () => {
  const queryClient = useQueryClient();

  const moveNotesMutation = useMutation({
    mutationFn: async ({ noteIds, targetFolderId }: { noteIds: string[]; targetFolderId: string | null }) => {
      const { error } = await supabase
        .from('notes')
        .update({ folder_id: targetFolderId })
        .in('id', noteIds);

      if (error) {
        toast.error('Failed to move notes');
        throw new Error(error.message);
      }

      const folderName = targetFolderId ? 'folder' : 'root';
      toast.success(`${noteIds.length} note(s) moved to ${folderName}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
    },
  });

  return {
    moveNotes: moveNotesMutation.mutateAsync,
    isMoving: moveNotesMutation.isPending,
  };
};
