
import { useState, useCallback } from 'react';
import { Note } from '@/types';
import { useNotes } from '@/hooks/useNotes';
import { useFolders } from '@/hooks/useFolders';
import { useSearchAndSort } from './useSearchAndSort';
import { useNoteSelection } from './useNoteSelection';
import { useKeyboardShortcuts } from './useKeyboardShortcuts';

export const useAppLogic = () => {
  const { notes, saveNote, deleteNote, deleteNotesByFolderIds, deleteMultipleNotes } = useNotes();
  const { folders, createFolder, deleteFolderAndDescendants, renameFolder } = useFolders();

  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'edit' | 'preview'>('list');
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [commandMenuOpen, setCommandMenuOpen] = useState(false);

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

  const handleRenameFolder = (folderId: string) => {
    const folder = folders.find(f => f.id === folderId);
    if (!folder) return;
    const newName = prompt("Enter new folder name:", folder.name);
    if (newName && newName.trim() && newName.trim() !== folder.name) {
      renameFolder(folderId, newName.trim());
    }
  };

  const handleSelectFolder = (folderId: string | null) => {
    setCurrentFolderId(folderId);
    resetSelection();
  };

  const handleNewNote = useCallback(() => {
    setSelectedNote(null);
    setViewMode('edit');
    resetSelection();
  }, [resetSelection]);

  const handleBackToList = useCallback(() => {
    setViewMode('list');
    setSelectedNote(null);
    resetSelection();
  }, [resetSelection]);

  const handleNavigateUp = useCallback(() => {
    if (!currentFolderId) return;
    const currentFolder = folders.find(f => f.id === currentFolderId);
    setCurrentFolderId(currentFolder?.parentId || null);
    resetSelection();
  }, [currentFolderId, folders, resetSelection]);

  const handleEscape = useCallback((e: KeyboardEvent) => {
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
  }, [selectedNoteIds.length, viewMode, currentFolderId, resetSelection, handleBackToList, handleNavigateUp]);

  useKeyboardShortcuts({
      onNewNote: handleNewNote,
      onToggleCommandMenu: () => setCommandMenuOpen(open => !open),
      onEscape: handleEscape,
  });

  const handleSaveNote = useCallback(async (noteData: Pick<Note, 'title' | 'content' | 'tags'> & { id?: string }) => {
    const payload = {
      ...noteData,
      ...(!noteData.id && { folderId: currentFolderId }),
    };
    try {
      const saved = await saveNote(payload);
      setSelectedNote(saved);
      setViewMode('preview');
    } catch (error) {
      // The toast is already shown in useNotes hook
      console.error("Failed to save note:", error);
    }
  }, [currentFolderId, saveNote]);

  const handleSelectNote = (note: Note) => {
    setSelectedNote(note);
    setViewMode('preview');
    resetSelection();
  };

  const handleDeleteNote = (noteId: string) => {
    deleteNote(noteId);
    if (selectedNote && selectedNote.id === noteId) {
      setSelectedNote(null);
      setViewMode('list');
    }
  };

  const handleCreateFolder = useCallback(() => {
    const folderName = prompt("Enter folder name:");
    if (folderName && folderName.trim()) {
      createFolder(folderName.trim(), currentFolderId);
    }
  }, [createFolder, currentFolderId]);

  const handleDeleteFolder = async (folderId: string) => {
    const folderToDelete = folders.find(f => f.id === folderId);
    const parentId = folderToDelete?.parentId || null;

    try {
      const deletedFolderIds = await deleteFolderAndDescendants(folderId);
      if (deletedFolderIds && deletedFolderIds.length > 0) {
        await deleteNotesByFolderIds(deletedFolderIds);
      }
      
      if (currentFolderId && deletedFolderIds?.includes(currentFolderId)) {
          setCurrentFolderId(parentId);
      }
    } catch (error) {
      console.error("Failed to delete folder and its contents:", error);
    }
  };

  const handleToggleView = () => {
    setViewMode(prev => (prev === 'edit' ? 'preview' : 'edit'));
  };

  const handleSelectFolderFromCommandMenu = (folderId: string) => {
    setCurrentFolderId(folderId);
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
  };
};
