
import React from 'react';
import { Folder, Note } from '@/types';
import { Button } from '@/components/ui/button';
import { FolderPlus, File, FilePlus, ArrowUpAZ, ArrowDownAZ, Search } from 'lucide-react';
import FolderList from '@/components/FolderList';
import NoteList from '@/components/NoteList';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import { Input } from '@/components/ui/input';
import { useIsMobile } from '@/hooks/use-mobile';

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
  const isMobile = useIsMobile();
  const readmeNote = filteredNotes.find(note => note.title.toLowerCase() === 'readme');
  const isSearching = !!searchQuery.trim();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
            <Button onClick={onNewNote} variant="outline" size="icon" title="Create New Note">
              <FilePlus />
            </Button>
            <Button onClick={onCreateFolder} variant="outline" size="icon" title="Create Folder">
              <FolderPlus />
            </Button>
        </div>
        <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
                type="text"
                placeholder={isMobile ? "Search" : "Search notes by title or content..."}
                value={searchQuery}
                onChange={(e) => onSearchQueryChange(e.target.value)}
                className="pl-10 w-full"
            />
        </div>
        <div className="flex items-center">
            <Button
              variant="outline"
              size="icon"
              onClick={() => onSortOrderChange(sortOrder === 'asc' ? 'desc' : 'asc')}
              disabled={isSearching}
              title={`Sort by title: ${sortOrder === 'asc' ? 'Ascending' : 'Descending'}. Click to toggle.`}
            >
              {sortOrder === 'asc' ? <ArrowUpAZ className="h-4 w-4" /> : <ArrowDownAZ className="h-4 w-4" />}
            </Button>
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
