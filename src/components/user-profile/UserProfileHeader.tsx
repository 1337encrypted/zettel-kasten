
import React from 'react';
import { Profile } from '@/types';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';

interface UserProfileHeaderProps {
  profile: Profile;
  isOwnProfile?: boolean;
}

const UserProfileHeader: React.FC<UserProfileHeaderProps> = ({ profile, isOwnProfile = false }) => {
  const handleGoToDashboard = () => {
    window.location.href = '/dashboard';
  };

  return (
    <div className="flex items-center justify-between mb-8">
      <div className="flex items-center gap-4">
        <Avatar className="h-16 w-16">
          <AvatarImage src={profile.avatar_url ? `${profile.avatar_url}?t=${new Date(profile.updated_at || Date.now()).getTime()}` : undefined} alt={profile.username || 'Anonymous'} />
          <AvatarFallback className="text-2xl">
              {(profile.username || 'A').charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-3xl font-bold">
            {isOwnProfile ? 'Your Zettels' : `Zettels by ${profile.username || 'Anonymous'}`}
          </h1>
          {isOwnProfile && (
            <p className="text-muted-foreground">Manage your notes and folders</p>
          )}
        </div>
      </div>
      
      {isOwnProfile && (
        <Button variant="outline" onClick={handleGoToDashboard} className="flex items-center gap-2">
          <Settings className="h-4 w-4" />
          Go to Dashboard
        </Button>
      )}
    </div>
  );
};

export default UserProfileHeader;
