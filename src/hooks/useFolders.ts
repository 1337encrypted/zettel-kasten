
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

  return { folders, createFolder };
};
