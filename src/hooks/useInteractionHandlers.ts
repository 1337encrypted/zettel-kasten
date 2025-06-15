
import { useCallback, Dispatch, SetStateAction } from 'react';
import { To, NavigateOptions } from 'react-router-dom';
import { Note } from '@/types';

interface UseInteractionHandlersProps {
    currentFolderId: string | null;
    viewMode: 'list' | 'edit' | 'preview';
    selectedNoteIds: string[];
    cheatSheetOpen: boolean;
    setViewMode: Dispatch<SetStateAction<'list' | 'edit' | 'preview'>>;
    setSelectedNote: Dispatch<SetStateAction<Note | null>>;
    setCheatSheetOpen: Dispatch<SetStateAction<boolean>>;
    setSearchQuery: Dispatch<SetStateAction<string>>;
    resetSelection: () => void;
    getFolderPath: (folderId: string | null) => string;
    handleNavigateUp: () => void;
    handleSelectFolder: (folderId: string) => void;
    navigate: (to: To, options?: NavigateOptions) => void;
}

export const useInteractionHandlers = ({
    currentFolderId,
    viewMode,
    selectedNoteIds,
    cheatSheetOpen,
    setViewMode,
    setSelectedNote,
    setCheatSheetOpen,
    setSearchQuery,
    resetSelection,
    getFolderPath,
    handleNavigateUp,
    handleSelectFolder,
    navigate,
}: UseInteractionHandlersProps) => {

    const handleBackToList = useCallback(() => {
        setViewMode('list');
        setSelectedNote(null);
        resetSelection();
        const folderPath = getFolderPath(currentFolderId);
        navigate(folderPath === '/dashboard' ? folderPath : `${folderPath}/`);
    }, [resetSelection, currentFolderId, getFolderPath, navigate, setViewMode, setSelectedNote]);

    const handleEscape = useCallback((e: KeyboardEvent) => {
        if (cheatSheetOpen) {
            e.preventDefault();
            setCheatSheetOpen(false);
            return;
        }
        if (selectedNoteIds.length > 0) {
            e.preventDefault();
            resetSelection();
        } else if (viewMode !== 'list') {
            e.preventDefault();
            handleBackToList();
        } else if (currentFolderId) {
            e.preventDefault();
            handleNavigateUp();
        }
    }, [selectedNoteIds.length, viewMode, currentFolderId, resetSelection, handleBackToList, handleNavigateUp, cheatSheetOpen, setCheatSheetOpen]);

    const handleToggleView = () => {
        setViewMode(prev => (prev === 'edit' ? 'preview' : 'edit'));
    };

    const handleSelectFolderFromCommandMenu = (folderId: string) => {
        handleSelectFolder(folderId);
        setViewMode('list');
        setSelectedNote(null);
        setSearchQuery('');
        resetSelection();
    };

    return {
        handleBackToList,
        handleEscape,
        handleToggleView,
        handleSelectFolderFromCommandMenu,
    };
};
