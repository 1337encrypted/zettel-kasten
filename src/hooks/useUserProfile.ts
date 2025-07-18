import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Note, Folder, Profile } from '@/types';

const fetchUserProfileData = async (userId: string) => {
  const { data: profileData, error: profileError } = await supabase
    .from('profiles')
    .select('id, username, avatar_url, updated_at, is_public')
    .eq('id', userId)
    .single();

  if (profileError) throw profileError;

  // The 'profileData' might be incorrectly typed as SelectQueryError due to potentially stale generated types.
  // We cast it to 'unknown' then to 'Profile | null' to bypass the incorrect typing.
  const profile = profileData as unknown as Profile | null;

  // Defensive check for cases where Supabase might return an error-like object in the data field.
  if (profile && typeof profile === 'object' && 'code' in profile && 'message' in profile) {
    throw new Error((profile as any).message);
  }
  
  if (!profile) throw new Error('User profile not found or is private.');

  const { data: notesData, error: notesError } = await supabase
    .rpc('get_public_notes_for_user', { p_user_id: profile.id });

  if (notesError) throw notesError;

  const notes: Note[] = (notesData || []).map((note: any) => ({
    id: note.id,
    title: note.title,
    content: note.content ?? '',
    createdAt: new Date(note.created_at),
    updatedAt: new Date(note.updated_at),
    folderId: note.folder_id ?? undefined,
    tags: note.tags ?? [],
    isPublic: note.is_public,
    slug: note.slug,
  } as Note));

  const { data: foldersData, error: foldersError } = await supabase
    .rpc('get_public_folders_for_user', { p_user_id: profile.id });

  if (foldersError) throw foldersError;

  const folders: Folder[] = (foldersData || []).map((folder: any) => ({
    id: folder.id,
    name: folder.name,
    createdAt: new Date(folder.created_at),
    parentId: folder.parent_id,
    isPublic: folder.is_public,
    slug: folder.slug,
  } as Folder));

  return { profile, notes, folders };
};


export const useUserProfile = (userId: string | undefined, currentFolderId: string | null) => {
    const { data, isLoading, error } = useQuery({
        queryKey: ['userProfile', userId],
        queryFn: () => fetchUserProfileData(userId!),
        enabled: !!userId,
      });

    const { filteredFolders, filteredNotes, currentFolder } = useMemo(() => {
        if (!data) return { filteredFolders: [], filteredNotes: [], currentFolder: null };
        const folders = data.folders.filter(f => f.parentId === currentFolderId);
        const notes = data.notes
          .filter(n => n.folderId === currentFolderId || (!n.folderId && currentFolderId === null))
          .sort((a, b) => a.title.localeCompare(b.title));
        const currentFolderData = data.folders.find(f => f.id === currentFolderId) || null;
        return { filteredFolders: folders, filteredNotes: notes, currentFolder: currentFolderData };
      }, [data, currentFolderId]);
    
      const readmeNote = useMemo(() => {
        return filteredNotes.find(n => n.title.toLowerCase() === 'readme');
      }, [filteredNotes]);
    
      const notesForList = useMemo(() => {
        if (readmeNote) {
          return filteredNotes.filter(n => n.id !== readmeNote.id);
        }
        return filteredNotes;
      }, [filteredNotes, readmeNote]);
    
      const allNotes = useMemo(() => data?.notes || [], [data]);
      const allFolders = useMemo(() => data?.folders || [], [data]);

      return {
          profile: data?.profile,
          allNotes,
          allFolders,
          isLoading,
          error,
          filteredFolders,
          filteredNotes,
          currentFolder,
          readmeNote,
          notesForList,
      };
}
