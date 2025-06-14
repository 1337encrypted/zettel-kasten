
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TextareaWithLineNumbers } from '@/components/ui/TextareaWithLineNumbers';
import { Label } from '@/components/ui/label';
import { Note } from '@/types';
import { ImagePlus } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';

interface NoteEditorProps {
  onSave: (note: Pick<Note, 'title' | 'content' | 'tags'> & { id?: string }) => void;
  selectedNote: Note | null;
  onDelete: (noteId: string) => void;
}

const NoteEditor: React.FC<NoteEditorProps> = ({ onSave, selectedNote, onDelete }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (selectedNote) {
      setTitle(selectedNote.title);
      setContent(selectedNote.content);
      setTags(selectedNote.tags?.join(', ') || '');
    } else {
      setTitle('');
      setContent('');
      setTags('');
    }
  }, [selectedNote]);

  const handleClear = () => {
    setTitle('');
    setContent('');
    setTags('');
  };

  const handleSave = useCallback(() => {
    if (title.trim() === '' || content.trim() === '') {
      toast.warning('Title and content cannot be empty');
      return;
    }
    const tagsArray = tags.split(',').map(t => t.trim()).filter(Boolean);
    onSave({ id: selectedNote?.id, title, content, tags: tagsArray });
  }, [title, content, tags, onSave, selectedNote]);
  
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 's' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        handleSave();
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [handleSave]);


  const handleAddImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!user) {
      toast.error("You must be logged in to upload an image.");
      return;
    }
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const fileName = `${uuidv4()}.${file.name.split('.').pop()}`;
      const filePath = `${user.id}/${fileName}`;
      
      toast.info("Uploading image...");

      const { error: uploadError } = await supabase.storage
        .from('note-images')
        .upload(filePath, file);
      
      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage
        .from('note-images')
        .getPublicUrl(filePath);
      
      const imageUrl = data.publicUrl;

      if (textareaRef.current) {
        const { selectionStart, selectionEnd } = textareaRef.current;
        const imageMarkdown = `\n![${file.name}](${imageUrl})\n`;
        
        const newContent = 
          content.substring(0, selectionStart) + 
          imageMarkdown + 
          content.substring(selectionEnd);
        
        setContent(newContent);
  
        setTimeout(() => {
          if (textareaRef.current) {
            const newCursorPosition = selectionStart + imageMarkdown.length;
            textareaRef.current.focus();
            textareaRef.current.setSelectionRange(newCursorPosition, newCursorPosition);
          }
        }, 0);
      }
      toast.success("Image uploaded and inserted!");
    } catch (error: any) {
      toast.error(`Image upload failed: ${error.message}`);
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

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
      <div className="flex-grow flex flex-col">
        <div className="flex justify-between items-center mb-1">
          <Label htmlFor="note-content" className="text-sm font-medium">Content (Markdown)</Label>
          <Button variant="ghost" size="sm" onClick={handleAddImageClick} type="button">
              <ImagePlus className="mr-2 h-4 w-4" />
              Add Image
          </Button>
        </div>
        <TextareaWithLineNumbers
          id="note-content"
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Enter note content in Markdown..."
          className="mt-1 flex-grow min-h-[400px]"
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
        <Button onClick={handleSave} className="w-full sm:w-auto">
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
