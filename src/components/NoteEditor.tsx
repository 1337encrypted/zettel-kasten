
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Note } from '@/types';
import { ImagePlus } from 'lucide-react';

interface NoteEditorProps {
  onSave: (note: Pick<Note, 'title' | 'content' | 'tags'> & { id?: string }) => void;
  selectedNote: Note | null;
  onNewNote: () => void;
}

const NoteEditor: React.FC<NoteEditorProps> = ({ onSave, selectedNote, onNewNote }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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

  const handleSave = () => {
    if (title.trim() === '' || content.trim() === '') {
      // Ideally, show a toast message here
      console.warn('Title and content cannot be empty');
      return;
    }
    const tagsArray = tags.split(',').map(t => t.trim()).filter(Boolean);
    onSave({ id: selectedNote?.id, title, content, tags: tagsArray });
  };

  const handleAddImage = () => {
    const url = window.prompt('Enter the image URL:');
    if (url && textareaRef.current) {
      const { selectionStart, selectionEnd } = textareaRef.current;
      const imageMarkdown = `\n![image](${url})\n`;
      
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
          <Button variant="ghost" size="sm" onClick={handleAddImage} type="button">
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
          className="mt-1 flex-grow min-h-[200px]"
        />
      </div>
      <div>
        <Button onClick={handleSave} className="w-full sm:w-auto">
          {selectedNote ? 'Save Changes' : 'Create Note'}
        </Button>
        {selectedNote && (
          <Button 
            variant="outline" 
            onClick={onNewNote} 
            className="w-full sm:w-auto ml-2"
          >
            Clear / New
          </Button>
        )}
      </div>
    </div>
  );
};

export default NoteEditor;
