
import React from 'react';
import { useAppLogic } from '@/hooks/useAppLogic';

import { AppHeader } from '@/components/AppHeader';
import { AppFooter } from '@/components/AppFooter';
import { ListView } from '@/components/ListView';
import { DetailView } from '@/components/DetailView';
import { Toaster } from '@/components/ui/sonner';
import { CommandMenu } from '@/components/CommandMenu';

const Index = () => {
  const {
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
    handleBackToList,
    handleSelectFolderFromCommandMenu,
    filteredFolders,
    filteredNotes,
    handleToggleNoteSelection,
    handleBulkDeleteNotes,
    handleRenameFolder,
    handleSelectAll,
    handleExportAllNotes,
    handleOpenShortcuts,
  } = useAppLogic();

  return (
    <div className="min-h-screen w-full flex flex-col bg-background p-4 md:p-8" style={{ fontFamily: "Inter, sans-serif" }}>
      <AppHeader
        onExportAllNotes={handleExportAllNotes}
        viewMode={viewMode}
        onBackToList={handleBackToList}
        cheatSheetOpen={cheatSheetOpen}
        onCheatSheetOpenChange={setCheatSheetOpen}
      />

      <main className="flex-grow flex flex-col">
        {viewMode === 'list' ? (
          <ListView
            filteredFolders={filteredFolders}
            filteredNotes={filteredNotes}
            allNotes={notes}
            currentFolderId={currentFolderId}
            selectedNoteId={selectedNote?.id}
            onNewNote={handleNewNote}
            onCreateFolder={handleCreateFolder}
            onSelectFolder={handleSelectFolder}
            onNavigateUp={handleNavigateUp}
            onSelectNote={handleSelectNote}
            onDeleteFolder={handleDeleteFolder}
            sortOrder={sortOrder}
            onSortOrderChange={setSortOrder}
            searchQuery={searchQuery}
            onSearchQueryChange={setSearchQuery}
            onRenameFolder={handleRenameFolder}
            selectedNoteIds={selectedNoteIds}
            onToggleNoteSelection={handleToggleNoteSelection}
            onBulkDeleteNotes={handleBulkDeleteNotes}
            onSelectAll={handleSelectAll}
          />
        ) : (
          <DetailView 
            viewMode={viewMode}
            selectedNote={selectedNote}
            onSave={handleSaveNote}
            onBackToList={handleBackToList}
            onToggleView={handleToggleView}
            onDelete={handleDeleteNote}
            allNotes={notes}
            onSelectNote={handleSelectNote}
          />
        )}
      </main>

      <AppFooter />
      <Toaster />
      <CommandMenu
        open={commandMenuOpen}
        onOpenChange={setCommandMenuOpen}
        notes={notes}
        folders={folders}
        onSelectNote={handleSelectNote}
        onNewNote={handleNewNote}
        onCreateFolder={handleCreateFolder}
        onSelectFolder={handleSelectFolderFromCommandMenu}
        onSelectAll={handleSelectAll}
        onOpenShortcuts={handleOpenShortcuts}
      />
    </div>
  );
};

export default Index;

