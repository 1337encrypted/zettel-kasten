import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Folder } from '@/types';
import { toast } from "@/components/ui/sonner";
import { supabase } from '@/integrations/supabase/client';

const fromFolderDb = (dbFolder: any): Folder => ({
  id: dbFolder.id,
  name: dbFolder.name,
  createdAt: new Date(dbFolder.created_at),
  parentId: dbFolder.parent_id,
});

export const useFolders = () => {
  const queryClient = useQueryClient();

  const { data: folders = [], isLoading } = useQuery({
    queryKey: ['folders'],
    queryFn: async (): Promise<Folder[]> => {
      const { data, error } = await supabase
        .from('folders')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        toast.error(error.message);
        throw new Error(error.message);
      }
      return data.map(fromFolderDb);
    }
  });

  const createFolderMutation = useMutation({
    mutationFn: async ({ folderName, parentId }: { folderName: string, parentId: string | null }) => {
      const trimmedName = folderName.trim();
      if (!trimmedName) {
          toast.error("Folder name cannot be empty.");
          throw new Error("Folder name cannot be empty.");
      }

      const { data, error } = await supabase
        .from('folders')
        .insert({ name: trimmedName, parent_id: parentId })
        .select()
        .single();
      
      if (error) {
        if (error.code === '23505') { // unique constraint violation
          toast.error(`A folder with the name "${trimmedName}" already exists here.`);
        } else {
          toast.error(error.message);
        }
        throw new Error(error.message);
      }

      toast.success(`Folder "${trimmedName}" created!`);
      return fromFolderDb(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['folders'] });
    },
  });

  const deleteFolderMutation = useMutation({
    mutationFn: async (folderId: string): Promise<string[]> => {
        const folderToDelete = folders.find(f => f.id === folderId);
        if (!folderToDelete) return [];

        const idsToDelete: string[] = [];
        const queue: string[] = [folderId];

        while(queue.length > 0) {
          const currentId = queue.shift()!;
          idsToDelete.push(currentId);
          const children = folders.filter(f => f.parentId === currentId);
          for (const child of children) {
            queue.push(child.id);
          }
        }
        
        const { error } = await supabase.from('folders').delete().in('id', idsToDelete);
        
        if (error) {
            toast.error(error.message);
            throw new Error(error.message);
        }

        toast.error(`Folder "${folderToDelete.name}" and its sub-folders deleted.`);
        return idsToDelete;
    },
    onSuccess: (_deletedIds, _folderId, _context) => {
        queryClient.invalidateQueries({ queryKey: ['folders'] });
    }
  });

  return { 
      folders, 
      isLoading,
      createFolder: (folderName: string, parentId: string | null) => createFolderMutation.mutate({ folderName, parentId }),
      deleteFolderAndDescendants: deleteFolderMutation.mutateAsync,
   };
};
