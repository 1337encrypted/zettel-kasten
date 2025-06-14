
import React from 'react';
import { Folder, Note } from '@/types';
import { Button } from '@/components/ui/button';
import { FolderPlus, File } from 'lucide-react';
import FolderList from '@/components/FolderList';
import NoteList from '@/components/NoteList';

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
}) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button onClick={onNewNote} size="icon" title="Create New Note">
          <File />
        </Button>
        <Button onClick={onCreateFolder} variant="outline" size="icon" title="Create Folder">
          <FolderPlus />
        </Button>
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
    </div>
  );
};
