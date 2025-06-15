
import { useEffect } from 'react';
import { useLocation, To, NavigateOptions } from 'react-router-dom';
import { Note, Folder } from '@/types';

interface UseUrlSyncProps {
  notes: Note[];
  folders: Folder[];
  getFolderPath: (folderId: string | null) => string;
  navigate: (to: To, options?: NavigateOptions) => void;
  currentFolderId: string | null;
  selectedNote: Note | null;
  viewMode: 'list' | 'edit' | 'preview';
  setCurrentFolderId: (id: string | null) => void;
  setSelectedNote: (note: Note | null) => void;
  setViewMode: (mode: 'list' | 'edit' | 'preview') => void;
}

export const useUrlSync = ({
  notes,
  folders,
  getFolderPath,
  navigate,
  currentFolderId,
  selectedNote,
  viewMode,
  setCurrentFolderId,
  setSelectedNote,
  setViewMode,
}: UseUrlSyncProps) => {
  const location = useLocation();

  useEffect(() => {
    if (location.pathname.startsWith('/dashboard') && !notes.length && !folders.length && location.pathname.length > '/dashboard/'.length) return;

    const path = location.pathname;
    if (!path.startsWith('/dashboard')) return;

    const isFolderPath = path.endsWith('/') || path === '/dashboard';
    const rawSlugs = path.replace(/^\/dashboard\/?/, '').replace(/\/$/, '');
    const slugs = rawSlugs ? rawSlugs.split('/') : [];

    let parentId: string | null = null;
    let folderPathIsValid = true;
    
    const folderSlugs = isFolderPath ? slugs : slugs.slice(0, -1);
    const noteSlug = isFolderPath ? undefined : slugs[slugs.length - 1];
    
    for (const slug of folderSlugs) {
        const folder = folders.find(f => f.slug === slug && f.parentId === parentId);
        if (folder) {
            parentId = folder.id;
        } else {
            folderPathIsValid = false;
            break;
        }
    }
    
    if (!folderPathIsValid) {
        if (folders.length > 0 || notes.length > 0) navigate('/dashboard', { replace: true });
        return;
    }

    if (currentFolderId !== parentId) {
        setCurrentFolderId(parentId);
    }

    if (noteSlug) {
        const note = notes.find(n => n.slug === noteSlug && n.folderId === parentId);
        if (note) {
            if (selectedNote?.id !== note.id) {
                setSelectedNote(note);
                setViewMode('preview');
            }
        } else {
            if (notes.length > 0 || folders.length > 0) {
                const folderNavPath = getFolderPath(parentId);
                navigate(folderNavPath === '/dashboard' ? folderNavPath : `${folderNavPath}/`, { replace: true });
            }
        }
    } else {
        if(selectedNote) {
            setSelectedNote(null);
            if (viewMode !== 'list') setViewMode('list');
        }
    }
  }, [location.pathname, folders, notes, navigate, getFolderPath, currentFolderId, selectedNote, viewMode, setCurrentFolderId, setSelectedNote, setViewMode]);
};
