
import { useState, useCallback } from 'react';

export type ListViewMode = 'list' | 'card';

export const useUIState = () => {
    const [commandMenuOpen, setCommandMenuOpen] = useState(false);
    const [cheatSheetOpen, setCheatSheetOpen] = useState(false);
    const [listViewMode, setListViewMode] = useState<ListViewMode>('list');

    const handleOpenShortcuts = useCallback(() => {
        setCheatSheetOpen(true);
    }, []);

    const handleToggleCommandMenu = useCallback(() => {
        setCommandMenuOpen(open => !open);
    }, []);

    const handleToggleListViewMode = useCallback(() => {
        setListViewMode(current => current === 'list' ? 'card' : 'list');
    }, []);

    return {
        commandMenuOpen,
        setCommandMenuOpen,
        cheatSheetOpen,
        setCheatSheetOpen,
        listViewMode,
        setListViewMode,
        handleOpenShortcuts,
        handleToggleCommandMenu,
        handleToggleListViewMode,
    };
};
