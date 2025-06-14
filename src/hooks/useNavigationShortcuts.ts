
import { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

export const useNavigationShortcuts = () => {
  const navigate = useNavigate();

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const target = e.target as HTMLElement;
    const isEditing = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;

    if (isEditing) {
      return;
    }

    if (e.key === 'j') {
      window.scrollBy({ top: 75, left: 0, behavior: 'smooth' });
    } else if (e.key === 'k') {
      window.scrollBy({ top: -75, left: 0, behavior: 'smooth' });
    } else if (e.key === 'Escape' || e.key === 'Backspace') {
      if (window.location.pathname !== '/') {
        e.preventDefault();
        navigate(-1);
      }
    }
  }, [navigate]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);
};
