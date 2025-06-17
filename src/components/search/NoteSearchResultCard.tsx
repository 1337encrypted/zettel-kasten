
import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Clock, FileText } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '@/context/AuthContext';

interface NoteSearchResult {
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
  result: NoteSearchResult;
}

export const NoteSearchResultCard: React.FC<NoteSearchResultCardProps> = ({ result }) => {
  const { user } = useAuth();
  
  // If the logged-in user is viewing their own note, redirect to dashboard with the note
  const isOwnNote = user?.id === result.note_author_id;
  const linkTo = isOwnNote 
    ? `/dashboard/${result.note_slug || result.result_id}` 
    : `/u/${result.note_author_id}/${result.note_slug || result.result_id}`;
  
  const uniqueAvatarUrl = result.note_author_avatar_url && result.note_author_updated_at 
    ? `${result.note_author_avatar_url}?t=${new Date(result.note_author_updated_at).getTime()}` 
    : result.note_author_avatar_url;

  return (
    <Link to={linkTo}>
      <Card className="hover:bg-muted/50 transition-colors w-full">
        <div className="p-4">
          <div className="flex items-start gap-4">
            <FileText className="h-5 w-5 text-muted-foreground mt-1 flex-shrink-0" />
            <div className="flex-grow min-w-0">
              <h3 className="font-semibold text-lg truncate">
                {result.note_title || 'Untitled'}
                {isOwnNote && <span className="text-sm text-muted-foreground ml-2">(Your note)</span>}
              </h3>
              <div className="flex items-center gap-2 mt-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={uniqueAvatarUrl || undefined} alt={result.note_author_username || 'Anonymous'} />
                  <AvatarFallback className="text-xs">
                    {(result.note_author_username || 'A').charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm text-muted-foreground">
                  by {result.note_author_username || 'Anonymous'}
                </span>
                {result.note_updated_at && (
                  <>
                    <span className="text-sm text-muted-foreground">•</span>
                    <span className="text-sm text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDistanceToNow(new Date(result.note_updated_at), { addSuffix: true })}
                    </span>
                  </>
                )}
              </div>
              {result.note_tags && result.note_tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {result.note_tags.slice(0, 3).map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {result.note_tags.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{result.note_tags.length - 3} more
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
};
