
import { useState, useCallback } from 'react';
import { Note } from '@/types';

interface useNoteSelectionProps {
    filteredNotes: Note[];
    deleteMultipleNotes: (noteIds: string[]) => Promise<void>;
}

export const useNoteSelection = ({ filteredNotes, deleteMultipleNotes }: useNoteSelectionProps) => {
  const [selectedNoteIds, setSelectedNoteIds] = useState<string[]>([]);

  const handleToggleNoteSelection = useCallback((noteId: string) => {
    setSelectedNoteIds(prev =>
      prev.includes(noteId)
        ? prev.filter(id => id !== noteId)
        : [...prev, noteId]
    );
  }, []);

  const handleBulkDeleteNotes = useCallback(async () => {
    if (selectedNoteIds.length === 0) return;
    if (window.confirm(`Are you sure you want to delete ${selectedNoteIds.length} selected note(s)?`)) {
      await deleteMultipleNotes(selectedNoteIds);
      setSelectedNoteIds([]);
    }
  }, [selectedNoteIds, deleteMultipleNotes]);

  const handleSelectAll = useCallback(() => {
    const selectableNotes = filteredNotes.filter(n => n.title.toLowerCase() !== 'readme');
    if (selectableNotes.length > 0 && selectedNoteIds.length === selectableNotes.length) {
      setSelectedNoteIds([]);
    } else {
      setSelectedNoteIds(selectableNotes.map(n => n.id));
    }
  }, [filteredNotes, selectedNoteIds]);

  const resetSelection = useCallback(() => {
      setSelectedNoteIds([]);
  }, []);

  return {
    selectedNoteIds,
    handleToggleNoteSelection,
    handleBulkDeleteNotes,
    handleSelectAll,
    resetSelection,
  };
};
