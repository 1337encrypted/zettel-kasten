
import React from 'react';
import { Folder, Note } from '@/types';
import { Button } from '@/components/ui/button';
import { FolderPlus, File, FilePlus, ArrowUpAZ, ArrowDownAZ, Search } from 'lucide-react';
import FolderList from '@/components/FolderList';
import NoteList from '@/components/NoteList';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Input } from '@/components/ui/input';

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
  onDeleteNote: (noteId: string) => void;
  onDeleteFolder: (folderId: string) => void;
  sortOrder: 'asc' | 'desc';
  onSortOrderChange: (order: 'asc' | 'desc') => void;
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
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
  onDeleteNote,
  onDeleteFolder,
  sortOrder,
  onSortOrderChange,
  searchQuery,
  onSearchQueryChange,
}) => {
  const readmeNote = filteredNotes.find(note => note.title.toLowerCase() === 'readme');
  const isSearching = !!searchQuery.trim();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
                type="text"
                placeholder="Search notes by title or content..."
                value={searchQuery}
                onChange={(e) => onSearchQueryChange(e.target.value)}
                className="pl-10 w-full"
            />
        </div>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
              <Button onClick={onNewNote} variant="outline" size="icon" title="Create New Note">
                <FilePlus />
              </Button>
              <Button onClick={onCreateFolder} variant="outline" size="icon" title="Create Folder">
                <FolderPlus />
              </Button>
          </div>
          <ToggleGroup type="single" value={sortOrder} onValueChange={(value) => { if(value) onSortOrderChange(value as 'asc' | 'desc')}} aria-label="Sort notes" disabled={isSearching}>
              <ToggleGroupItem value="asc" aria-label="Sort ascending" title="Sort ascending (A-Z)">
                  <ArrowUpAZ className="h-4 w-4" />
              </ToggleGroupItem>
              <ToggleGroupItem value="desc" aria-label="Sort descending" title="Sort descending (Z-A)">
                  <ArrowDownAZ className="h-4 w-4" />
              </ToggleGroupItem>
          </ToggleGroup>
        </div>
      </div>
      <FolderList
        folders={filteredFolders}
        notes={allNotes}
        onSelectFolder={onSelectFolder}
        currentFolderId={currentFolderId}
        onNavigateUp={onNavigateUp}
        onDeleteFolder={onDeleteFolder}
      />
      <NoteList
        notes={filteredNotes}
        onSelectNote={onSelectNote}
        selectedNoteId={selectedNoteId}
        onDeleteNote={onDeleteNote}
      />
      {readmeNote && !isSearching && (
        <div className="mt-6 p-4 border rounded-lg prose dark:prose-invert max-w-none bg-card text-card-foreground shadow">
          <h2 className="font-bold text-lg mb-2 flex items-center gap-2 not-prose">
            <File className="w-5 h-5 inline-block" />
            README
          </h2>
          <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>
            {readmeNote.content}
          </ReactMarkdown>
        </div>
      )}
    </div>
  );
};
