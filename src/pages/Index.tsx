
import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import NoteEditor from '@/components/NoteEditor';
import NoteList from '@/components/NoteList';
import NoteView from '@/components/NoteView';
import { Note } from '@/types';
import { toast } from "@/components/ui/sonner"; // Using sonner for toasts

const Index = () => {
  const [notes, setNotes] = useState<Note[]>(() => {
    // Load notes from localStorage if available
    const savedNotes = localStorage.getItem('zettelkasten-notes');
    return savedNotes ? JSON.parse(savedNotes).map((note: any) => ({
      ...note,
      createdAt: new Date(note.createdAt),
      updatedAt: new Date(note.updatedAt),
    })) : [];
  });
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);

  useEffect(() => {
    // Save notes to localStorage whenever they change
    localStorage.setItem('zettelkasten-notes', JSON.stringify(notes));
  }, [notes]);

  const handleSaveNote = (noteData: Pick<Note, 'title' | 'content'> & { id?: string }) => {
    if (noteData.id) {
      // Update existing note
      setNotes(
        notes.map((n) =>
          n.id === noteData.id
            ? { ...n, ...noteData, updatedAt: new Date() }
            : n
        )
      );
      toast.success(`Note "${noteData.title}" updated!`);
      // If the updated note was the selected one, update selectedNote state as well
      if (selectedNote && selectedNote.id === noteData.id) {
        setSelectedNote(prev => prev ? { ...prev, ...noteData, updatedAt: new Date() } : null);
      }
    } else {
      // Create new note
      const newNote: Note = {
        id: uuidv4(),
        title: noteData.title,
        content: noteData.content,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setNotes([newNote, ...notes]);
      setSelectedNote(newNote); // Select the new note
      toast.success(`Note "${newNote.title}" created!`);
    }
  };

  const handleSelectNote = (note: Note) => {
    setSelectedNote(note);
  };

  const handleNewNote = () => {
    setSelectedNote(null); // Deselect any current note to clear editor for new entry
  };
  
  const handleDeleteNote = (noteId: string) => {
    setNotes(notes.filter(note => note.id !== noteId));
    if (selectedNote && selectedNote.id === noteId) {
      setSelectedNote(null);
    }
    toast.error("Note deleted.");
  };

  return (
    <div className="min-h-screen w-full flex flex-col bg-background p-4 md:p-8" style={{ fontFamily: "Inter, sans-serif" }}>
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-primary tracking-wide">
          Zettelkasten Notes
        </h1>
      </header>
      
      <div className="flex-grow grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-6">
          <NoteEditor 
            onSave={handleSaveNote} 
            selectedNote={selectedNote}
          />
           <button onClick={handleNewNote} className="w-full mt-2 p-2 bg-green-500 text-white rounded hover:bg-green-600">
            New Note
          </button>
        </div>
        
        <div className="md:col-span-2 space-y-6">
          <NoteList 
            notes={notes} 
            onSelectNote={handleSelectNote}
            selectedNoteId={selectedNote?.id}
            onDeleteNote={handleDeleteNote}
          />
          <NoteView note={selectedNote} />
        </div>
      </div>
      
      <footer className="mt-12 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} Zettelkasten Notes. Built with Lovable.</p>
      </footer>
    </div>
  );
};

export default Index;
