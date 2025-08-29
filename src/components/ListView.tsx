import React, { useState } from 'react';
import { Folder, Note } from '@/types';
import FolderList from '@/components/FolderList';
import NoteList from '@/components/NoteList';
import { ListViewHeader } from './ListViewHeader';
import { SelectionToolbar } from './SelectionToolbar';
import { MoveNotesDialog } from './MoveNotesDialog';
import NoteView from './NoteView';
import { NoteCard } from './NoteCard';
import { FolderCard } from './FolderCard';
import type { ListViewMode } from '@/hooks/useUIState';
import { Mic } from 'lucide-react';

interface ListViewProps {
  filteredFolders: Folder[];
  filteredNotes: Note[];
  allNotes: Note[];
  allFolders: Folder[];
  currentFolderId: string | null;
  selectedNoteId: string | null | undefined;
  onNewNote: () => void;
  onCreateFolder: () => void;
  onSelectFolder: (folderId: string) => void;
  onNavigateUp: () => void;
  onSelectNote: (note: Note) => void;
  onDeleteFolder: (folderId: string) => void;
  sortOrder: 'asc' | 'desc';
  onSortOrderChange: (order: 'asc' | 'desc') => void;
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  onRenameFolder: (folderId: string) => void;
  selectedNoteIds: string[];
  onToggleNoteSelection: (noteId: string) => void;
  onBulkDeleteNotes: () => void;
  onSelectAll: () => void;
  onMoveNotes: (noteIds: string[], targetFolderId: string | null) => void;
  readmeNote?: Note;
  listViewMode: ListViewMode;
  onToggleListViewMode: () => void;
  profile?: { username: string | null } | null;
}

export const ListView: React.FC<ListViewProps> = ({
  filteredFolders,
  filteredNotes,
  allNotes,
  allFolders,
  currentFolderId,
  selectedNoteId,
  onNewNote,
  onCreateFolder,
  onSelectFolder,
  onNavigateUp,
  onSelectNote,
  onDeleteFolder,
  sortOrder,
  onSortOrderChange,
  searchQuery,
  onSearchQueryChange,
  onRenameFolder,
  selectedNoteIds,
  onToggleNoteSelection,
  onBulkDeleteNotes,
  onSelectAll,
  onMoveNotes,
  readmeNote,
  listViewMode,
  onToggleListViewMode,
  profile,
}) => {
  const [moveDialogOpen, setMoveDialogOpen] = useState(false);
  const isSearching = !!searchQuery.trim();

  // The README note should appear in the list like any other note.
  const notesForList = filteredNotes; 

  const selectableNotes = notesForList;
  const allNotesSelected = selectableNotes.length > 0 && selectedNoteIds.length === selectableNotes.length;

  const handleMoveNotes = () => {
    setMoveDialogOpen(true);
  };

  const handleMoveToFolder = async (targetFolderId: string | null) => {
    await onMoveNotes(selectedNoteIds, targetFolderId);
    setMoveDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <ListViewHeader
        onNewNote={onNewNote}
        onCreateFolder={onCreateFolder}
        searchQuery={searchQuery}
        onSearchQueryChange={onSearchQueryChange}
        sortOrder={sortOrder}
        onSortOrderChange={onSortOrderChange}
        isSearching={isSearching}
        listViewMode={listViewMode}
        onToggleListViewMode={onToggleListViewMode}
      />

      {/* Folders Section */}
      {filteredFolders.length > 0 && (
        listViewMode === 'list' ? (
          <FolderList
            folders={filteredFolders}
            notes={allNotes}
            onSelectFolder={onSelectFolder}
            currentFolderId={currentFolderId}
            onNavigateUp={onNavigateUp}
            onDeleteFolder={onDeleteFolder}
            onRenameFolder={onRenameFolder}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredFolders.map((folder) => (
              <FolderCard
                key={folder.id}
                folder={folder}
                notes={allNotes}
                onSelectFolder={onSelectFolder}
                onDeleteFolder={onDeleteFolder}
                onRenameFolder={onRenameFolder}
              />
            ))}
          </div>
        )
      )}

      {selectedNoteIds.length > 0 && (
        <SelectionToolbar
          numSelected={selectedNoteIds.length}
          allNotesSelected={allNotesSelected}
          onSelectAll={onSelectAll}
          onBulkDeleteNotes={onBulkDeleteNotes}
          onMoveNotes={handleMoveNotes}
          canSelectAny={selectableNotes.length > 0}
        />
      )}
      
      {/* Notes Section */}
      {notesForList.length > 0 && (
        listViewMode === 'list' ? (
          <NoteList
            notes={notesForList}
            onSelectNote={onSelectNote}
            selectedNoteId={selectedNoteId}
            selectedNoteIds={selectedNoteIds}
            onToggleNoteSelection={onToggleNoteSelection}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {notesForList.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                onSelectNote={onSelectNote}
                selectedNoteId={selectedNoteId}
                selectedNoteIds={selectedNoteIds}
                onToggleNoteSelection={onToggleNoteSelection}
                profile={profile}
              />
            ))}
          </div>
        )
      )}

      {readmeNote && !isSearching && (
        <div
          className="mt-6"
          onClick={(e) => {
            // Prevent navigation if a link inside the preview is clicked
            if ((e.target as HTMLElement).closest('a')) {
              return;
            }
            onSelectNote(readmeNote);
          }}
        >
          <div className="cursor-pointer border rounded-lg p-4 hover:shadow-md transition-shadow" title="Click to open this note">
            <h3 className="text-lg font-semibold mb-2 text-muted-foreground">README Preview</h3>
            <NoteView 
              note={readmeNote}
              allNotes={allNotes}
              onSelectNote={onSelectNote}
            />
          </div>
        </div>
      )}

      <MoveNotesDialog
        open={moveDialogOpen}
        onOpenChange={setMoveDialogOpen}
        selectedCount={selectedNoteIds.length}
        folders={allFolders}
        currentFolderId={currentFolderId}
        onMoveToFolder={handleMoveToFolder}
      />
    </div>
  );
};
