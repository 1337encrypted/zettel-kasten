
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Note } from '@/types';
import { toast } from "sonner";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
// We are not using fromNoteDb anymore as it's in a read-only file.
import { getFilePathsFromContent } from './noteUtils';

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

export const useSaveNote = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (noteData: Pick<Note, 'title' | 'content' | 'tags'> & { id?: string, folderId?: string | null, isPublic?: boolean }): Promise<Note> => {
      const noteToSave: any = {
        title: noteData.title,
        content: noteData.content,
        tags: noteData.tags || [],
        folder_id: noteData.folderId,
        updated_at: new Date().toISOString(),
        is_public: !!noteData.isPublic,
      };

      const oldNote = noteData.id ? (queryClient.getQueryData(['notes', user?.id]) as (Note[] | undefined))?.find(n => n.id === noteData.id) as any : null;

      if (!noteData.id || (oldNote && oldNote.title !== noteData.title)) {
        noteToSave.slug = slugify(noteData.title);
      }

      if (noteData.id) {
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
        return { ...data, isPublic: data.is_public, folderId: data.folder_id, createdAt: new Date(data.created_at), updatedAt: new Date(data.updated_at) } as Note;
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
        return { ...data, isPublic: data.is_public, folderId: data.folder_id, createdAt: new Date(data.created_at), updatedAt: new Date(data.updated_at) } as Note;
      }
    },
    onSuccess: (savedNote) => {
        queryClient.invalidateQueries({ queryKey: ['notes'] });
        queryClient.setQueryData(['notes', (savedNote as any).id], savedNote);
    },
    onError: (error: any) => {
        if (error.code === '23505') {
            toast.error(`A note with a similar title already exists, which would create a conflicting link. Please choose a different title.`);
        } else {
            toast.error(error.message);
        }
    }
  });
};
