
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/context/AuthContext";
import { useAvatarHandler } from "@/hooks/useAvatarHandler";
import { Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";

const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
        .from('profiles')
        .select('avatar_url, username, updated_at')
        .eq('id', userId)
        .single();
    if (error && error.code !== 'PGRST116') {
        throw new Error(error.message);
    }
    return data;
};

export const ProfileAvatar = () => {
    const { user } = useAuth();
    const { fileInputRef, handleAvatarClick, handleAvatarUpload, isUploading } = useAvatarHandler();

    const { data: profile } = useQuery({
        queryKey: ['userProfileAvatar', user?.id],
        queryFn: () => fetchProfile(user!.id),
        enabled: !!user,
    });

    if (!user) return null;

    const avatarUrl = profile?.avatar_url;
    const uniqueAvatarUrl = avatarUrl && profile?.updated_at ? `${avatarUrl}?t=${new Date(profile.updated_at).getTime()}` : avatarUrl;

    return (
        <>
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleAvatarUpload}
                className="hidden"
                accept="image/png, image/jpeg, image/gif"
            />
            <Tooltip>
                <TooltipTrigger asChild>
                    <button onClick={handleAvatarClick} disabled={isUploading} className="rounded-full flex items-center justify-center">
                        <Avatar>
                            {isUploading ? (
                                <AvatarFallback>
                                    <Loader2 className="animate-spin" />
                                </AvatarFallback>
                            ) : (
                                <>
                                    <AvatarImage src={uniqueAvatarUrl || undefined} alt={profile?.username || user.email || ''} />
                                    <AvatarFallback>
                                        {(profile?.username || user.email)?.charAt(0).toUpperCase()}
                                    </AvatarFallback>
                                </>
                            )}
                        </Avatar>
                    </button>
                </TooltipTrigger>
                <TooltipContent>
                    <p>Click to change avatar</p>
                </TooltipContent>
            </Tooltip>
        </>
    );
};
