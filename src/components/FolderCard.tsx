import React from 'react';
import { Folder, Note } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Folder as FolderIcon, FileText, Trash2, Pencil } from 'lucide-react';
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

interface FolderCardProps {
  folder: Folder;
  notes: Note[];
  onSelectFolder: (folderId: string) => void;
  onDeleteFolder: (folderId: string) => void;
  onRenameFolder: (folderId: string) => void;
  isPublicView?: boolean;
}

export const FolderCard: React.FC<FolderCardProps> = ({
  folder,
  notes,
  onSelectFolder,
  onDeleteFolder,
  onRenameFolder,
  isPublicView = false,
}) => {
  const notesInFolderCount = notes.filter(note => note.folderId === folder.id).length;

  return (
    <Card 
      className="cursor-pointer transition-all duration-200 hover:shadow-md hover:bg-accent/50 group"
      onClick={() => onSelectFolder(folder.id)}
    >
      <CardContent className="p-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <FolderIcon className="text-primary h-4 w-4 shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm truncate">
                {folder.name}
              </div>
              <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                <FileText className="h-3 w-3" />
                <span>
                  {notesInFolderCount} {notesInFolderCount === 1 ? 'note' : 'notes'}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 shrink-0">
            {folder.isPublic && (
              <Badge variant="secondary" className="text-xs h-5 px-2">
                Public
              </Badge>
            )}
            {!isPublicView && (
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRenameFolder(folder.id);
                  }}
                  title={`Rename "${folder.name}"`}
                >
                  <Pencil className="h-3 w-3" />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Trash2 className="h-3 w-3" />
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
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};