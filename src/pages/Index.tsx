import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import NoteEditor from '@/components/NoteEditor';
import NoteList from '@/components/NoteList';
import NoteView from '@/components/NoteView';
import { Folder, Note } from '@/types';
import { toast } from "@/components/ui/sonner";
import { Button } from '@/components/ui/button';
import { ArrowLeft, Eye, Pencil, FolderPlus, File } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import FolderList from '@/components/FolderList';

const Index = () => {
  const [notes, setNotes] = useState<Note[]>(() => {
    const savedNotes = localStorage.getItem('zettelkasten-notes');
    return savedNotes ? JSON.parse(savedNotes).map((note: any) => ({
      ...note,
      createdAt: new Date(note.createdAt),
      updatedAt: new Date(note.updatedAt),
    })) : [];
  });
  const [folders, setFolders] = useState<Folder[]>(() => {
    const savedFolders = localStorage.getItem('zettelkasten-folders');
    return savedFolders ? JSON.parse(savedFolders).map((folder: any) => ({
      ...folder,
      createdAt: new Date(folder.createdAt),
    })) : [];
  });
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'edit' | 'preview'>('list');
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem('zettelkasten-notes', JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    localStorage.setItem('zettelkasten-folders', JSON.stringify(folders));
  }, [folders]);

  const handleSaveNote = (noteData: Pick<Note, 'title' | 'content'> & { id?: string }) => {
    if (noteData.id) {
      let updatedNote: Note | undefined;
      setNotes(
        notes.map((n) => {
          if (n.id === noteData.id) {
            updatedNote = { ...n, ...noteData, updatedAt: new Date() };
            return updatedNote;
          }
          return n;
        })
      );
      if (updatedNote) {
        setSelectedNote(updatedNote);
        toast.success(`Note "${updatedNote.title}" updated!`);
        setViewMode('preview');
      }
    } else {
      const newNote: Note = {
        id: uuidv4(),
        title: noteData.title,
        content: noteData.content,
        createdAt: new Date(),
        updatedAt: new Date(),
        folderId: currentFolderId || undefined,
      };
      setNotes([newNote, ...notes]);
      setSelectedNote(newNote);
      toast.success(`Note "${newNote.title}" created!`);
      setViewMode('preview');
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
    setNotes(notes.filter(note => note.id !== noteId));
    if (selectedNote && selectedNote.id === noteId) {
      setSelectedNote(null);
    }
    toast.error("Note deleted.");
  };

  const handleCreateFolder = () => {
    const folderName = prompt("Enter folder name:");
    if (folderName && folderName.trim()) {
      const newFolder: Folder = {
        id: uuidv4(),
        name: folderName.trim(),
        createdAt: new Date(),
        parentId: currentFolderId,
      };
      setFolders([newFolder, ...folders]);
      toast.success(`Folder "${newFolder.name}" created!`);
    }
  };

  const handleNavigateUp = () => {
    if (!currentFolderId) return;
    const currentFolder = folders.find(f => f.id === currentFolderId);
    setCurrentFolderId(currentFolder?.parentId || null);
  };

  const handleBackToList = () => {
    setViewMode('list');
  };

  const handleToggleView = () => {
    setViewMode(prev => (prev === 'edit' ? 'preview' : 'edit'));
  };

  const filteredFolders = folders.filter(folder => {
    if (currentFolderId === null) {
      return !folder.parentId;
    }
    return folder.parentId === currentFolderId;
  });

  const filteredNotes = notes.filter(note => {
    if (currentFolderId === null) {
      return !note.folderId;
    }
    return note.folderId === currentFolderId;
  });

  return (
    <div className="min-h-screen w-full flex flex-col bg-background p-4 md:p-8" style={{ fontFamily: "Inter, sans-serif" }}>
      <header className="mb-8 relative text-center">
        <h1 className="text-4xl font-bold text-primary tracking-wide">
          Zettelkasten Notes
        </h1>
        <div className="absolute top-0 right-0">
          <ThemeToggle />
        </div>
      </header>
      
      <main className="flex-grow flex flex-col">
        {viewMode === 'list' ? (
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <Button onClick={handleNewNote} size="icon" title="Create New Note">
                <File />
              </Button>
              <Button onClick={handleCreateFolder} variant="outline" size="icon" title="Create Folder">
                <FolderPlus />
              </Button>
            </div>
            <FolderList
              folders={filteredFolders}
              notes={notes}
              onSelectFolder={setCurrentFolderId}
              currentFolderId={currentFolderId}
              onNavigateUp={handleNavigateUp}
            />
            <NoteList 
              notes={filteredNotes} 
              onSelectNote={handleSelectNote}
              selectedNoteId={selectedNote?.id}
              onDeleteNote={handleDeleteNote}
            />
          </div>
        ) : (
          <div className="flex-grow flex flex-col">
            <div className="flex-grow">
              {viewMode === 'edit' ? (
                <NoteEditor 
                  onSave={handleSaveNote} 
                  selectedNote={selectedNote}
                  onNewNote={handleNewNote}
                />
              ) : (
                <NoteView note={selectedNote} />
              )}
            </div>
            <div className="flex items-center justify-between mt-4 p-2 border-t sticky bottom-0 bg-background">
              <Button variant="outline" onClick={handleBackToList} size="icon" title="Back to List">
                <ArrowLeft />
              </Button>
              {selectedNote && (
                <Button onClick={handleToggleView} size="icon" title={viewMode === 'edit' ? 'Preview' : 'Edit'}>
                  {viewMode === 'edit' ? <Eye/> : <Pencil/>}
                </Button>
              )}
            </div>
          </div>
        )}
      </main>
      
      <footer className="mt-12 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} Zettelkasten Notes. Built with Lovable.</p>
      </footer>
    </div>
  );
};

export default Index;
