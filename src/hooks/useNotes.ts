import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Note } from '@/types';
import { toast } from "@/components/ui/sonner";

export const useNotes = () => {
  const [notes, setNotes] = useState<Note[]>(() => {
    try {
      const savedNotes = localStorage.getItem('zettelkasten-notes');
      return savedNotes ? JSON.parse(savedNotes).map((note: any) => ({
        ...note,
        createdAt: new Date(note.createdAt),
        updatedAt: new Date(note.updatedAt),
      })) : [];
    } catch (error) {
      console.error("Failed to parse notes from localStorage", error);
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('zettelkasten-notes', JSON.stringify(notes));
  }, [notes]);

  const saveNote = (noteData: Pick<Note, 'title' | 'content'> & { id?: string, folderId?: string | null }): Note => {
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
        toast.success(`Note "${updatedNote.title}" updated!`);
        return updatedNote;
      }
      throw new Error("Note to update not found");
    } else {
      const newNote: Note = {
        id: uuidv4(),
        title: noteData.title,
        content: noteData.content,
        createdAt: new Date(),
        updatedAt: new Date(),
        folderId: noteData.folderId || undefined,
      };
      setNotes((prevNotes) => [newNote, ...prevNotes]);
      toast.success(`Note "${newNote.title}" created!`);
      return newNote;
    }
  };

  const deleteNote = (noteId: string) => {
    setNotes(notes.filter(note => note.id !== noteId));
    toast.error("Note deleted.");
  };

  const deleteNotesByFolderIds = (folderIds: string[]) => {
    const notesToDeleteCount = notes.filter(note => note.folderId && folderIds.includes(note.folderId)).length;
    setNotes(prevNotes => prevNotes.filter(note => !note.folderId || !folderIds.includes(note.folderId)));
    if (notesToDeleteCount > 0) {
      toast.error(`${notesToDeleteCount} note${notesToDeleteCount > 1 ? 's' : ''} deleted.`);
    }
  };

  return { notes, saveNote, deleteNote, deleteNotesByFolderIds };
};
