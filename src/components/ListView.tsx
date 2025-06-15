import React from 'react';
import { Folder, Note } from '@/types';
import FolderList from '@/components/FolderList';
import NoteList from '@/components/NoteList';
import { ListViewHeader } from './ListViewHeader';
import { SelectionToolbar } from './SelectionToolbar';
import NoteView from './NoteView';

interface ListViewProps {
  filteredFolders: Folder[];
  filteredNotes: Note[];
  allNotes: Note[];
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
  readmeNote?: Note;
}

export const ListView: React.FC<ListViewProps> = ({
  filteredFolders,
  filteredNotes,
  allNotes,
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
  readmeNote,
}) => {
  const isSearching = !!searchQuery.trim();

  // The README note should appear in the list like any other note.
  const notesForList = filteredNotes; 

  const selectableNotes = notesForList;
  const allNotesSelected = selectableNotes.length > 0 && selectedNoteIds.length === selectableNotes.length;

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
      />

      <FolderList
        folders={filteredFolders}
        notes={allNotes}
        onSelectFolder={onSelectFolder}
        currentFolderId={currentFolderId}
        onNavigateUp={onNavigateUp}
        onDeleteFolder={onDeleteFolder}
        onRenameFolder={onRenameFolder}
      />

      {selectedNoteIds.length > 0 && (
        <SelectionToolbar
          numSelected={selectedNoteIds.length}
          allNotesSelected={allNotesSelected}
          onSelectAll={onSelectAll}
          onBulkDeleteNotes={onBulkDeleteNotes}
          canSelectAny={selectableNotes.length > 0}
        />
      )}
      
      <NoteList
        notes={notesForList}
        onSelectNote={onSelectNote}
        selectedNoteId={selectedNoteId}
        selectedNoteIds={selectedNoteIds}
        onToggleNoteSelection={onToggleNoteSelection}
      />

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
    </div>
  );
};
