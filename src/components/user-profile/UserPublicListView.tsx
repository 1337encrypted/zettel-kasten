
import React from 'react';
import { Folder, Note } from '@/types';
import FolderList from '@/components/FolderList';
import NoteList from '@/components/NoteList';
import NoteView from '@/components/NoteView';

interface UserPublicListViewProps {
  filteredFolders: Folder[];
  notesForList: Note[];
  allNotes: Note[];
  allFolders: Folder[];
  currentFolderId: string | null;
  readmeNote: Note | null;
  onSelectFolder: (folder: Folder) => void;
  onSelectNote: (note: Note) => void;
  onNavigateUp: () => void;
}

const UserPublicListView: React.FC<UserPublicListViewProps> = ({
  filteredFolders,
  notesForList,
  allNotes,
  allFolders,
  currentFolderId,
  readmeNote,
  onSelectFolder,
  onSelectNote,
  onNavigateUp,
}) => {
  return (
    <div>
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
          notes={notesForList}
          onSelectNote={onSelectNote}
          selectedNoteIds={[]}
          onToggleNoteSelection={() => {}}
        />
        {filteredFolders.length === 0 && notesForList.length === 0 && (
          <div className="text-center text-muted-foreground pt-8">
            <p className="font-mono text-lg"># Empty</p>
            <p>This folder is empty.</p>
          </div>
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
