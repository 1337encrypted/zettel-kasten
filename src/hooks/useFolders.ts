
import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Folder } from '@/types';
import { toast } from "@/components/ui/sonner";

export const useFolders = () => {
  const [folders, setFolders] = useState<Folder[]>(() => {
    try {
      const savedFolders = localStorage.getItem('zettelkasten-folders');
      return savedFolders ? JSON.parse(savedFolders).map((folder: any) => ({
        ...folder,
        createdAt: new Date(folder.createdAt),
      })) : [];
    } catch (error) {
      console.error("Failed to parse folders from localStorage", error);
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('zettelkasten-folders', JSON.stringify(folders));
  }, [folders]);

  const createFolder = (folderName: string, parentId: string | null) => {
    if (folderName && folderName.trim()) {
      const newFolder: Folder = {
        id: uuidv4(),
        name: folderName.trim(),
        createdAt: new Date(),
        parentId: parentId,
      };
      setFolders((prevFolders) => [newFolder, ...prevFolders]);
      toast.success(`Folder "${newFolder.name}" created!`);
    }
  };

  const deleteFolderAndDescendants = (folderId: string): string[] => {
    const folderToDelete = folders.find(f => f.id === folderId);
    if (!folderToDelete) return [];

    const allFolders = [...folders];
    const idsToDelete: string[] = [];
    const queue: string[] = [folderId];

    while(queue.length > 0) {
      const currentId = queue.shift()!;
      idsToDelete.push(currentId);
      const children = allFolders.filter(f => f.parentId === currentId);
      for (const child of children) {
        queue.push(child.id);
      }
    }
    
    setFolders(prevFolders => prevFolders.filter(f => !idsToDelete.includes(f.id)));
    toast.error(`Folder "${folderToDelete.name}" and its sub-folders deleted.`);
    return idsToDelete;
  };

  return { folders, createFolder, deleteFolderAndDescendants };
};
