import { useRef } from 'react';
import { toast } from 'sonner';
import { useNotes } from './useNotes';
import { useFolders } from './useFolders';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { Folder } from '@/types';

export const useFileImporter = () => {
  const { saveNote } = useNotes();
  const importFileInputRef = useRef<HTMLInputElement>(null);

  const handleFileImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) {
      return;
    }

    toast.info(`Attempting to import ${files.length} file(s)...`);

    const promises = Array.from(files).map(async (file) => {
      try {
        if (!file.name.endsWith('.md') && !file.name.endsWith('.txt')) {
            toast.warning(`Skipping ${file.name}: unsupported file type. Only .md and .txt are supported.`);
            return;
        }
        const content = await file.text();
        const title = file.name.replace(/\.(md|txt)$/, "");
        await saveNote({ title, content, tags: ['imported'] });
      } catch (error) {
        console.error(`Failed to import ${file.name}:`, error);
        // The useSaveNote hook will show an error toast
      }
    });
    
    await Promise.all(promises);

    if (importFileInputRef.current) {
      importFileInputRef.current.value = '';
    }
  };

  const triggerImport = () => {
    importFileInputRef.current?.click();
  };

  return { importFileInputRef, triggerImport, handleFileImport };
};

export const useFolderImporter = ({ currentFolderId }: { currentFolderId: string | null }) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { saveNote } = useNotes();
  const { folders, createFolderAsync } = useFolders();
  const importFolderInputRef = useRef<HTMLInputElement>(null);

  const handleFolderImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || !user || !createFolderAsync) {
      toast.error('Could not prepare for folder import. Please try again.');
      return;
    }

    toast.info('Starting folder import. This may take a moment...');
    
    const fileArray = Array.from(files);
    const allFolderPaths = new Set<string>();

    fileArray.forEach(file => {
      if (file.webkitRelativePath) {
        const pathSegments = file.webkitRelativePath.split('/').slice(0, -1);
        for (let i = 0; i < pathSegments.length; i++) {
          allFolderPaths.add(pathSegments.slice(0, i + 1).join('/'));
        }
      }
    });

    const sortedFolderPaths = Array.from(allFolderPaths).sort((a, b) => a.split('/').length - b.split('/').length);
    const folderPathToIdMap = new Map<string, string>();
    let currentFolders: Folder[] = [...folders];

    for (const path of sortedFolderPaths) {
      const pathSegments = path.split('/');
      const folderName = pathSegments[pathSegments.length - 1];
      const parentPath = pathSegments.slice(0, -1).join('/');
      const parentId = parentPath ? folderPathToIdMap.get(parentPath) : currentFolderId;

      if (parentPath && !folderPathToIdMap.has(parentPath)) {
        console.error(`Could not find parent folder ${parentPath} for ${path}. Skipping.`);
        continue;
      }
      
      let existingFolder = currentFolders.find(f => f.name === folderName && f.parentId === (parentId ?? null));

      if (existingFolder) {
        folderPathToIdMap.set(path, existingFolder.id);
      } else {
        try {
          const newFolder = await createFolderAsync({ folderName, parentId: parentId ?? null });
          if (newFolder) {
            folderPathToIdMap.set(path, newFolder.id);
            currentFolders.push(newFolder);
          } else {
            throw new Error(`Folder creation for "${folderName}" did not return a folder object.`);
          }
        } catch (error) {
          toast.error(`Failed to create folder: ${folderName}`);
          console.error(error);
        }
      }
    }

    for (const file of fileArray) {
      if (!file.webkitRelativePath || (!file.name.endsWith('.md') && !file.name.endsWith('.txt'))) continue;
      
      const parentPath = file.webkitRelativePath.split('/').slice(0, -1).join('/');
      const folderId = parentPath ? folderPathToIdMap.get(parentPath) : currentFolderId;
      
      const title = file.name.replace(/\.(md|txt)$/, "");
      const content = await file.text();
      await saveNote({ title, content, folderId: folderId ?? null, tags: ['imported'] });
    }

    toast.success("Folder import completed successfully!");
    if (importFolderInputRef.current) {
        importFolderInputRef.current.value = '';
    }
    queryClient.invalidateQueries({ queryKey: ['folders', user.id] });
    queryClient.invalidateQueries({ queryKey: ['notes', user.id] });
  };

  const triggerImport = () => {
    importFolderInputRef.current?.click();
  };

  return { importFolderInputRef, triggerImport, handleFolderImport };
};
