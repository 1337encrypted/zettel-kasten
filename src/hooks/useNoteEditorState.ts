
import { useState, useEffect, useCallback } from 'react';
import { Note } from '@/types';

interface UseNoteEditorStateProps {
  selectedNote: Note | null;
}

export const useNoteEditorState = ({ selectedNote }: UseNoteEditorStateProps) => {
  const [title, setTitle] = useState('');
  
  const [contentState, setContentState] = useState({
    past: [] as string[],
    present: '',
    future: [] as string[],
  });
  const content = contentState.present;

  const [tags, setTags] = useState('');

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
    setContentState({ past: [], present: '', future: [] });
    setTags('');
  };

  return {
    title,
    setTitle,
    content,
    setContent,
    tags,
    setTags,
    undo,
    redo,
    handleClear,
  };
};
