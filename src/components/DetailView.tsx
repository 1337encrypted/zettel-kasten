
import React from 'react';
import { Note } from '@/types';
import NoteEditor from '@/components/NoteEditor';
import NoteView from '@/components/NoteView';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Eye, Pencil, Trash2, Copy } from 'lucide-react';
import { toast } from 'sonner';

interface DetailViewProps {
  viewMode: 'edit' | 'preview';
  selectedNote: Note | null;
  onSave: (noteData: Pick<Note, 'title' | 'content' | 'tags'> & { id?: string, isPublic?: boolean }) => void;
  onBackToList: () => void;
  onToggleView: () => void;
  onDelete: (noteId: string) => void;
  allNotes: Note[];
  onSelectNote: (note: Note) => void;
}

export const DetailView: React.FC<DetailViewProps> = ({
  viewMode,
  selectedNote,
  onSave,
  onBackToList,
  onToggleView,
  onDelete,
  allNotes,
  onSelectNote,
}) => {
  const handleCopyId = () => {
    if (selectedNote) {
      navigator.clipboard.writeText(selectedNote.id);
      toast.info("Note ID copied to clipboard.");
    }
  };

  return (
    <div className="flex-grow flex flex-col">
      <div className="flex-grow">
        {viewMode === 'edit' ? (
          <NoteEditor 
            onSave={onSave} 
            selectedNote={selectedNote}
            onDelete={onDelete}
          />
        ) : (
          <NoteView 
            note={selectedNote}
            allNotes={allNotes}
            onSelectNote={onSelectNote}
          />
        )}
      </div>
      <div className="flex items-center justify-end mt-4 p-2 border-t sticky bottom-0 bg-background">
        {selectedNote && (
          <div className="flex items-center gap-2">
            {viewMode === 'preview' && (
              <Button variant="outline" size="icon" title="Copy Note ID" onClick={handleCopyId}>
                <Copy className="h-4 w-4" />
              </Button>
            )}
            {viewMode === 'preview' && (
              <Button variant="destructive" size="icon" title="Delete" onClick={() => onDelete(selectedNote.id)}>
                <Trash2 />
              </Button>
            )}
            <Button onClick={onToggleView} size="icon" title={viewMode === 'edit' ? 'Preview' : 'Edit'}>
              {viewMode === 'edit' ? <Eye/> : <Pencil/>}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
