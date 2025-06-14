
import { useEffect, useCallback } from 'react';

interface KeyboardShortcutProps {
  onNewNote: () => void;
  onToggleCommandMenu: () => void;
  onEscape: (e: KeyboardEvent) => void;
  onSelectAll: () => void;
}

export const useKeyboardShortcuts = ({
  onNewNote,
  onToggleCommandMenu,
  onEscape,
  onSelectAll,
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

    if (e.key === 'a' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      onSelectAll();
    }

    if (e.key === 'Escape') {
      onEscape(e);
    }

    if (e.key === 'Backspace') {
      const target = e.target as HTMLElement;
      const isEditing = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;
      if (!isEditing) {
        onEscape(e);
      }
    }
  }, [onNewNote, onToggleCommandMenu, onEscape, onSelectAll]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
};
