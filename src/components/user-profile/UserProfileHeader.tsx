
import React from 'react';
import { Profile } from '@/types';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

interface UserProfileHeaderProps {
  profile: Profile;
}

const UserProfileHeader: React.FC<UserProfileHeaderProps> = ({ profile }) => {
  return (
    <div className="flex items-center gap-4 mb-8">
      <Avatar className="h-16 w-16">
        <AvatarImage src={profile.avatar_url ? `${profile.avatar_url}?t=${new Date(profile.updated_at || Date.now()).getTime()}` : undefined} alt={profile.username || 'Anonymous'} />
        <AvatarFallback className="text-2xl">
            {(profile.username || 'A').charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <h1 className="text-3xl font-bold">Notes by {profile.username || 'Anonymous'}</h1>
    </div>
  );
};

export default UserProfileHeader;
