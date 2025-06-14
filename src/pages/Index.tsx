import React, { useState, useMemo } from 'react';
import { Note } from '@/types';
import { useNotes } from '@/hooks/useNotes';
import { useFolders } from '@/hooks/useFolders';
import Fuse from 'fuse.js';

import { AppHeader } from '@/components/AppHeader';
import { AppFooter } from '@/components/AppFooter';
import { ListView } from '@/components/ListView';
import { DetailView } from '@/components/DetailView';
import { Toaster } from '@/components/ui/sonner';

const Index = () => {
  const { notes, saveNote, deleteNote, deleteNotesByFolderIds } = useNotes();
  const { folders, createFolder, deleteFolderAndDescendants } = useFolders();

  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'edit' | 'preview'>('list');
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [searchQuery, setSearchQuery] = useState('');

  const handleSaveNote = async (noteData: Pick<Note, 'title' | 'content' | 'tags'> & { id?: string }) => {
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
  };

  const handleSelectNote = (note: Note) => {
    setSelectedNote(note);
    setViewMode('preview');
  };

  const handleNewNote = () => {
    setSelectedNote(null);
    setViewMode('edit');
  };
  
  const handleDeleteNote = (noteId: string) => {
    deleteNote(noteId);
    if (selectedNote && selectedNote.id === noteId) {
      setSelectedNote(null);
      setViewMode('list');
    }
  };

  const handleCreateFolder = () => {
    const folderName = prompt("Enter folder name:");
    if (folderName && folderName.trim()) {
      createFolder(folderName.trim(), currentFolderId);
    }
  };
  
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

  const handleNavigateUp = () => {
    if (!currentFolderId) return;
    const currentFolder = folders.find(f => f.id === currentFolderId);
    setCurrentFolderId(currentFolder?.parentId || null);
  };

  const handleBackToList = () => {
    setViewMode('list');
    setSelectedNote(null);
  };

  const handleToggleView = () => {
    setViewMode(prev => (prev === 'edit' ? 'preview' : 'edit'));
  };

  const fuse = useMemo(() => new Fuse(notes, {
    keys: ['title', 'content', 'tags'],
    includeScore: true,
    threshold: 0.4,
  }), [notes]);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return fuse.search(searchQuery).map(result => result.item);
  }, [searchQuery, fuse]);

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

  return (
    <div className="min-h-screen w-full flex flex-col bg-background p-4 md:p-8" style={{ fontFamily: "Inter, sans-serif" }}>
      <AppHeader />
      
      <main className="flex-grow flex flex-col">
        {viewMode === 'list' ? (
          <ListView
            filteredFolders={filteredFolders}
            filteredNotes={filteredNotes}
            allNotes={notes}
            currentFolderId={currentFolderId}
            selectedNoteId={selectedNote?.id}
            onNewNote={handleNewNote}
            onCreateFolder={handleCreateFolder}
            onSelectFolder={setCurrentFolderId}
            onNavigateUp={handleNavigateUp}
            onSelectNote={handleSelectNote}
            onDeleteNote={handleDeleteNote}
            onDeleteFolder={handleDeleteFolder}
            sortOrder={sortOrder}
            onSortOrderChange={setSortOrder}
            searchQuery={searchQuery}
            onSearchQueryChange={setSearchQuery}
          />
        ) : (
          <DetailView 
            viewMode={viewMode}
            selectedNote={selectedNote}
            onSave={handleSaveNote}
            onBackToList={handleBackToList}
            onToggleView={handleToggleView}
            onDelete={handleDeleteNote}
            allNotes={notes}
            onSelectNote={handleSelectNote}
          />
        )}
      </main>
      
      <AppFooter />
      <Toaster />
    </div>
  );
};

export default Index;
