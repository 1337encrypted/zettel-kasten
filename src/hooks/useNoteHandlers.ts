
import { useCallback } from 'react';
import { Note } from '@/types';

type NoteDataToSave = Pick<Note, 'title' | 'content' | 'tags'> & { id?: string, isPublic?: boolean };

interface UseNoteHandlersProps {
    currentFolderId: string | null;
    selectedNote: Note | null;
    setSelectedNote: (note: Note | null) => void;
    setViewMode: (viewMode: 'list' | 'edit' | 'preview') => void;
    resetSelection: () => void;
    saveNote: (noteData: NoteDataToSave & { folderId?: string | null }) => Promise<Note>;
    deleteNote: (noteId: string) => void;
}

export const useNoteHandlers = ({
    currentFolderId,
    selectedNote,
    setSelectedNote,
    setViewMode,
    resetSelection,
    saveNote,
    deleteNote,
}: UseNoteHandlersProps) => {

    const handleNewNote = useCallback(() => {
        setSelectedNote(null);
        setViewMode('edit');
        resetSelection();
    }, [resetSelection, setSelectedNote, setViewMode]);
    
    const handleSaveNote = useCallback(async (noteData: NoteDataToSave) => {
        const payload = {
            ...noteData,
            ...(!noteData.id && { folderId: currentFolderId }),
        };
        try {
            const saved = await saveNote(payload);
            setSelectedNote(saved);
            setViewMode('preview');
        } catch (error) {
            console.error("Failed to save note:", error);
        }
    }, [currentFolderId, saveNote, setSelectedNote, setViewMode]);
    
    const handleSelectNote = (note: Note) => {
        setSelectedNote(note);
        setViewMode('preview');
        resetSelection();
    };

    const handleDeleteNote = (noteId: string) => {
        deleteNote(noteId);
        if (selectedNote && selectedNote.id === noteId) {
            setSelectedNote(null);
            setViewMode('list');
        }
    };
    
    return {
        handleNewNote,
        handleSaveNote,
        handleSelectNote,
        handleDeleteNote,
    };
};
