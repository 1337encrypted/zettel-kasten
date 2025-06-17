
import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '@/context/AuthContext';

interface UserSearchResult {
  result_id: string;
  username: string | null;
  user_avatar_url: string | null;
  user_updated_at: string | null;
  note_count?: number;
  created_at?: string | null;
}

interface UserSearchResultCardProps {
  result: UserSearchResult;
}

export const UserSearchResultCard: React.FC<UserSearchResultCardProps> = ({ result }) => {
  const { user } = useAuth();
  
  // If the logged-in user is viewing their own profile, redirect to dashboard
  const isOwnProfile = user?.id === result.result_id;
  const linkTo = isOwnProfile ? '/dashboard' : `/u/${result.result_id}`;
  
  const uniqueAvatarUrl = result.user_avatar_url && result.user_updated_at 
    ? `${result.user_avatar_url}?t=${new Date(result.user_updated_at).getTime()}` 
    : result.user_avatar_url;

  return (
    <Link to={linkTo}>
      <Card className="hover:bg-muted/50 transition-colors w-full">
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Avatar>
              <AvatarImage src={uniqueAvatarUrl || undefined} alt={result.username || 'Anonymous'} />
              <AvatarFallback>
                {(result.username || 'A').charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-lg">
                {result.username || 'Anonymous'}
                {isOwnProfile && <span className="text-sm text-muted-foreground ml-2">(You)</span>}
              </p>
              {result.created_at && (
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  Joined {formatDistanceToNow(new Date(result.created_at), { addSuffix: true })}
                </p>
              )}
            </div>
          </div>
          {result.note_count !== undefined && (
            <div className="text-right">
              <p className="font-semibold text-lg">{result.note_count}</p>
              <p className="text-sm text-muted-foreground">{result.note_count === 1 ? 'note' : 'notes'}</p>
            </div>
          )}
        </div>
      </Card>
    </Link>
  );
};
