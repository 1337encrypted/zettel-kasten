import { useState, useEffect, useRef, useCallback } from 'react';
import { Note } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';

interface UseNoteEditorProps {
  onSave: (note: Pick<Note, 'title' | 'content' | 'tags'> & { id?: string }) => void;
  selectedNote: Note | null;
}

export const useNoteEditor = ({ onSave, selectedNote }: UseNoteEditorProps) => {
  const [title, setTitle] = useState('');
  
  const [contentState, setContentState] = useState({
    past: [] as string[],
    present: '',
    future: [] as string[],
  });
  const content = contentState.present;

  const [tags, setTags] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();

  const setContent = useCallback((newContent: string) => {
    setContentState(currentState => {
      if (newContent === currentState.present) {
        return currentState;
      }
      return {
        past: [...currentState.past, currentState.present],
        present: newContent,
        future: [],
      };
    });
  }, []);

  const undo = useCallback(() => {
    setContentState(currentState => {
        const { past, present, future } = currentState;
        if (past.length === 0) return currentState;
        const previous = past[past.length - 1];
        const newPast = past.slice(0, past.length - 1);
        return {
            past: newPast,
            present: previous,
            future: [present, ...future],
        };
    });
  }, []);

  const redo = useCallback(() => {
    setContentState(currentState => {
        const { past, present, future } = currentState;
        if (future.length === 0) return currentState;
        const next = future[0];
        const newFuture = future.slice(1);
        return {
            past: [...past, present],
            present: next,
            future: newFuture,
        };
    });
  }, []);

  useEffect(() => {
    if (selectedNote) {
      setTitle(selectedNote.title);
      setContentState({ past: [], present: selectedNote.content, future: [] });
      setTags(selectedNote.tags?.join(', ') || '');
    } else {
      setTitle('');
      setContentState({ past: [], present: '', future: [] });
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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        const target = e.target as HTMLElement;
        const isEditingContent = target.tagName === 'TEXTAREA' && target.id === 'note-content';

        if (!isEditingContent) return;

        const isUndo = e.key === 'z' && (e.metaKey || e.ctrlKey) && !e.shiftKey;
        const isRedo = 
          (e.key === 'z' && (e.metaKey || e.ctrlKey) && e.shiftKey) || // Cmd/Ctrl+Shift+Z
          (e.key === 'y' && e.ctrlKey && !e.metaKey); // Ctrl+Y for Windows

        if (isUndo) {
            e.preventDefault();
            undo();
        } else if (isRedo) {
            e.preventDefault();
            redo();
        }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);


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
