
import { useRef, useCallback } from 'react';
import { Note } from '@/types';
import { toast } from 'sonner';
import { useNoteEditorState } from './useNoteEditorState';
import { useNoteImageHandler } from './useNoteImageHandler';
import { useNoteEditorShortcuts } from './useNoteEditorShortcuts';

interface UseNoteEditorProps {
  onSave: (note: Pick<Note, 'title' | 'content' | 'tags'> & { id?: string }) => void;
  selectedNote: Note | null;
}

export const useNoteEditor = ({ onSave, selectedNote }: UseNoteEditorProps) => {
  const {
    title,
    setTitle,
    content,
    setContent,
    tags,
    setTags,
    undo,
    redo,
    handleClear,
  } = useNoteEditorState({ selectedNote });
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const {
    fileInputRef,
    handleAddImageClick,
    handleImageUpload,
  } = useNoteImageHandler({ content, setContent, textareaRef });

  const handleSave = useCallback(() => {
    if (title.trim() === '' || content.trim() === '') {
      toast.warning('Title and content cannot be empty');
      return;
    }
    const tagsArray = tags.split(',').map(t => t.trim()).filter(Boolean);
    onSave({ id: selectedNote?.id, title, content, tags: tagsArray });
  }, [title, content, tags, onSave, selectedNote]);
  
  useNoteEditorShortcuts({ handleSave, undo, redo });

  return {
    title,
    setTitle,
    content,
    setContent,
    tags,
    setTags,
    textareaRef,
    fileInputRef,
    handleClear,
    handleSave,
    handleAddImageClick,
    handleImageUpload,
  };
};
