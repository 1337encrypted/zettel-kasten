import { useState, useCallback, useMemo, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Note, Folder } from '@/types';
import { useNotes } from '@/hooks/useNotes';
import { useFolders } from '@/hooks/useFolders';
import { useSearchAndSort } from './useSearchAndSort';
import { useNoteSelection } from './useNoteSelection';
import { useKeyboardShortcuts } from './useKeyboardShortcuts';
import { useFolderHandlers } from './useFolderHandlers';
import { useNoteHandlers } from './useNoteHandlers';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { toast } from '@/components/ui/sonner';

export const useAppLogic = () => {
  const { notes, saveNote, deleteNote, deleteNotesByFolderIds, deleteMultipleNotes } = useNotes();
  const { folders, createFolder, deleteFolderAndDescendants, renameFolder } = useFolders();
  const location = useLocation();
  const navigate = useNavigate();

  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'edit' | 'preview'>('list');
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [commandMenuOpen, setCommandMenuOpen] = useState(false);
  const [cheatSheetOpen, setCheatSheetOpen] = useState(false);

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
  }, [location.pathname, folders, notes, navigate, getFolderPath, currentFolderId, selectedNote, viewMode]);

  const {
    sortOrder,
    setSortOrder,
    searchQuery,
    setSearchQuery,
    filteredFolders,
    filteredNotes,
  } = useSearchAndSort({ notes, folders, currentFolderId });
  
  const selectableNotes = useMemo(() => 
    filteredNotes.filter(note => note.title.toLowerCase() !== 'readme'),
    [filteredNotes]
  );
  
  const {
    selectedNoteIds,
    handleToggleNoteSelection,
    handleBulkDeleteNotes,
    handleSelectAll,
    resetSelection,
  } = useNoteSelection({ filteredNotes: selectableNotes, deleteMultipleNotes });

  const getNotePath = useCallback((note: Note): string => {
    const folderPath = getFolderPath(note.folderId);
    if (folderPath === '/dashboard') {
        return note.slug ? `/dashboard/${note.slug}`: '/dashboard';
    }
    return note.slug ? `${folderPath}/${note.slug}` : folderPath;
  }, [getFolderPath]);

  const {
    handleRenameFolder,
    handleSelectFolder,
    handleNavigateUp,
    handleCreateFolder,
    handleDeleteFolder,
  } = useFolderHandlers({
    folders,
    currentFolderId,
    resetSelection,
    renameFolder,
    createFolder,
    deleteFolderAndDescendants,
    deleteNotesByFolderIds,
    getFolderPath,
    navigate,
  });

  const {
    handleNewNote,
    handleSaveNote,
    handleSelectNote,
    handleDeleteNote,
  } = useNoteHandlers({
    currentFolderId,
    selectedNote,
    setSelectedNote,
    setViewMode,
    resetSelection,
    saveNote,
    deleteNote,
    navigate,
    getNotePath,
  });

  const handleExportAllNotes = useCallback(() => {
    if (notes.length === 0) {
      toast.info("There are no notes to export.");
      return;
    }

    const zip = new JSZip();

    const getFolderPath = (folderId: string | undefined | null, allFolders: Folder[]): string => {
      if (!folderId) {
        return '';
      }
      const folder = allFolders.find(f => f.id === folderId);
      if (!folder) {
        return '';
      }
      return getFolderPath(folder.parentId, allFolders) + folder.name.replace(/[\/\\?%*:|"<>]/g, '-') + '/';
    };

    notes.forEach(note => {
      const folderPath = getFolderPath(note.folderId, folders);
      const fileName = `${note.title.replace(/[\/\\?%*:|"<>]/g, '-')}.md`;
      const fileContent = `# ${note.title}\n\n${note.content}`;
      zip.file(folderPath + fileName, fileContent);
    });

    zip.generateAsync({ type: 'blob' })
      .then(content => {
        saveAs(content, 'Zet-Export.zip');
        toast.success("Notes exported successfully!");
      })
      .catch(err => {
        console.error("Failed to export notes:", err);
        toast.error("An error occurred while exporting notes.");
      });
  }, [notes, folders]);

  const handleBackToList = useCallback(() => {
    setViewMode('list');
    setSelectedNote(null);
    resetSelection();
    const folderPath = getFolderPath(currentFolderId);
    navigate(folderPath === '/dashboard' ? folderPath : `${folderPath}/`);
  }, [resetSelection, currentFolderId, getFolderPath, navigate]);

  const handleOpenShortcuts = useCallback(() => {
    setCheatSheetOpen(true);
  }, []);

  const handleEscape = useCallback((e: KeyboardEvent) => {
    if (cheatSheetOpen) {
      e.preventDefault();
      setCheatSheetOpen(false);
      return;
    }
    if (selectedNoteIds.length > 0) {
      e.preventDefault();
      resetSelection();
    } else if (viewMode !== 'list') {
      e.preventDefault();
      handleBackToList();
    } else if (currentFolderId) {
      e.preventDefault();
      handleNavigateUp();
    }
  }, [selectedNoteIds.length, viewMode, currentFolderId, resetSelection, handleBackToList, handleNavigateUp, cheatSheetOpen]);

  useKeyboardShortcuts({
      onNewNote: handleNewNote,
      onToggleCommandMenu: () => setCommandMenuOpen(open => !open),
      onEscape: handleEscape,
      onSelectAll: handleSelectAll,
      onOpenShortcuts: handleOpenShortcuts,
  });

  const handleToggleView = () => {
    setViewMode(prev => (prev === 'edit' ? 'preview' : 'edit'));
  };

  const handleSelectFolderFromCommandMenu = (folderId: string) => {
    handleSelectFolder(folderId);
    setViewMode('list');
    setSelectedNote(null);
    setSearchQuery('');
    resetSelection();
  };

  return {
    notes,
    folders,
    selectedNote,
    viewMode,
    currentFolderId,
    sortOrder,
    searchQuery,
    commandMenuOpen,
    setCommandMenuOpen,
    cheatSheetOpen,
    setCheatSheetOpen,
    selectedNoteIds,
    handleNewNote,
    handleBackToList,
    handleSaveNote,
    handleSelectNote,
    handleDeleteNote,
    handleCreateFolder,
    handleDeleteFolder,
    handleSelectFolder,
    handleNavigateUp,
    setSortOrder,
    setSearchQuery,
    handleToggleView,
    handleSelectFolderFromCommandMenu,
    filteredFolders,
    filteredNotes,
    handleToggleNoteSelection,
    handleBulkDeleteNotes,
    handleRenameFolder,
    handleSelectAll,
    handleExportAllNotes,
    handleOpenShortcuts,
  };
};
