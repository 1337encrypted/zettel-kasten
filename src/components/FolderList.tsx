
import React from 'react';
import { Folder, Note } from '@/types';
import { Folder as FolderIcon } from 'lucide-react';

interface FolderListProps {
  folders: Folder[];
  notes: Note[];
  selectedFolderId: string | null | 'unassigned';
  onSelectFolder: (folderId: string | null | 'unassigned') => void;
}

const FolderList: React.FC<FolderListProps> = ({ folders, notes, selectedFolderId, onSelectFolder }) => {
  const notesInFolderCount = (folderId: string) => {
    return notes.filter(note => note.folderId === folderId).length;
  }
  
  const unassignedNotesCount = notes.filter(note => !note.folderId).length;

  return (
    <div className="font-mono border border-border p-4 rounded-lg bg-secondary/20">
      <h2 className="text-xl font-semibold mb-4 text-primary">~/</h2>
      <ul className="space-y-1">
        <li
            className={`p-2 rounded-md cursor-pointer transition-colors flex justify-between items-center group ${
              selectedFolderId === null ? 'bg-primary/20' : 'hover:bg-accent hover:text-accent-foreground'
            }`}
            onClick={() => onSelectFolder(null)}
        >
            <span className="font-medium flex items-center">
                <span className="text-primary mr-2">{`>`}</span>
                All Notes
            </span>
            <span className="text-sm text-muted-foreground">{notes.length}</span>
        </li>
        <li
            className={`p-2 rounded-md cursor-pointer transition-colors flex justify-between items-center group ${
              selectedFolderId === 'unassigned' ? 'bg-primary/20' : 'hover:bg-accent hover:text-accent-foreground'
            }`}
            onClick={() => onSelectFolder('unassigned')}
        >
            <span className="font-medium flex items-center">
                <span className="text-primary mr-2">{`>`}</span>
                Unassigned
            </span>
            <span className="text-sm text-muted-foreground">{unassignedNotesCount}</span>
        </li>

        {folders.map((folder) => (
          <li
            key={folder.id}
            className={`p-2 rounded-md cursor-pointer transition-colors flex justify-between items-center group ${
              folder.id === selectedFolderId ? 'bg-primary/20' : 'hover:bg-accent hover:text-accent-foreground'
            }`}
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
