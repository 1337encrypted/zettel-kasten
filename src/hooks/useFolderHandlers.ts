
import { useCallback } from 'react';
import { Folder } from '@/types';

interface UseFolderHandlersProps {
    folders: Folder[];
    currentFolderId: string | null;
    setCurrentFolderId: (folderId: string | null) => void;
    resetSelection: () => void;
    renameFolder: (folderId: string, newName: string) => void;
    createFolder: (folderName: string, parentId: string | null) => void;
    deleteFolderAndDescendants: (folderId: string) => Promise<string[]>;
    deleteNotesByFolderIds: (folderIds: string[]) => Promise<number>;
}

export const useFolderHandlers = ({
    folders,
    currentFolderId,
    setCurrentFolderId,
    resetSelection,
    renameFolder,
    createFolder,
    deleteFolderAndDescendants,
    deleteNotesByFolderIds
}: UseFolderHandlersProps) => {
    const handleRenameFolder = (folderId: string) => {
        const folder = folders.find(f => f.id === folderId);
        if (!folder) return;
        const newName = prompt("Enter new folder name:", folder.name);
        if (newName && newName.trim() && newName.trim() !== folder.name) {
            renameFolder(folderId, newName.trim());
        }
    };

    const handleSelectFolder = (folderId: string | null) => {
        setCurrentFolderId(folderId);
        resetSelection();
    };

    const handleNavigateUp = useCallback(() => {
        if (!currentFolderId) return;
        const currentFolder = folders.find(f => f.id === currentFolderId);
        setCurrentFolderId(currentFolder?.parentId || null);
        resetSelection();
    }, [currentFolderId, folders, setCurrentFolderId, resetSelection]);

    const handleCreateFolder = useCallback(() => {
        const folderName = prompt("Enter folder name:");
        if (folderName && folderName.trim()) {
            createFolder(folderName.trim(), currentFolderId);
        }
    }, [createFolder, currentFolderId]);

    const handleDeleteFolder = async (folderId: string) => {
        const folderToDelete = folders.find(f => f.id === folderId);
        const parentId = folderToDelete?.parentId || null;

        try {
            const deletedFolderIds = await deleteFolderAndDescendants(folderId);
            if (deletedFolderIds && deletedFolderIds.length > 0) {
                await deleteNotesByFolderIds(deletedFolderIds);
            }

            if (currentFolderId && deletedFolderIds?.includes(currentFolderId)) {
                setCurrentFolderId(parentId);
            }
        } catch (error) {
            console.error("Failed to delete folder and its contents:", error);
        }
    };

    return {
        handleRenameFolder,
        handleSelectFolder,
        handleNavigateUp,
        handleCreateFolder,
        handleDeleteFolder,
    };
};
