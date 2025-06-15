
import { useState, useCallback } from 'react';

export const useUIState = () => {
    const [commandMenuOpen, setCommandMenuOpen] = useState(false);
    const [cheatSheetOpen, setCheatSheetOpen] = useState(false);

    const handleOpenShortcuts = useCallback(() => {
        setCheatSheetOpen(true);
    }, []);

    const handleToggleCommandMenu = useCallback(() => {
        setCommandMenuOpen(open => !open);
    }, []);

    return {
        commandMenuOpen,
        setCommandMenuOpen,
        cheatSheetOpen,
        setCheatSheetOpen,
        handleOpenShortcuts,
        handleToggleCommandMenu,
    };
};
