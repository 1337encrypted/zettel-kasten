
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Folder } from '@/types';
import { toast } from "sonner";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

export const useUpdateFolder = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (folderData: Pick<Folder, 'id'> & Partial<Pick<Folder, 'isPublic'>>): Promise<Folder> => {
      if (!user) throw new Error("User not authenticated");
      
      const { data, error } = await supabase
        .from('folders')
        .update({ is_public: folderData.isPublic })
        .eq('id', folderData.id)
        .eq('user_id', user.id)
        .select()
        .single();
      
      if (error) throw error;
      if (!data) throw new Error("Folder not found after update.");
      
      const message = data.is_public ? "Folder is now public." : "Folder is now private.";
      toast.success(message, {
          description: "Note visibility inside this folder will update accordingly."
      });

      const anyData = data as any;
      return { ...anyData, isPublic: anyData.is_public, parentId: anyData.parent_id, createdAt: new Date(anyData.created_at) } as Folder;
    },
    onSuccess: (savedFolder) => {
        // Invalidate both folders and notes as folder visibility affects notes
        queryClient.invalidateQueries({ queryKey: ['folders', user?.id] });
        queryClient.invalidateQueries({ queryKey: ['notes', user?.id] });
    },
    onError: (error: any) => {
      toast.error(`Failed to update folder: ${error.message}`);
    }
  });
};
