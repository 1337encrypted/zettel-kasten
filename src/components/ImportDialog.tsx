
import React from 'react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

interface ImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImportFiles: () => void;
  onImportFolder: () => void;
}

export const ImportDialog: React.FC<ImportDialogProps> = ({ open, onOpenChange, onImportFiles, onImportFolder }) => {
  
  const handleImportFiles = () => {
    onImportFiles();
    onOpenChange(false);
  };

  const handleImportFolder = () => {
    onImportFolder();
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>What would you like to import?</AlertDialogTitle>
          <AlertDialogDescription>
            You can import individual markdown/text files, or an entire folder of notes.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="flex justify-center items-center gap-4 pt-4">
            <Button onClick={handleImportFiles}>Import File(s)</Button>
            <Button onClick={handleImportFolder}>Import Folder</Button>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
};

