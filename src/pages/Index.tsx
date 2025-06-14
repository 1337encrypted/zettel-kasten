
import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import NoteEditor from '@/components/NoteEditor';
import NoteList from '@/components/NoteList';
import NoteView from '@/components/NoteView';
import { Note } from '@/types';
import { toast } from "@/components/ui/sonner";
import { Button } from '@/components/ui/button';
import { ArrowLeft, Eye, Pencil } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';

const Index = () => {
  const [notes, setNotes] = useState<Note[]>(() => {
    const savedNotes = localStorage.getItem('zettelkasten-notes');
    return savedNotes ? JSON.parse(savedNotes).map((note: any) => ({
      ...note,
      createdAt: new Date(note.createdAt),
      updatedAt: new Date(note.updatedAt),
    })) : [];
  });
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'edit' | 'preview'>('list');

  useEffect(() => {
    localStorage.setItem('zettelkasten-notes', JSON.stringify(notes));
  }, [notes]);

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

  const handleBackToList = () => {
    setViewMode('list');
  };

  const handleToggleView = () => {
    setViewMode(prev => (prev === 'edit' ? 'preview' : 'edit'));
  };

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
            <Button onClick={handleNewNote} className="w-full sm:w-auto">
              + Create New Note
            </Button>
            <NoteList 
              notes={notes} 
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
              <Button variant="outline" onClick={handleBackToList}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to List
              </Button>
              {selectedNote && (
                <Button onClick={handleToggleView}>
                  {viewMode === 'edit' ? (
                    <>
                      <Eye className="mr-2 h-4 w-4" /> Preview
                    </>
                  ) : (
                    <>
                      <Pencil className="mr-2 h-4 w-4" /> Edit
                    </>
                  )}
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
