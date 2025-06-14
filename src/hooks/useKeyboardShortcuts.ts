
import { useEffect, useCallback } from 'react';

interface KeyboardShortcutProps {
  onNewNote: () => void;
  onToggleCommandMenu: () => void;
  onEscape: (e: KeyboardEvent) => void;
}

export const useKeyboardShortcuts = ({
  onNewNote,
  onToggleCommandMenu,
  onEscape,
}: KeyboardShortcutProps) => {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      onToggleCommandMenu();
    }
    
    if (e.key === 'n' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      onNewNote();
    }

    if (e.key === 'Escape') {
      onEscape(e);
    }
  }, [onNewNote, onToggleCommandMenu, onEscape]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
};
