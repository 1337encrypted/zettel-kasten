
import React from 'react';
import { Folder, Note } from '@/types';
import FolderList from '@/components/FolderList';
import NoteList from '@/components/NoteList';
import { ListViewHeader } from './ListViewHeader';
import { SelectionToolbar } from './SelectionToolbar';
import { ReadmeDisplay } from './ReadmeDisplay';
import { useCustomRenderers } from '@/hooks/useCustomRenderers';

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
}) => {
  const readmeNote = filteredNotes.find(note => note.title.toLowerCase() === 'readme');
  const isSearching = !!searchQuery.trim();

  const selectableNotes = filteredNotes.filter(n => n.title.toLowerCase() !== 'readme');
  const allNotesSelected = selectableNotes.length > 0 && selectedNoteIds.length === selectableNotes.length;

  const customRenderers = useCustomRenderers(allNotes, onSelectNote);

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
        notes={filteredNotes}
        onSelectNote={onSelectNote}
        selectedNoteId={selectedNoteId}
        selectedNoteIds={selectedNoteIds}
        onToggleNoteSelection={onToggleNoteSelection}
      />
      
      {readmeNote && !isSearching && (
        <ReadmeDisplay
          readmeNote={readmeNote}
          onSelectNote={onSelectNote}
          customRenderers={customRenderers}
        />
      )}
    </div>
  );
};
