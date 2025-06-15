
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Folder } from '@/types';
import { toast } from "@/components/ui/sonner";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

const slugify = (text: string) => {
  if (!text) return null;
  const a = 'àáâäæãåāăąçćčđďèéêëēėęěğǵḧîïíīįìłḿñńǹňôöòóœøōõőṕŕřßśšşșťțûüùúūǘůűųẃẍÿýžźż·/_,:;'
  const b = 'aaaaaaaaaacccddeeeeeeeegghiiiiiilmnnnnoooooooooprrssssssttuuuuuuuuuwxyyzzz------'
  const p = new RegExp(a.split('').join('|'), 'g')

  return text.toString().toLowerCase()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(p, c => b.charAt(a.indexOf(c))) // Replace special characters
    .replace(/&/g, '-and-') // Replace & with 'and'
    .replace(/[^\w\-]+/g, '') // Remove all non-word chars
    .replace(/\-\-+/g, '-') // Replace multiple - with single -
    .replace(/^-+/, '') // Trim - from start of text
    .replace(/-+$/, '') // Trim - from end of text
}

const fromFolderDb = (dbFolder: any): Folder => ({
  id: dbFolder.id,
  name: dbFolder.name,
  createdAt: new Date(dbFolder.created_at),
  parentId: dbFolder.parent_id,
  // Additions for structural compatibility
  isPublic: dbFolder.is_public,
  slug: dbFolder.slug,
} as Folder);

export const useFolders = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data: folders = [], isLoading } = useQuery({
    queryKey: ['folders', user?.id],
    queryFn: async (): Promise<Folder[]> => {
      const { data, error } = await supabase
        .from('folders')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });
      
      if (error) {
        toast.error(error.message);
        throw new Error(error.message);
      }
      return data.map(fromFolderDb);
    },
    enabled: !!user,
  });

  const createFolderMutation = useMutation({
    mutationFn: async ({ folderName, parentId }: { folderName: string, parentId: string | null }) => {
      const trimmedName = folderName.trim();
      if (!trimmedName) {
          toast.error("Folder name cannot be empty.");
          throw new Error("Folder name cannot be empty.");
      }

      if (!user) {
        toast.error("You must be logged in to create a folder.");
        throw new Error("User not authenticated");
      }

      const slug = slugify(trimmedName);

      const { data, error } = await supabase
        .from('folders')
        .insert({ name: trimmedName, parent_id: parentId, user_id: user.id, slug: slug })
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

  const renameFolderMutation = useMutation({
    mutationFn: async ({ folderId, newName }: { folderId: string; newName: string }) => {
      const trimmedName = newName.trim();
      if (!trimmedName) {
        toast.error("Folder name cannot be empty.");
        throw new Error("Folder name cannot be empty.");
      }

      const slug = slugify(trimmedName);

      const { data, error } = await supabase
        .from('folders')
        .update({ name: trimmedName, slug: slug })
        .eq('id', folderId)
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

      toast.success(`Folder renamed to "${trimmedName}"!`);
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

        toast.success(`Folder "${folderToDelete.name}" and its sub-folders deleted.`);
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
    renameFolder: (folderId: string, newName: string) => renameFolderMutation.mutate({ folderId, newName }),
    deleteFolderAndDescendants: deleteFolderMutation.mutateAsync,
    createFolderAsync: createFolderMutation.mutateAsync,
  };
};
