
import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { Badge } from '@/components/ui/badge';

interface SearchResult {
    result_type: 'note';
    result_id: string;
    note_title: string | null;
    note_slug: string | null;
    note_updated_at: string | null;
    note_tags: string[] | null;
    note_author_id: string | null;
    note_author_username: string | null;
    note_author_avatar_url: string | null;
    note_author_updated_at: string | null;
}

interface NoteSearchResultCardProps {
  result: SearchResult;
}

export const NoteSearchResultCard: React.FC<NoteSearchResultCardProps> = ({ result }) => {
    if (!result.note_author_id || !result.note_slug) {
        return null;
    }
    const uniqueAvatarUrl = result.note_author_avatar_url && result.note_author_updated_at ? `${result.note_author_avatar_url}?t=${new Date(result.note_author_updated_at).getTime()}` : result.note_author_avatar_url;

    return (
        <Link to={`/u/${result.note_author_id}/notes/${result.note_slug}`} key={result.result_id}>
            <Card className="hover:bg-muted/50 transition-colors w-full">
                <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-lg">{result.note_title || 'Untitled Note'}</h3>
                        {result.note_updated_at && (
                            <p className="text-sm text-muted-foreground">
                                {formatDistanceToNow(new Date(result.note_updated_at), { addSuffix: true })}
                            </p>
                        )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                        <Avatar className="h-6 w-6">
                            <AvatarImage src={uniqueAvatarUrl || undefined} alt={result.note_author_username || 'Anonymous'} />
                            <AvatarFallback>
                                {(result.note_author_username || 'A').charAt(0).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <span>{result.note_author_username || 'Anonymous'}</span>
                    </div>
                    {result.note_tags && result.note_tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {result.note_tags.map(tag => (
                                <Badge key={tag} variant="secondary">{tag}</Badge>
                            ))}
                        </div>
                    )}
                </div>
            </Card>
        </Link>
    );
};
