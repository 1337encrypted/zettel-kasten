
import { useState, useMemo } from 'react';
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
import { usePathHelpers } from './usePathHelpers';
import { useUIState } from './useUIState';
import { useInteractionHandlers } from './useInteractionHandlers';

export const useAppLogic = () => {
  const { notes, saveNote, deleteNote, deleteNotesByFolderIds, deleteMultipleNotes } = useNotes();
  const { folders, createFolder, deleteFolderAndDescendants, renameFolder } = useFolders();
  const navigate = useNavigate();

  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'edit' | 'preview'>('list');
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);

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
  };
};
