
import { useCallback, useMemo } from 'react';
import { Note } from '@/types';

interface UseFileNavigationProps {
  currentNote: Note | null;
  allNotes: Note[];
  currentFolderId: string | null;
  onSelectNote: (note: Note) => void;
}

export const useFileNavigation = ({
  currentNote,
  allNotes,
  currentFolderId,
  onSelectNote,
}: UseFileNavigationProps) => {
  // Get notes in the current folder, sorted by title
  const notesInCurrentFolder = useMemo(() => {
    return allNotes
      .filter(note => note.folderId === currentFolderId)
      .sort((a, b) => a.title.localeCompare(b.title));
  }, [allNotes, currentFolderId]);

  const currentIndex = useMemo(() => {
    if (!currentNote) return -1;
    return notesInCurrentFolder.findIndex(note => note.id === currentNote.id);
  }, [currentNote, notesInCurrentFolder]);

  const canNavigate = notesInCurrentFolder.length > 1;
  const hasPrevious = canNavigate && currentIndex > 0;
  const hasNext = canNavigate && currentIndex < notesInCurrentFolder.length - 1;

  const navigateToPrevious = useCallback(() => {
    if (hasPrevious) {
      const previousNote = notesInCurrentFolder[currentIndex - 1];
      onSelectNote(previousNote);
    }
  }, [hasPrevious, notesInCurrentFolder, currentIndex, onSelectNote]);

  const navigateToNext = useCallback(() => {
    if (hasNext) {
      const nextNote = notesInCurrentFolder[currentIndex + 1];
      onSelectNote(nextNote);
    }
  }, [hasNext, notesInCurrentFolder, currentIndex, onSelectNote]);

  return {
    canNavigate,
    hasPrevious,
    hasNext,
    navigateToPrevious,
    navigateToNext,
  };
};
