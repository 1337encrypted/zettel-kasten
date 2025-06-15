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

  useEffect(() => {
    if (folders.length === 0 && (location.pathname !== '/dashboard' && location.pathname !== '/dashboard/')) return;

    const path = location.pathname.replace(/^\/dashboard\/?/, '');
    if (!path) {
      if (currentFolderId !== null) setCurrentFolderId(null);
      return;
    }
    
    const slugs = path.split('/');
    let folder: Folder | undefined;
    let parentId: string | null = null;
    let validPath = true;

    for (const slug of slugs) {
      if (!slug) continue;
      folder = folders.find(f => f.slug === slug && f.parentId === parentId);
      if (!folder) {
        validPath = false;
        break;
      }
      parentId = folder.id;
    }

    if (validPath) {
      if (currentFolderId !== parentId) {
        setCurrentFolderId(parentId);
      }
    } else if (folders.length > 0) {
      navigate('/dashboard', { replace: true });
    }
  }, [location.pathname, folders, navigate, currentFolderId]);

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
  }, [resetSelection]);

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
