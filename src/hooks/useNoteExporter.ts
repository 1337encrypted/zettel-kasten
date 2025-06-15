
import { useCallback } from 'react';
import { Note, Folder } from '@/types';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { toast } from '@/components/ui/sonner';

export const useNoteExporter = (notes: Note[], folders: Folder[]) => {
  const handleExportAllNotes = useCallback(() => {
    if (notes.length === 0) {
      toast.info("There are no notes to export.");
      return;
    }

    const zip = new JSZip();

    const getFolderPath = (folderId: string | undefined | null, allFolders: Folder[]): string => {
      if (!folderId) {
        return '';
      }
      const folder = allFolders.find(f => f.id === folderId);
      if (!folder) {
        return '';
      }
      return getFolderPath(folder.parentId, allFolders) + folder.name.replace(/[\/\\?%*:|"<>]/g, '-') + '/';
    };

    notes.forEach(note => {
      const folderPath = getFolderPath(note.folderId, folders);
      const fileName = `${note.title.replace(/[\/\\?%*:|"<>]/g, '-')}.md`;
      const fileContent = `# ${note.title}\n\n${note.content}`;
      zip.file(folderPath + fileName, fileContent);
    });

    zip.generateAsync({ type: 'blob' })
      .then(content => {
        saveAs(content, 'Zet-Export.zip');
        toast.success("Notes exported successfully!");
      })
      .catch(err => {
        console.error("Failed to export notes:", err);
        toast.error("An error occurred while exporting notes.");
      });
  }, [notes, folders]);

  return { handleExportAllNotes };
};
