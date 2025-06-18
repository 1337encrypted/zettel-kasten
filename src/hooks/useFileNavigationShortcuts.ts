
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

    // H key - trigger previous file button functionality (only if button would be visible)
    if (e.key === 'h' || e.key === 'H') {
      if (hasPrevious) {
        e.preventDefault();
        console.log('H pressed - navigating to previous file');
        onPrevious();
      }
    }
    
    // L key - trigger next file button functionality (only if button would be visible)
    if (e.key === 'l' || e.key === 'L') {
      if (hasNext) {
        e.preventDefault();
        console.log('L pressed - navigating to next file');
        onNext();
      }
    }
  }, [hasPrevious, hasNext, onPrevious, onNext, isPreviewMode]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
};
