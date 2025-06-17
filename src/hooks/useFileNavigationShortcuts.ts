
import { useEffect, useCallback } from 'react';

interface UseFileNavigationShortcutsProps {
  hasPrevious: boolean;
  hasNext: boolean;
  onPrevious: () => void;
  onNext: () => void;
  isPreviewMode: boolean;
}

export const useFileNavigationShortcuts = ({
  hasPrevious,
  hasNext,
  onPrevious,
  onNext,
  isPreviewMode,
}: UseFileNavigationShortcutsProps) => {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Only work in preview mode and when not in input/textarea
    if (!isPreviewMode) return;
    
    const target = e.target as HTMLElement;
    const isEditing = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;
    if (isEditing) return;

    // Only navigate if there's a previous note available
    if (e.key === 'h' && hasPrevious) {
      e.preventDefault();
      onPrevious();
    }
    
    // Only navigate if there's a next note available
    if (e.key === 'l' && hasNext) {
      e.preventDefault();
      onNext();
    }
  }, [hasPrevious, hasNext, onPrevious, onNext, isPreviewMode]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
};
