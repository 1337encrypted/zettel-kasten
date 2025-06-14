import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Note } from '@/types';
import { toast } from "@/components/ui/sonner";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

const fromNoteDb = (dbNote: any): Note => ({
    id: dbNote.id,
    title: dbNote.title,
    content: dbNote.content || '',
    createdAt: new Date(dbNote.created_at),
    updatedAt: new Date(dbNote.updated_at),
    folderId: dbNote.folder_id,
    tags: dbNote.tags || [],
});

const getFilePathsFromContent = (content: string): string[] => {
    if (!content) return [];
    const imageUrls = Array.from(content.matchAll(/!\[.*?\]\((.*?)\)/g), m => m[1]);
    const supabaseUrlPart = `storage/v1/object/public/note-images/`;
    return imageUrls
        .filter(url => url.includes(supabaseUrlPart))
        .map(url => url.substring(url.indexOf(supabaseUrlPart) + supabaseUrlPart.length));
};

export const useNotes = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data: notes = [], isLoading } = useQuery({
    queryKey: ['notes', user?.id],
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
    },
    enabled: !!user,
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
        // Clean up images that are no longer referenced in the content
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

  const deleteNoteMutation = useMutation({
      mutationFn: async (noteId: string) => {
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

  const deleteNotesByFolderIdsMutation = useMutation({
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

  return { 
    notes,
    isLoading,
    saveNote: saveNoteMutation.mutateAsync, 
    deleteNote: deleteNoteMutation.mutate, 
    deleteNotesByFolderIds: deleteNotesByFolderIdsMutation.mutateAsync 
  };
};
