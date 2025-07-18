
import React from 'react';
import { Folder, Note } from '@/types';
import { Folder as FolderIcon, Trash2, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface FolderListProps {
  folders: Folder[];
  notes: Note[];
  currentFolderId: string | null;
  onSelectFolder: (folderId: string) => void;
  onNavigateUp: () => void;
  onDeleteFolder: (folderId: string) => void;
  onRenameFolder: (folderId: string) => void;
  isPublicView?: boolean;
}

const FolderList: React.FC<FolderListProps> = ({ folders, notes, currentFolderId, onSelectFolder, onNavigateUp, onDeleteFolder, onRenameFolder, isPublicView = false }) => {
  const notesInFolderCount = (folderId: string) => {
    return notes.filter(note => note.folderId === folderId).length;
  }

  if (folders.length === 0) {
    return null;
  }

  return (
    <div className="font-mono border border-border p-4 rounded-lg bg-secondary/20">
      <ul className="space-y-1">
        {folders.map((folder) => (
          <li
            key={folder.id}
            className={`p-2 rounded-md transition-colors flex justify-between items-center group hover:bg-accent hover:text-accent-foreground`}
          >
            <div
              className="font-medium flex items-center flex-grow cursor-pointer"
              onClick={() => onSelectFolder(folder.id)}
            >
              <FolderIcon className="text-primary mr-2 h-4 w-4" />
              {folder.name}
            </div>
            <span className="text-sm text-muted-foreground mr-2">{notesInFolderCount(folder.id)}</span>
            {!isPublicView && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity h-8 w-8"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRenameFolder(folder.id);
                  }}
                  title={`Rename "${folder.name}"`}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity h-8 w-8 text-destructive"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the "{folder.name}" folder and all its contents, including sub-folders and notes.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel onClick={(e) => e.stopPropagation()}>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteFolder(folder.id);
                        }}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FolderList;
