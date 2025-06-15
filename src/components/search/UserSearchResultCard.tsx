
import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { User } from 'lucide-react';

interface SearchResult {
    result_type: 'user';
    result_id: string;
    username: string | null;
    user_avatar_url: string | null;
    user_updated_at: string | null;
}

interface UserSearchResultCardProps {
  result: SearchResult;
}

export const UserSearchResultCard: React.FC<UserSearchResultCardProps> = ({ result }) => {
    const uniqueAvatarUrl = result.user_avatar_url && result.user_updated_at ? `${result.user_avatar_url}?t=${new Date(result.user_updated_at).getTime()}` : result.user_avatar_url;
    return (
        <Link to={`/u/${result.result_id}`} key={result.result_id}>
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
                            <p className="font-semibold text-lg">{result.username || 'Anonymous'}</p>
                            <p className="text-sm text-muted-foreground flex items-center gap-1">
                                <User className="h-4 w-4" />
                                User Profile
                            </p>
                        </div>
                    </div>
                </div>
            </Card>
        </Link>
    );
};
