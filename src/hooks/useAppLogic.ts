
import { useState, useMemo, useEffect, useCallback } from 'react';
import { Note } from '@/types';
import { useNotes } from '@/hooks/useNotes';
import { useFolders } from '@/hooks/useFolders';
import Fuse from 'fuse.js';

export const useAppLogic = () => {
  const { notes, saveNote, deleteNote, deleteNotesByFolderIds, deleteMultipleNotes } = useNotes();
  const { folders, createFolder, deleteFolderAndDescendants, renameFolder } = useFolders();

  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'edit' | 'preview'>('list');
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [searchQuery, setSearchQuery] = useState('');
  const [commandMenuOpen, setCommandMenuOpen] = useState(false);
  const [selectedNoteIds, setSelectedNoteIds] = useState<string[]>([]);

  const handleToggleNoteSelection = (noteId: string) => {
    setSelectedNoteIds(prev =>
      prev.includes(noteId)
        ? prev.filter(id => id !== noteId)
        : [...prev, noteId]
    );
  };

  const handleBulkDeleteNotes = async () => {
    if (selectedNoteIds.length === 0) return;
    if (window.confirm(`Are you sure you want to delete ${selectedNoteIds.length} selected note(s)?`)) {
      await deleteMultipleNotes(selectedNoteIds);
      setSelectedNoteIds([]);
    }
  };

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
    setSelectedNoteIds([]);
  };

  const handleNewNote = useCallback(() => {
    setSelectedNote(null);
    setViewMode('edit');
    setSelectedNoteIds([]);
  }, []);

  const handleBackToList = useCallback(() => {
    setViewMode('list');
    setSelectedNote(null);
    setSelectedNoteIds([]);
  }, []);

  const handleNavigateUp = useCallback(() => {
    if (!currentFolderId) return;
    const currentFolder = folders.find(f => f.id === currentFolderId);
    setCurrentFolderId(currentFolder?.parentId || null);
    setSelectedNoteIds([]);
  }, [currentFolderId, folders]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setCommandMenuOpen((open) => !open);
      }
      
      if (e.key === 'n' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        handleNewNote();
      }

      if (e.key === 'Escape') {
        if (selectedNoteIds.length > 0) {
          e.preventDefault();
          setSelectedNoteIds([]);
        } else if (viewMode !== 'list') {
          e.preventDefault();
          handleBackToList();
        } else if (currentFolderId) {
          e.preventDefault();
          handleNavigateUp();
        }
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [handleNewNote, viewMode, currentFolderId, handleBackToList, handleNavigateUp, selectedNoteIds]);

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
    setSelectedNoteIds([]);
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
    setSelectedNoteIds([]);
  };

  const fuse = useMemo(() => new Fuse(notes, {
    keys: ['title', 'content', 'tags', 'id'],
    includeScore: true,
    threshold: 0.4,
  }), [notes]);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];

    const exactMatchById = notes.find(note => note.id === searchQuery.trim());
    if (exactMatchById) {
      return [exactMatchById];
    }
    
    return fuse.search(searchQuery).map(result => result.item);
  }, [searchQuery, fuse, notes]);

  const filteredFolders = useMemo(() => {
    if (searchQuery.trim()) return [];
    return folders.filter(folder => {
      if (currentFolderId === null) {
        return !folder.parentId;
      }
      return folder.parentId === currentFolderId;
    });
  }, [folders, currentFolderId, searchQuery]);

  const filteredNotes = useMemo(() => {
    if (searchQuery.trim()) {
      return searchResults;
    }
    const notesInFolder = notes.filter(note => {
      if (currentFolderId === null) {
        return !note.folderId;
      }
      return note.folderId === currentFolderId;
    });
    
    return notesInFolder.sort((a, b) => {
      if (a.title.toLowerCase() === 'readme') return -1;
      if (b.title.toLowerCase() === 'readme') return 1;
      if (sortOrder === 'asc') {
        return a.title.localeCompare(b.title);
      } else {
        return b.title.localeCompare(a.title);
      }
    });
  }, [notes, currentFolderId, sortOrder, searchQuery, searchResults]);

  const handleSelectAll = () => {
    const selectableNotes = filteredNotes.filter(n => n.title.toLowerCase() !== 'readme');
    if (selectableNotes.length > 0 && selectedNoteIds.length === selectableNotes.length) {
      setSelectedNoteIds([]);
    } else {
      setSelectedNoteIds(selectableNotes.map(n => n.id));
    }
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
