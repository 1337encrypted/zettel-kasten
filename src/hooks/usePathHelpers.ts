
import { useCallback } from 'react';
import { Note, Folder } from '@/types';

export const usePathHelpers = (folders: Folder[]) => {
  const getFolderPath = useCallback((folderId: string | null): string => {
    if (!folderId) return '/dashboard';
    
    let path = '';
    let currentFolderIdInPath: string | null = folderId;
    
    while(currentFolderIdInPath) {
        const folder = folders.find(f => f.id === currentFolderIdInPath);
        if (!folder) {
            console.error("Could not find folder in path construction:", currentFolderIdInPath);
            return '/dashboard';
        }
        path = `/${folder.slug}${path}`;
        currentFolderIdInPath = folder.parentId;
    }
    
    return `/dashboard${path}`;
  }, [folders]);

  const getNotePath = useCallback((note: Note): string => {
    const folderPath = getFolderPath(note.folderId);
    if (folderPath === '/dashboard') {
        return note.slug ? `/dashboard/${note.slug}`: '/dashboard';
    }
    return note.slug ? `${folderPath}/${note.slug}` : folderPath;
  }, [getFolderPath]);

  return { getFolderPath, getNotePath };
};
