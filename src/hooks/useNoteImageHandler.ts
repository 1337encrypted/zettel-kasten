
import { useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';

interface UseNoteImageHandlerProps {
  content: string;
  setContent: (content: string) => void;
  textareaRef: React.RefObject<HTMLTextAreaElement>;
}

export const useNoteImageHandler = ({ content, setContent, textareaRef }: UseNoteImageHandlerProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();

  const handleAddImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!user) {
      toast.error("You must be logged in to upload an image.");
      return;
    }
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const fileName = `${uuidv4()}.${file.name.split('.').pop()}`;
      const filePath = `${user.id}/${fileName}`;
      
      toast.info("Uploading image...");

      const { error: uploadError } = await supabase.storage
        .from('note-images')
        .upload(filePath, file);
      
      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage
        .from('note-images')
        .getPublicUrl(filePath);
      
      const imageUrl = data.publicUrl;

      if (textareaRef.current) {
        const { selectionStart, selectionEnd } = textareaRef.current;
        const imageMarkdown = `\n![${file.name}](${imageUrl})\n`;
        
        const newContent = 
          content.substring(0, selectionStart) + 
          imageMarkdown + 
          content.substring(selectionEnd);
        
        setContent(newContent);
  
        setTimeout(() => {
          if (textareaRef.current) {
            const newCursorPosition = selectionStart + imageMarkdown.length;
            textareaRef.current.focus();
            textareaRef.current.setSelectionRange(newCursorPosition, newCursorPosition);
          }
        }, 0);
      }
      toast.success("Image uploaded and inserted!");
    } catch (error: any) {
      toast.error(`Image upload failed: ${error.message}`);
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return {
    fileInputRef,
    handleAddImageClick,
    handleImageUpload,
  };
};
