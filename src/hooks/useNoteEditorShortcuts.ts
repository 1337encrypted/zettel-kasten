
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface UseNoteEditorShortcutsProps {
  handleSave: () => void;
  undo: () => void;
  redo: () => void;
}

export const useNoteEditorShortcuts = ({ handleSave, undo, redo }: UseNoteEditorShortcutsProps) => {
  const location = useLocation();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (location.pathname !== '/dashboard') return;
      if (e.key === 's' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        handleSave();
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [handleSave, location.pathname]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if (location.pathname !== '/dashboard') return;

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
  }, [undo, redo, location.pathname]);
};
