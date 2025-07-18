
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Note } from '@/types';
import { ImagePlus } from 'lucide-react';
import { toast } from 'sonner';

interface NoteEditorProps {
  onSave: () => void;
  selectedNote: Note | null;
  onDelete: (noteId: string) => void;
  isPublic: boolean;
  title: string;
  setTitle: (value: string) => void;
  content: string;
  setContent: (value: string) => void;
  tags: string;
  setTags: (value: string) => void;
  textareaRef: React.RefObject<HTMLTextAreaElement>;
  fileInputRef: React.RefObject<HTMLInputElement>;
  handleClear: () => void;
  handleAddImageClick: () => void;
  handleImageUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const NoteEditor: React.FC<NoteEditorProps> = ({
  onSave,
  selectedNote,
  onDelete,
  isPublic,
  title,
  setTitle,
  content,
  setContent,
  tags,
  setTags,
  textareaRef,
  fileInputRef,
  handleClear,
  handleAddImageClick,
  handleImageUpload,
}) => {
  return (
    <div className="space-y-4 p-4 border rounded-lg shadow h-full flex flex-col">
      <h2 className="text-2xl font-semibold">{selectedNote ? 'Edit Note' : 'Create New Note'}</h2>
      <div>
        <Label htmlFor="note-title" className="text-sm font-medium">Title</Label>
        <Input
          id="note-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter note title"
          className="mt-1"
        />
      </div>
      <div>
        <Label htmlFor="note-tags" className="text-sm font-medium">Tags (comma-separated)</Label>
        <Input
          id="note-tags"
          type="text"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="e.g. programming, react, thoughts"
          className="mt-1"
        />
      </div>
      <div className="flex-grow flex flex-col min-h-0">
        <div className="flex justify-between items-center mb-1">
          <Label htmlFor="note-content" className="text-sm font-medium">Content (Markdown)</Label>
          <Button variant="ghost" size="sm" onClick={handleAddImageClick} type="button">
              <ImagePlus className="mr-2 h-4 w-4" />
              Add Image
          </Button>
        </div>
        <Textarea
          id="note-content"
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Enter note content in Markdown..."
          className="mt-1 flex-grow min-h-[400px] font-mono text-sm resize-none"
        />
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImageUpload}
          className="hidden"
          accept="image/png, image/jpeg, image/gif, image/webp"
        />
      </div>
      <div>
        <Button onClick={onSave} className="w-full sm:w-auto">
          {selectedNote ? 'Save Changes' : 'Create Note'}
        </Button>
        {selectedNote && (
          <>
            <Button 
              variant="secondary" 
              onClick={handleClear} 
              className="w-full sm:w-auto ml-2"
            >
              Clear
            </Button>
            <Button
              variant="destructive"
              onClick={() => onDelete(selectedNote.id)}
              className="w-full sm:w-auto ml-2"
            >
              Delete
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default NoteEditor;
