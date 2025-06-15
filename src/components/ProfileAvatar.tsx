
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/context/AuthContext";
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

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

export const ProfileAvatar = ({ uploading }: { uploading?: boolean }) => {
    const { user } = useAuth();

    const { data: profile } = useQuery({
        queryKey: ['userProfileAvatar', user?.id],
        queryFn: () => fetchProfile(user!.id),
        enabled: !!user,
    });

    if (!user) return null;

    const avatarUrl = profile?.avatar_url;
    const uniqueAvatarUrl = avatarUrl && profile?.updated_at ? `${avatarUrl}?t=${new Date(profile.updated_at).getTime()}` : avatarUrl;

    return (
        <Avatar>
            {uploading ? (
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
    );
};
