import React from 'react';
import { Folder, Note } from '@/types';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
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
    <Card className="cursor-pointer transition-all duration-200 hover:shadow-md group">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div 
            className="flex items-center gap-3 flex-1 min-w-0"
            onClick={() => onSelectFolder(folder.id)}
          >
            <FolderIcon className="text-primary h-5 w-5 shrink-0" />
            <CardTitle className="text-base font-medium truncate">
              {folder.name}
            </CardTitle>
          </div>
          <div className="flex items-center gap-2">
            {folder.isPublic && (
              <Badge variant="secondary" className="shrink-0 text-xs">
                Public
              </Badge>
            )}
            {!isPublicView && (
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0"
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
                      className="h-7 w-7 p-0 text-destructive hover:text-destructive"
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
      </CardHeader>
      
      <CardContent 
        className="pt-0 pb-3"
        onClick={() => onSelectFolder(folder.id)}
      >
        <div className="flex items-center justify-center py-8">
          <FolderIcon className="h-16 w-16 text-muted-foreground/30" />
        </div>
      </CardContent>
      
      <CardFooter 
        className="pt-0 pb-4 flex items-center justify-between"
        onClick={() => onSelectFolder(folder.id)}
      >
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <FileText className="h-4 w-4" />
          <span>
            {notesInFolderCount} {notesInFolderCount === 1 ? 'note' : 'notes'}
          </span>
        </div>
      </CardFooter>
    </Card>
  );
};