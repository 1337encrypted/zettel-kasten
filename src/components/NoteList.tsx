
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
    return <p className="text-muted-foreground font-mono">C:\&gt; No notes yet. Create one!</p>;
  }

  return (
    <div className="font-mono border border-border p-4 rounded-lg bg-secondary/20">
      <h2 className="text-xl font-semibold mb-4 text-primary">~/notes/</h2>
      <ul className="space-y-1">
        {notes.map((note) => (
          <li
            key={note.id}
            className={`p-2 rounded-md cursor-pointer transition-colors flex justify-between items-center group ${
              note.id === selectedNoteId ? 'bg-primary/20' : 'hover:bg-accent hover:text-accent-foreground'
            }`}
            onClick={() => onSelectNote(note)}
          >
            <span className="font-medium flex items-center">
              <span className="text-primary mr-2">{`>`}</span>
              {note.title}
            </span>
            <Button
              variant="destructive"
              size="sm"
              className="opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
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
