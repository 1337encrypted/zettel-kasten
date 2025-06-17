
import React from 'react';
import { Note } from '@/types';
import NoteEditor from '@/components/NoteEditor';
import NoteView from '@/components/NoteView';
import { Button } from '@/components/ui/button';
import { Eye, Pencil, Trash2, Copy } from 'lucide-react';
import { toast } from 'sonner';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useNoteEditor } from '@/hooks/useNoteEditor';
import { useAuth } from '@/context/AuthContext';
import { useFileNavigation } from '@/hooks/useFileNavigation';
import { useFileNavigationShortcuts } from '@/hooks/useFileNavigationShortcuts';
import { FileNavigationButtons } from '@/components/FileNavigationButtons';

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
  const { user } = useAuth();
  const [isPublic, setIsPublic] = React.useState(false);

  const isOwner = selectedNote && user && selectedNote.userId === user.id;

  // File navigation logic
  const {
    canNavigate,
    hasPrevious,
    hasNext,
    navigateToPrevious,
    navigateToNext,
  } = useFileNavigation({
    currentNote: selectedNote,
    allNotes,
    currentFolderId: selectedNote?.folderId || null,
    onSelectNote,
  });

  // File navigation shortcuts
  useFileNavigationShortcuts({
    hasPrevious,
    hasNext,
    onPrevious: navigateToPrevious,
    onNext: navigateToNext,
    isPreviewMode: viewMode === 'preview',
  });

  React.useEffect(() => {
    if (selectedNote && user) {
      console.log('--- Debugging Note Ownership ---');
      console.log('Selected Note User ID:', selectedNote.userId);
      console.log('Current User ID:', user.id);
      console.log('Are IDs equal?', selectedNote.userId === user.id);
      console.log('---------------------------------');
    }
  }, [selectedNote, user]);

  React.useEffect(() => {
    if (selectedNote) {
      setIsPublic((selectedNote as any).isPublic || false);
    } else {
      setIsPublic(false);
    }
  }, [selectedNote]);

  const handleSaveFromEditor = (noteData: Pick<Note, 'title' | 'content' | 'tags'> & { id?: string }) => {
    onSave({ ...noteData, isPublic });
  };

  const {
    title,
    setTitle,
    content,
    setContent,
    tags,
    setTags,
    textareaRef,
    fileInputRef,
    handleClear,
    handleSave: handleSaveFromHook,
    handleAddImageClick,
    handleImageUpload,
  } = useNoteEditor({ onSave: handleSaveFromEditor, selectedNote });

  const previewNote = {
    ...(selectedNote || {
      id: 'new-note-preview',
      createdAt: new Date(),
      folderId: null,
      slug: null,
    }),
    ...selectedNote,
    title,
    content,
    tags: tags.split(',').map(t => t.trim()).filter(Boolean),
    updatedAt: new Date(),
    isPublic,
  };

  const handleCopyId = () => {
    if (selectedNote) {
      navigator.clipboard.writeText(selectedNote.id);
      toast.info("Note ID copied to clipboard.");
    }
  };

  const handlePublicToggle = (checked: boolean) => {
    setIsPublic(checked);
    if (selectedNote && viewMode === 'preview') {
        onSave({
            id: selectedNote.id,
            title: selectedNote.title,
            content: selectedNote.content,
            tags: selectedNote.tags,
            isPublic: checked,
        });
        toast.info(`Note is now ${checked ? 'public' : 'private'}.`);
    } else if (viewMode === 'edit') {
        // Just update state, don't save yet.
    }
  };

  return (
    <div className="flex-grow flex flex-col">
      <div className="flex-grow">
        {viewMode === 'edit' ? (
          <NoteEditor 
            onSave={handleSaveFromHook} 
            selectedNote={selectedNote}
            onDelete={onDelete}
            isPublic={isPublic}
            title={title}
            setTitle={setTitle}
            content={content}
            setContent={setContent}
            tags={tags}
            setTags={setTags}
            textareaRef={textareaRef}
            fileInputRef={fileInputRef}
            handleClear={handleClear}
            handleAddImageClick={handleAddImageClick}
            handleImageUpload={handleImageUpload}
          />
        ) : (
          <NoteView 
            note={previewNote as Note}
            allNotes={allNotes}
            onSelectNote={onSelectNote}
          />
        )}
      </div>
      <div className="flex items-center justify-between mt-4 p-2 border-t sticky bottom-0 bg-background">
        <div className="flex items-center gap-2">
            {isOwner && viewMode === 'preview' && selectedNote && (
                <div className="flex items-center space-x-2">
                    <Switch id="is-public-preview" checked={isPublic} onCheckedChange={handlePublicToggle} />
                    <Label htmlFor="is-public-preview">Public</Label>
                </div>
            )}
        </div>
        <div className="flex items-center gap-2 justify-end">
            {isOwner && selectedNote && (
            <>
                {viewMode === 'edit' && (
                    <div className="flex items-center space-x-2">
                        <Switch id="is-public-edit" checked={isPublic} onCheckedChange={setIsPublic} />
                        <Label htmlFor="is-public-edit">Public</Label>
                    </div>
                )}
                {viewMode === 'preview' && canNavigate && (
                    <FileNavigationButtons
                        hasPrevious={hasPrevious}
                        hasNext={hasNext}
                        onPrevious={navigateToPrevious}
                        onNext={navigateToNext}
                    />
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
