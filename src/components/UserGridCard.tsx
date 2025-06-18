
import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/context/AuthContext';

interface UserProfile {
  id: string;
  username: string | null;
  note_count: number;
  created_at: string | null;
  avatar_url: string | null;
  updated_at: string | null;
}

interface UserGridCardProps {
  userProfile: UserProfile;
  isOnline: boolean;
}

export const UserGridCard: React.FC<UserGridCardProps> = ({ userProfile, isOnline }) => {
  const { user } = useAuth();
  const uniqueAvatarUrl = userProfile.avatar_url && userProfile.updated_at 
    ? `${userProfile.avatar_url}?t=${new Date(userProfile.updated_at).getTime()}` 
    : userProfile.avatar_url;
  const isOwnProfile = user?.id === userProfile.id;
  const linkTo = isOwnProfile ? '/dashboard' : `/u/${userProfile.id}`;

  return (
    <Link to={linkTo}>
      <Card className="hover:bg-muted/50 transition-colors p-4 h-full">
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="relative">
            <Avatar className="h-16 w-16">
              <AvatarImage src={uniqueAvatarUrl || undefined} alt={userProfile.username || 'Anonymous'} />
              <AvatarFallback className="text-xl">
                {(userProfile.username || 'A').charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            {isOnline && (
              <div className="absolute -top-1 -right-1 h-5 w-5 bg-green-500 border-2 border-background rounded-full"></div>
            )}
          </div>
          <div className="space-y-1">
            <p className="font-semibold text-lg truncate w-full">
              {userProfile.username || 'Anonymous'}
              {isOwnProfile && <span className="text-xs text-muted-foreground block">(You)</span>}
            </p>
            <p className="text-sm text-muted-foreground">
              {userProfile.note_count} {userProfile.note_count === 1 ? 'note' : 'notes'}
            </p>
          </div>
        </div>
      </Card>
    </Link>
  );
};
