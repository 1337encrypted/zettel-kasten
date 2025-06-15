import { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Note, Folder } from '@/types';
import { useNotes } from '@/hooks/useNotes';
import { useFolders } from '@/hooks/useFolders';
import { useSearchAndSort } from './useSearchAndSort';
import { useNoteSelection } from './useNoteSelection';
import { useKeyboardShortcuts } from './useKeyboardShortcuts';
import { useFolderHandlers } from './useFolderHandlers';
import { useNoteHandlers } from './useNoteHandlers';
import { useUrlSync } from './useUrlSync';
import { useNoteExporter } from './useNoteExporter';

export const useAppLogic = () => {
  const { notes, saveNote, deleteNote, deleteNotesByFolderIds, deleteMultipleNotes } = useNotes();
  const { folders, createFolder, deleteFolderAndDescendants, renameFolder } = useFolders();
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

  useUrlSync({
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
  });

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

  const { handleExportAllNotes } = useNoteExporter(notes, folders);

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
