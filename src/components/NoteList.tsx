
import React from 'react';
import { Note } from '@/types';
import { Button } from '@/components/ui/button';
import { Checkbox } from './ui/checkbox';

interface NoteListProps {
  notes: Note[];
  onSelectNote: (note: Note) => void;
  selectedNoteId?: string | null;
  onDeleteNote: (noteId: string) => void;
  selectedNoteIds: string[];
  onToggleNoteSelection: (noteId: string) => void;
}

const NoteList: React.FC<NoteListProps> = ({ notes, onSelectNote, selectedNoteId, onDeleteNote, selectedNoteIds, onToggleNoteSelection }) => {
  if (notes.length === 0) {
    return <p className="text-muted-foreground font-mono"># Empty</p>;
  }

  return (
    <div className="font-mono border border-border p-4 rounded-lg bg-secondary/20">
      <ul className="space-y-1">
        {notes.map((note) => (
          <li
            key={note.id}
            className={`p-2 rounded-md transition-colors flex justify-between items-center group ${
              selectedNoteIds.includes(note.id)
                ? 'bg-primary/20'
                : note.id === selectedNoteId
                ? 'bg-primary/20'
                : 'hover:bg-accent hover:text-accent-foreground'
            }`}
          >
            <div className="flex items-center gap-4 flex-grow">
              <Checkbox
                checked={selectedNoteIds.includes(note.id)}
                onCheckedChange={() => onToggleNoteSelection(note.id)}
                aria-label={`Select note ${note.title}`}
              />
              <span
                className="font-medium flex items-center cursor-pointer"
                onClick={() => onSelectNote(note)}
              >
                <span className="text-primary mr-2">{`>`}</span>
                {note.title}
              </span>
            </div>
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
