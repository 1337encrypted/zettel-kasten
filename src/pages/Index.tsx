import React, { useState, useMemo } from 'react';
import { Note } from '@/types';
import { useNotes } from '@/hooks/useNotes';
import { useFolders } from '@/hooks/useFolders';

import { AppHeader } from '@/components/AppHeader';
import { AppFooter } from '@/components/AppFooter';
import { ListView } from '@/components/ListView';
import { DetailView } from '@/components/DetailView';

const Index = () => {
  const { notes, saveNote, deleteNote, deleteNotesByFolderIds } = useNotes();
  const { folders, createFolder, deleteFolderAndDescendants } = useFolders();

  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'edit' | 'preview'>('list');
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);

  const handleSaveNote = (noteData: Pick<Note, 'title' | 'content'> & { id?: string }) => {
    const payload = {
      ...noteData,
      ...(!noteData.id && { folderId: currentFolderId }),
    };
    try {
      const saved = saveNote(payload);
      setSelectedNote(saved);
      setViewMode('preview');
    } catch (error) {
      // The toast is already shown in useNotes hook, so we just log the error.
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
    }
  };

  const handleCreateFolder = () => {
    const folderName = prompt("Enter folder name:");
    if (folderName && folderName.trim()) {
      createFolder(folderName.trim(), currentFolderId);
    }
  };
  
  const handleDeleteFolder = (folderId: string) => {
    const folderToDelete = folders.find(f => f.id === folderId);
    const parentId = folderToDelete?.parentId || null;

    const deletedFolderIds = deleteFolderAndDescendants(folderId);
    if (deletedFolderIds.length > 0) {
      deleteNotesByFolderIds(deletedFolderIds);
    }
    
    if (currentFolderId && deletedFolderIds.includes(currentFolderId)) {
        setCurrentFolderId(parentId);
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

  const filteredFolders = useMemo(() => folders.filter(folder => {
    if (currentFolderId === null) {
      return !folder.parentId;
    }
    return folder.parentId === currentFolderId;
  }), [folders, currentFolderId]);

  const filteredNotes = useMemo(() => notes.filter(note => {
    if (currentFolderId === null) {
      return !note.folderId;
    }
    return note.folderId === currentFolderId;
  }), [notes, currentFolderId]);

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
          />
        ) : (
          <DetailView 
            viewMode={viewMode}
            selectedNote={selectedNote}
            onSave={handleSaveNote}
            onNewNote={handleNewNote}
            onBackToList={handleBackToList}
            onToggleView={handleToggleView}
          />
        )}
      </main>
      
      <AppFooter />
    </div>
  );
};

export default Index;
