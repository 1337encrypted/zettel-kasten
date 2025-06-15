
import React from 'react';
import { Folder, Note } from '@/types';
import FolderList from '@/components/FolderList';
import NoteList from '@/components/NoteList';
import NoteView from '@/components/NoteView';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { ArrowDownAZ, ArrowUpAZ, Search } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface UserPublicListViewProps {
  filteredFolders: Folder[];
  notesForList: Note[];
  allNotes: Note[];
  allFolders: Folder[];
  currentFolderId: string | null;
  onSelectFolder: (folder: Folder) => void;
  onSelectNote: (note: Note) => void;
  onNavigateUp: () => void;
  sortOrder: 'asc' | 'desc';
  onSortOrderChange: (order: 'asc' | 'desc') => void;
  searchQuery?: string;
  onSearchQueryChange: (query: string) => void;
}

const UserPublicListView: React.FC<UserPublicListViewProps> = ({
  filteredFolders,
  notesForList,
  allNotes,
  allFolders,
  currentFolderId,
  onSelectFolder,
  onSelectNote,
  onNavigateUp,
  sortOrder,
  onSortOrderChange,
  searchQuery,
  onSearchQueryChange,
}) => {
  const isMobile = useIsMobile();
  const currentSearchQuery = searchQuery ?? '';
  const isSearching = !!currentSearchQuery.trim();
  const readmeNote = !isSearching ? notesForList.find(note => note.title.toLowerCase() === 'readme') : null;
  const notesToDisplay = readmeNote ? notesForList.filter(n => n.id !== readmeNote.id) : notesForList;
  
  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
                type="text"
                placeholder={isMobile ? "Search" : "Search by title, content, or tags..."}
                value={currentSearchQuery}
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
      <div className="space-y-6">
        <FolderList
          folders={filteredFolders}
          notes={allNotes}
          currentFolderId={currentFolderId}
          onSelectFolder={(folderId) => {
            const folder = allFolders.find(f => f.id === folderId);
            if (folder) onSelectFolder(folder);
          }}
          onNavigateUp={onNavigateUp}
          onDeleteFolder={() => {}}
          onRenameFolder={() => {}}
          isPublicView={true}
        />
        <NoteList
          notes={notesToDisplay}
          onSelectNote={onSelectNote}
          selectedNoteIds={[]}
          onToggleNoteSelection={() => {}}
        />
        {filteredFolders.length === 0 && notesForList.length === 0 && (
          <></>
        )}
      </div>
      {readmeNote && (
        <div className="mt-8">
          <NoteView 
            note={readmeNote} 
            allNotes={allNotes} 
            onSelectNote={onSelectNote} 
          />
        </div>
      )}
    </div>
  );
};

export default UserPublicListView;
