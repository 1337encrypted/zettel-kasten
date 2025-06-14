
import React, { useRef } from 'react';
import { Note } from '@/types';
import { Checkbox } from './ui/checkbox';
import { File } from 'lucide-react';

interface NoteListProps {
  notes: Note[];
  onSelectNote: (note: Note) => void;
  selectedNoteId?: string | null;
  selectedNoteIds: string[];
  onToggleNoteSelection: (noteId: string) => void;
}

const NoteList: React.FC<NoteListProps> = ({ notes, onSelectNote, selectedNoteId, selectedNoteIds, onToggleNoteSelection }) => {
  const longPressTimer = useRef<number>();
  const isLongPress = useRef(false);

  const handlePointerDown = (note: Note) => {
    if (note.title.toLowerCase() === 'readme') return;

    isLongPress.current = false;
    longPressTimer.current = window.setTimeout(() => {
      onToggleNoteSelection(note.id);
      isLongPress.current = true;
    }, 500);
  };

  const handlePointerUp = () => {
    clearTimeout(longPressTimer.current);
  };

  const handleClick = (note: Note) => {
    if (isLongPress.current) {
      return;
    }
    
    if (selectedNoteIds.length > 0) {
      if (note.title.toLowerCase() !== 'readme') {
        onToggleNoteSelection(note.id);
      }
    } else {
      onSelectNote(note);
    }
  };

  if (notes.length === 0) {
    return <p className="text-muted-foreground font-mono"># Empty</p>;
  }

  return (
    <div className="font-mono border border-border p-4 rounded-lg bg-secondary/20">
      <ul className="space-y-1">
        {notes.map((note) => (
          <li
            key={note.id}
            className={`p-2 rounded-md transition-colors flex items-center cursor-pointer ${
              selectedNoteIds.includes(note.id)
                ? 'bg-primary/20'
                : note.id === selectedNoteId && selectedNoteIds.length === 0
                ? 'bg-primary/20'
                : 'hover:bg-accent hover:text-accent-foreground'
            }`}
            onPointerDown={() => handlePointerDown(note)}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
            onClick={() => handleClick(note)}
          >
            <div className="flex items-center gap-4 flex-grow">
              <div className="w-4 h-4 shrink-0 flex items-center justify-center">
                {selectedNoteIds.length > 0 ? (
                  <Checkbox
                    checked={selectedNoteIds.includes(note.id)}
                    aria-label={`Select note ${note.title}`}
                    className="pointer-events-none"
                  />
                ) : (
                  <File className="text-primary h-4 w-4 shrink-0" />
                )}
              </div>
              <span
                className="font-medium"
              >
                {note.title}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default NoteList;
