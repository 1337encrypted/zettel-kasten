
import { useState, useCallback, useMemo } from 'react';
import { Note, Folder } from '@/types';
import { useNotes } from '@/hooks/useNotes';
import { useFolders } from '@/hooks/useFolders';
import { useSearchAndSort } from './useSearchAndSort';
import { useNoteSelection } from './useNoteSelection';
import { useKeyboardShortcuts } from './useKeyboardShortcuts';
import { useFolderHandlers } from './useFolderHandlers';
import { useNoteHandlers } from './useNoteHandlers';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { toast } from '@/components/ui/sonner';

export const useAppLogic = () => {
  const { notes, saveNote, deleteNote, deleteNotesByFolderIds, deleteMultipleNotes } = useNotes();
  const { folders, createFolder, deleteFolderAndDescendants, renameFolder, createFolderAsync } = useFolders();

  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'edit' | 'preview'>('list');
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [commandMenuOpen, setCommandMenuOpen] = useState(false);
  const [cheatSheetOpen, setCheatSheetOpen] = useState(false);

  const {
    sortOrder,
    setSortOrder,
    searchQuery,
    setSearchQuery,
    filteredFolders,
    filteredNotes,
  } = useSearchAndSort({ notes, folders, currentFolderId });
  
  const selectableNotes = useMemo(() => 
    filteredNotes.filter(note => note.title.toLowerCase() !== 'readme'),
    [filteredNotes]
  );
  
  const {
    selectedNoteIds,
    handleToggleNoteSelection,
    handleBulkDeleteNotes,
    handleSelectAll,
    resetSelection,
  } = useNoteSelection({ filteredNotes: selectableNotes, deleteMultipleNotes });

  const {
    handleRenameFolder,
    handleSelectFolder,
    handleNavigateUp,
    handleCreateFolder,
    handleDeleteFolder,
  } = useFolderHandlers({
    folders,
    currentFolderId,
    setCurrentFolderId,
    resetSelection,
    renameFolder,
    createFolder,
    deleteFolderAndDescendants,
    deleteNotesByFolderIds,
  });

  const {
    handleNewNote,
    handleSaveNote,
    handleSelectNote,
    handleDeleteNote,
  } = useNoteHandlers({
    currentFolderId,
    selectedNote,
    setSelectedNote,
    setViewMode,
    resetSelection,
    saveNote,
    deleteNote,
  });

  const handleExportAllNotes = useCallback(() => {
    if (notes.length === 0) {
      toast.info("There are no notes to export.");
      return;
    }

    const zip = new JSZip();

    const getFolderPath = (folderId: string | undefined | null, allFolders: Folder[]): string => {
      if (!folderId) {
        return '';
      }
      const folder = allFolders.find(f => f.id === folderId);
      if (!folder) {
        return '';
      }
      return getFolderPath(folder.parentId, allFolders) + folder.name.replace(/[\/\\?%*:|"<>]/g, '-') + '/';
    };

    notes.forEach(note => {
      const folderPath = getFolderPath(note.folderId, folders);
      const fileName = `${note.title.replace(/[\/\\?%*:|"<>]/g, '-')}.md`;
      const fileContent = `# ${note.title}\n\n${note.content}`;
      zip.file(folderPath + fileName, fileContent);
    });

    zip.generateAsync({ type: 'blob' })
      .then(content => {
        saveAs(content, 'Zet-Export.zip');
        toast.success("Notes exported successfully!");
      })
      .catch(err => {
        console.error("Failed to export notes:", err);
        toast.error("An error occurred while exporting notes.");
      });
  }, [notes, folders]);
  
  const handleSeedData = useCallback(async () => {
    if (!createFolderAsync) {
        toast.error("Folder creation function is not available.");
        return;
    }
    try {
      toast.info("Creating some sample data for you...");

      // Folder: "Work"
      const workFolder = await createFolderAsync({ folderName: 'Work', parentId: null });
      await saveNote({ title: 'Meeting Notes', content: '### Q2 Planning Meeting\n\n- Discuss budget\n- Finalize roadmap', tags: ['work', 'meeting'], folderId: workFolder.id });
      await saveNote({ title: 'Project Ideas', content: '* Idea 1: New feature for the app\n* Idea 2: Marketing campaign', tags: ['work', 'project'], folderId: workFolder.id });

      // Folder: "Personal"
      const personalFolder = await createFolderAsync({ folderName: 'Personal', parentId: null });
      await saveNote({ title: 'To-do list', content: '- Buy groceries\n- Go to the gym\n- Read a book', tags: ['todo', 'personal'], folderId: personalFolder.id });

      // Sub-folder in "Personal"
      const recipesFolder = await createFolderAsync({ folderName: 'Recipes', parentId: personalFolder.id });
      await saveNote({ title: 'Pasta Carbonara', content: 'Ingredients: spaghetti, eggs, pecorino cheese, guanciale, black pepper.', tags: ['food', 'recipe'], folderId: recipesFolder.id });
      
      // Note in root
      await saveNote({ title: 'Random thought', content: 'What if we could travel faster than light?', tags: ['thoughts'] });

      toast.success("Sample data created successfully!");
    } catch (error) {
      console.error("Failed to seed data:", error);
      toast.error("An error occurred while creating sample data.");
    }
  }, [createFolderAsync, saveNote]);

  const handleBackToList = useCallback(() => {
    setViewMode('list');
    setSelectedNote(null);
    resetSelection();
  }, [resetSelection]);

  const handleOpenShortcuts = useCallback(() => {
    setCheatSheetOpen(true);
  }, []);

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
  }, [selectedNoteIds.length, viewMode, currentFolderId, resetSelection, handleBackToList, handleNavigateUp, cheatSheetOpen]);

  useKeyboardShortcuts({
      onNewNote: handleNewNote,
      onToggleCommandMenu: () => setCommandMenuOpen(open => !open),
      onEscape: handleEscape,
      onSelectAll: handleSelectAll,
      onOpenShortcuts: handleOpenShortcuts,
  });

  const handleToggleView = () => {
    setViewMode(prev => (prev === 'edit' ? 'preview' : 'edit'));
  };

  const handleSelectFolderFromCommandMenu = (folderId: string) => {
    setCurrentFolderId(folderId);
    setViewMode('list');
    setSelectedNote(null);
    setSearchQuery('');
    resetSelection();
  };

  return {
    notes,
    folders,
    selectedNote,
    viewMode,
    currentFolderId,
    sortOrder,
    searchQuery,
    commandMenuOpen,
    setCommandMenuOpen,
    cheatSheetOpen,
    setCheatSheetOpen,
    selectedNoteIds,
    handleNewNote,
    handleBackToList,
    handleSaveNote,
    handleSelectNote,
    handleDeleteNote,
    handleCreateFolder,
    handleDeleteFolder,
    handleSelectFolder,
    handleNavigateUp,
    setSortOrder,
    setSearchQuery,
    handleToggleView,
    handleSelectFolderFromCommandMenu,
    filteredFolders,
    filteredNotes,
    handleToggleNoteSelection,
    handleBulkDeleteNotes,
    handleRenameFolder,
    handleSelectAll,
    handleExportAllNotes,
    handleOpenShortcuts,
    handleSeedData,
  };
};
