
import { useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const updateAvatarUrl = async ({ userId, avatarUrl }: { userId: string, avatarUrl: string }) => {
    const { error } = await supabase
      .from('profiles')
      .update({ avatar_url: avatarUrl, updated_at: new Date().toISOString() })
      .eq('id', userId);
  
    if (error) {
      throw error;
    }
};

export const useAvatarHandler = () => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { user } = useAuth();
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: updateAvatarUrl,
        onSuccess: () => {
          toast.success("Avatar updated successfully!");
          queryClient.invalidateQueries({ queryKey: ['userProfile', user?.id] });
          queryClient.invalidateQueries({ queryKey: ['userProfileAvatar', user?.id] });
          queryClient.invalidateQueries({ queryKey: ['usersWithNoteCounts'] });
        },
        onError: (error: any) => {
          toast.error(`Failed to update avatar: ${error.message}`);
        },
    });

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (!user) {
            toast.error("You must be logged in to upload an avatar.");
            return;
        }
        const file = event.target.files?.[0];
        if (!file) return;

        const { data: files, error: listError } = await supabase.storage.from('avatars').list(user.id);
        if (listError) {
            console.error("Error listing old avatars:", listError);
        } else if (files && files.length > 0) {
            const oldAvatarPaths = files.map(f => `${user.id}/${f.name}`);
            const { error: removeError } = await supabase.storage.from('avatars').remove(oldAvatarPaths);
            if (removeError) {
                console.error("Error removing old avatars:", removeError);
                toast.warning("Could not remove old avatar, but uploaded new one.");
            }
        }

        try {
            const fileName = `${uuidv4()}.${file.name.split('.').pop()}`;
            const filePath = `${user.id}/${fileName}`;
            
            toast.info("Uploading avatar...");

            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file, {
                  upsert: true,
                });
            
            if (uploadError) {
                throw uploadError;
            }

            const { data } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath);
            
            const avatarUrl = data.publicUrl;

            mutation.mutate({ userId: user.id, avatarUrl });

        } catch (error: any) {
            toast.error(`Avatar upload failed: ${error.message}`);
        } finally {
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };

    return {
        fileInputRef,
        handleAvatarClick,
        handleAvatarUpload,
        isUploading: mutation.isPending,
    };
};
