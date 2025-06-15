
import { useRef } from 'react';
import { toast } from '@/components/ui/sonner';
import { useNotes } from './useNotes';

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
