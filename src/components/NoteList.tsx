
import React from 'react';
import { Note } from '@/types';
import { Button } from '@/components/ui/button';

interface NoteListProps {
  notes: Note[];
  onSelectNote: (note: Note) => void;
  selectedNoteId?: string | null;
  onDeleteNote: (noteId: string) => void;
}

const NoteList: React.FC<NoteListProps> = ({ notes, onSelectNote, selectedNoteId, onDeleteNote }) => {
  if (notes.length === 0) {
    return <p className="text-muted-foreground">No notes yet. Create one!</p>;
  }

  return (
    <div className="space-y-2">
      <h2 className="text-xl font-semibold mb-2">Your Notes</h2>
      <ul className="space-y-2">
        {notes.map((note) => (
          <li
            key={note.id}
            className={`p-3 rounded-md cursor-pointer transition-colors flex justify-between items-center ${
              note.id === selectedNoteId ? 'bg-primary/10 border-primary border' : 'bg-secondary hover:bg-secondary/80 border'
            }`}
            onClick={() => onSelectNote(note)}
          >
            <span className="font-medium">{note.title}</span>
            <Button 
              variant="destructive" 
              size="sm" 
              onClick={(e) => { 
                e.stopPropagation(); // Prevent li onClick from firing
                onDeleteNote(note.id); 
              }}
            >
              Delete
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default NoteList;
