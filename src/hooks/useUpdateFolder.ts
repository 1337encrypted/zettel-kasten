import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Folder } from '@/types';
import { toast } from "sonner";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

const getDescendantFolderIds = (folderId: string, allFolders: Folder[]): string[] => {
    const children = allFolders.filter(f => f.parentId === folderId);
    let descendants = children.map(c => c.id);
    for (const child of children) {
        descendants = [...descendants, ...getDescendantFolderIds(child.id, allFolders)];
    }
    return descendants;
};

export const useUpdateFolder = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const updateFolderMutation = useMutation({
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
      
      if (data.is_public === false) {
        const allFolders: Folder[] | undefined = queryClient.getQueryData(['folders', user?.id]);
        if (allFolders) {
            const descendantFolderIds = getDescendantFolderIds(folderData.id, allFolders);
            const allAffectedFolderIds = [folderData.id, ...descendantFolderIds];

            if (descendantFolderIds.length > 0) {
                const { error: foldersError } = await supabase.from('folders').update({ is_public: false }).in('id', descendantFolderIds);
                if (foldersError) toast.warning("Failed to update subfolder visibility.");
            }
            
            const { error: notesError } = await supabase.from('notes').update({ is_public: false }).in('folder_id', allAffectedFolderIds);
            if (notesError) toast.warning("Failed to update note visibility within folder(s).");
        }
      }

      const message = data.is_public ? "Folder is now public." : "Folder is now private.";
      toast.success(message, {
          description: data.is_public ? "Notes inside can now be made public." : "All content inside this folder has been made private."
      });

      const anyData = data as any;
      return { ...anyData, userId: anyData.user_id, isPublic: anyData.is_public, parentId: anyData.parent_id, createdAt: new Date(anyData.created_at) } as Folder;
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

  const handleUpdateFolder = async (folderData: Pick<Folder, 'id'> & Partial<Pick<Folder, 'isPublic'>>) => {
      try {
          await updateFolderMutation.mutateAsync(folderData);
      } catch (error) {
          console.error("Failed to update folder", error);
      }
  };

  return {
    handleUpdateFolder,
    isFolderUpdating: updateFolderMutation.isPending,
  };
};
