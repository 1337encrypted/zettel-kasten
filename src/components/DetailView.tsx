
import React from 'react';
import { Note } from '@/types';
import NoteEditor from '@/components/NoteEditor';
import NoteView from '@/components/NoteView';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Eye, Pencil, Delete } from 'lucide-react';

interface DetailViewProps {
  viewMode: 'edit' | 'preview';
  selectedNote: Note | null;
  onSave: (noteData: Pick<Note, 'title' | 'content' | 'tags'> & { id?: string }) => void;
  onBackToList: () => void;
  onToggleView: () => void;
  onDelete: (noteId: string) => void;
}

export const DetailView: React.FC<DetailViewProps> = ({
  viewMode,
  selectedNote,
  onSave,
  onBackToList,
  onToggleView,
  onDelete,
}) => {
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
          <NoteView note={selectedNote} />
        )}
      </div>
      <div className="flex items-center justify-between mt-4 p-2 border-t sticky bottom-0 bg-background">
        <Button variant="outline" onClick={onBackToList} size="icon" title="Back to List">
          <ArrowLeft />
        </Button>
        {selectedNote && (
          <div className="flex items-center gap-2">
            <Button onClick={onToggleView} size="icon" title={viewMode === 'edit' ? 'Preview' : 'Edit'}>
              {viewMode === 'edit' ? <Eye/> : <Pencil/>}
            </Button>
            {viewMode === 'preview' && (
              <Button variant="destructive" size="icon" title="Delete" onClick={() => onDelete(selectedNote.id)}>
                <Delete />
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
