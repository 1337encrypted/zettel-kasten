
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Folder } from '@/types';
import { useNotes } from '@/hooks/useNotes';
import { useFolders } from '@/hooks/useFolders';
import { useNoteMover } from '@/hooks/useNoteMover';
import { useSearchAndSort } from './useSearchAndSort';
import { useNoteSelection } from './useNoteSelection';
import { useKeyboardShortcuts } from './useKeyboardShortcuts';
import { useFolderHandlers } from './useFolderHandlers';
import { useNoteHandlers } from './useNoteHandlers';
import { useUrlSync } from './useUrlSync';
import { useNoteExporter } from './useNoteExporter';
import { usePathHelpers } from './usePathHelpers';
import { useUIState } from './useUIState';
import { useInteractionHandlers } from './useInteractionHandlers';
import { useUpdateFolder } from './useUpdateFolder';
import { useProfile } from './useProfile';
import { useCoreAppState } from './useCoreAppState';

export const useAppLogic = () => {
  const { notes, saveNote, deleteNote, deleteNotesByFolderIds, deleteMultipleNotes } = useNotes();
  const { folders, createFolder, deleteFolderAndDescendants, renameFolder } = useFolders();
  const { moveNotes } = useNoteMover();
  const navigate = useNavigate();
  const { handleUpdateFolder, isFolderUpdating } = useUpdateFolder();

  const { profile } = useProfile();

  const {
    selectedNote,
    setSelectedNote,
    viewMode,
    setViewMode,
    currentFolderId,
    setCurrentFolderId,
  } = useCoreAppState();

  const {
    commandMenuOpen,
    setCommandMenuOpen,
    cheatSheetOpen,
    setCheatSheetOpen,
    handleOpenShortcuts,
    handleToggleCommandMenu,
  } = useUIState();

  const { getFolderPath, getNotePath } = usePathHelpers(folders);

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
  
  const {
    selectedNoteIds,
    handleToggleNoteSelection,
    handleBulkDeleteNotes,
    handleSelectAll,
    resetSelection,
  } = useNoteSelection({ filteredNotes, deleteMultipleNotes });

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
    folders,
    profile,
  });

  const { handleExportAllNotes } = useNoteExporter(notes, folders);

  const currentFolder = useMemo(() => {
    return folders.find(f => f.id === currentFolderId) || null;
  }, [currentFolderId, folders]);

  const {
    handleBackToList,
    handleEscape,
    handleToggleView,
    handleSelectFolderFromCommandMenu,
  } = useInteractionHandlers({
    currentFolderId,
    viewMode,
    selectedNoteIds,
    cheatSheetOpen,
    setViewMode,
    setSelectedNote,
    setCheatSheetOpen,
    setSearchQuery,
    resetSelection,
    getFolderPath,
    handleNavigateUp,
    handleSelectFolder,
    navigate,
  });

  const handleMoveNotes = async (noteIds: string[], targetFolderId: string | null) => {
    await moveNotes({ noteIds, targetFolderId });
    resetSelection();
  };

  useKeyboardShortcuts({
      onNewNote: handleNewNote,
      onToggleCommandMenu: handleToggleCommandMenu,
      onEscape: handleEscape,
      onSelectAll: handleSelectAll,
      onOpenShortcuts: handleOpenShortcuts,
  });

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
    handleMoveNotes,
    profile,
    currentFolder,
    handleUpdateFolder,
    isFolderUpdating,
  };
};
