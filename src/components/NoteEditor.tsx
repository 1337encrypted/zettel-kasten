
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Note } from '@/types';

interface NoteEditorProps {
  onSave: (note: Pick<Note, 'title' | 'content'> & { id?: string }) => void;
  selectedNote: Note | null;
  onNewNote: () => void;
}

const NoteEditor: React.FC<NoteEditorProps> = ({ onSave, selectedNote, onNewNote }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  useEffect(() => {
    if (selectedNote) {
      setTitle(selectedNote.title);
      setContent(selectedNote.content);
    } else {
      setTitle('');
      setContent('');
    }
  }, [selectedNote]);

  const handleSave = () => {
    if (title.trim() === '' || content.trim() === '') {
      // Ideally, show a toast message here
      console.warn('Title and content cannot be empty');
      return;
    }
    onSave({ id: selectedNote?.id, title, content });
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
      <div className="flex-grow flex flex-col">
        <Label htmlFor="note-content" className="text-sm font-medium">Content (Markdown)</Label>
        <Textarea
          id="note-content"
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
