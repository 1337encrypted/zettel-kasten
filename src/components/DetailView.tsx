
import React from 'react';
import { Note } from '@/types';
import NoteEditor from '@/components/NoteEditor';
import NoteView from '@/components/NoteView';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Eye, Pencil } from 'lucide-react';

interface DetailViewProps {
  viewMode: 'edit' | 'preview';
  selectedNote: Note | null;
  onSave: (noteData: Pick<Note, 'title' | 'content'> & { id?: string }) => void;
  onNewNote: () => void;
  onBackToList: () => void;
  onToggleView: () => void;
}

export const DetailView: React.FC<DetailViewProps> = ({
  viewMode,
  selectedNote,
  onSave,
  onNewNote,
  onBackToList,
  onToggleView,
}) => {
  return (
    <div className="flex-grow flex flex-col">
      <div className="flex-grow">
        {viewMode === 'edit' ? (
          <NoteEditor 
            onSave={onSave} 
            selectedNote={selectedNote}
            onNewNote={onNewNote}
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
          <Button onClick={onToggleView} size="icon" title={viewMode === 'edit' ? 'Preview' : 'Edit'}>
            {viewMode === 'edit' ? <Eye/> : <Pencil/>}
          </Button>
        )}
      </div>
    </div>
  );
};
