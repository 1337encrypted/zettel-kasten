
import { useState } from 'react';
import { Note } from '@/types';

export const useCoreAppState = () => {
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'edit' | 'preview'>('list');
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);

  return {
    selectedNote,
    setSelectedNote,
    viewMode,
    setViewMode,
    currentFolderId,
    setCurrentFolderId,
  };
};
