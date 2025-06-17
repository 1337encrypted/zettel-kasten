
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Folder, FolderIcon, Home } from 'lucide-react';
import { Folder as FolderType } from '@/types';

interface MoveNotesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedCount: number;
  folders: FolderType[];
  currentFolderId: string | null;
  onMoveToFolder: (folderId: string | null) => void;
}

export const MoveNotesDialog: React.FC<MoveNotesDialogProps> = ({
  open,
  onOpenChange,
  selectedCount,
  folders,
  currentFolderId,
  onMoveToFolder,
}) => {
  const availableFolders = folders.filter(folder => folder.id !== currentFolderId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Move {selectedCount} note(s)</DialogTitle>
          <DialogDescription>
            Choose where to move the selected notes.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 max-h-60 overflow-y-auto">
          {currentFolderId && (
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => onMoveToFolder(null)}
            >
              <Home className="mr-2 h-4 w-4" />
              Move to Root
            </Button>
          )}
          
          {availableFolders.map((folder) => (
            <Button
              key={folder.id}
              variant="ghost"
              className="w-full justify-start"
              onClick={() => onMoveToFolder(folder.id)}
            >
              <FolderIcon className="mr-2 h-4 w-4" />
              {folder.name}
            </Button>
          ))}
        </div>

        {availableFolders.length === 0 && !currentFolderId && (
          <p className="text-sm text-muted-foreground text-center py-4">
            No folders available
          </p>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
