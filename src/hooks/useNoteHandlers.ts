
import { useCallback } from 'react';
import { Note } from '@/types';
import { NavigateOptions, To } from 'react-router-dom';

type NoteDataToSave = Pick<Note, 'title' | 'content' | 'tags'> & { id?: string, isPublic?: boolean };

interface UseNoteHandlersProps {
    currentFolderId: string | null;
    selectedNote: Note | null;
    setSelectedNote: (note: Note | null) => void;
    setViewMode: (viewMode: 'list' | 'edit' | 'preview') => void;
    resetSelection: () => void;
    saveNote: (noteData: NoteDataToSave & { folderId?: string | null }) => Promise<Note>;
    deleteNote: (noteId: string) => void;
    navigate: (to: To, options?: NavigateOptions) => void;
    getNotePath: (note: Note) => string;
}

export const useNoteHandlers = ({
    currentFolderId,
    selectedNote,
    setSelectedNote,
    setViewMode,
    resetSelection,
    saveNote,
    deleteNote,
    navigate,
    getNotePath,
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
            navigate(getNotePath(saved));
        } catch (error) {
            console.error("Failed to save note:", error);
        }
    }, [currentFolderId, saveNote, setSelectedNote, setViewMode, navigate, getNotePath]);
    
    const handleSelectNote = (note: Note) => {
        setSelectedNote(note);
        setViewMode('preview');
        resetSelection();
        navigate(getNotePath(note));
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
