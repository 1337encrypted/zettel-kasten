import React from 'react';
import { Note } from '@/types';
import NoteEditor from '@/components/NoteEditor';
import NoteView from '@/components/NoteView';
import { Button } from '@/components/ui/button';
import { Eye, Pencil, Trash2, Copy } from 'lucide-react';
import { toast } from 'sonner';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

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
  const [isPublic, setIsPublic] = React.useState(false);

  React.useEffect(() => {
    if (selectedNote) {
      setIsPublic((selectedNote as any).isPublic || false);
    } else {
      setIsPublic(false);
    }
  }, [selectedNote]);

  const handleCopyId = () => {
    if (selectedNote) {
      navigator.clipboard.writeText(selectedNote.id);
      toast.info("Note ID copied to clipboard.");
    }
  };

  const handlePublicToggle = (checked: boolean) => {
    setIsPublic(checked);
    if (selectedNote) {
        onSave({
            id: selectedNote.id,
            title: selectedNote.title,
            content: selectedNote.content,
            tags: selectedNote.tags || [],
            isPublic: checked,
        });
        toast.info(`Note is now ${checked ? 'public' : 'private'}.`);
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
            isPublic={isPublic}
          />
        ) : (
          <NoteView 
            note={selectedNote}
            allNotes={allNotes}
            onSelectNote={onSelectNote}
          />
        )}
      </div>
      <div className="flex items-center justify-between mt-4 p-2 border-t sticky bottom-0 bg-background">
        <div className="flex items-center gap-2">
            {selectedNote && viewMode === 'preview' && (
                <div className="flex items-center space-x-2">
                    <Switch id="is-public-preview" checked={isPublic} onCheckedChange={handlePublicToggle} />
                    <Label htmlFor="is-public-preview">Public</Label>
                </div>
            )}
        </div>
        <div className="flex items-center gap-2 justify-end">
            {selectedNote && (
            <>
                {viewMode === 'edit' && (
                    <div className="flex items-center space-x-2">
                        <Switch id="is-public-edit" checked={isPublic} onCheckedChange={setIsPublic} />
                        <Label htmlFor="is-public-edit">Public</Label>
                    </div>
                )}
                {viewMode === 'preview' && (
                    <Button variant="outline" size="icon" title="Copy Note ID" onClick={handleCopyId}>
                        <Copy className="h-4 w-4" />
                    </Button>
                )}
                <Button onClick={onToggleView} size="icon" title={viewMode === 'edit' ? 'Preview' : 'Edit'}>
                {viewMode === 'edit' ? <Eye/> : <Pencil/>}
                </Button>
                {viewMode === 'preview' && (
                    <Button variant="destructive" size="icon" title="Delete" onClick={() => onDelete(selectedNote.id)}>
                        <Trash2 />
                    </Button>
                )}
            </>
            )}
        </div>
      </div>
    </div>
  );
};
