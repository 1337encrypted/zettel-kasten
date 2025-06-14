
import React from 'react';
import { Folder, Note } from '@/types';
import { Folder as FolderIcon } from 'lucide-react';

interface FolderListProps {
  folders: Folder[];
  notes: Note[];
  currentFolderId: string | null;
  onSelectFolder: (folderId: string) => void;
  onNavigateUp: () => void;
}

const FolderList: React.FC<FolderListProps> = ({ folders, notes, currentFolderId, onSelectFolder, onNavigateUp }) => {
  const notesInFolderCount = (folderId: string) => {
    return notes.filter(note => note.folderId === folderId).length;
  }

  return (
    <div className="font-mono border border-border p-4 rounded-lg bg-secondary/20">
      <h2 className="text-xl font-semibold mb-4 text-primary">~/</h2>
      <ul className="space-y-1">
        {currentFolderId && (
          <li
            className={`p-2 rounded-md cursor-pointer transition-colors flex justify-between items-center group hover:bg-accent hover:text-accent-foreground`}
            onClick={onNavigateUp}
          >
            <span className="font-medium flex items-center">
              <span className="text-primary mr-2">{`>`}</span>
              ..
            </span>
          </li>
        )}

        {folders.map((folder) => (
          <li
            key={folder.id}
            className={`p-2 rounded-md cursor-pointer transition-colors flex justify-between items-center group hover:bg-accent hover:text-accent-foreground`}
            onClick={() => onSelectFolder(folder.id)}
          >
            <span className="font-medium flex items-center">
              <FolderIcon className="text-primary mr-2 h-4 w-4" />
              {folder.name}
            </span>
            <span className="text-sm text-muted-foreground">{notesInFolderCount(folder.id)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FolderList;
