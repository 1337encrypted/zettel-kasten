import React, { useRef } from 'react';
import { Note } from '@/types';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { File, Calendar, User } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface NoteCardProps {
  note: Note;
  onSelectNote: (note: Note) => void;
  selectedNoteId?: string | null;
  selectedNoteIds: string[];
  onToggleNoteSelection: (noteId: string) => void;
  profile?: { username: string | null } | null;
}

export const NoteCard: React.FC<NoteCardProps> = ({
  note,
  onSelectNote,
  selectedNoteId,
  selectedNoteIds,
  onToggleNoteSelection,
  profile,
}) => {
  const longPressTimer = useRef<number>();
  const isLongPress = useRef(false);

  const handlePointerDown = () => {
    isLongPress.current = false;
    
    longPressTimer.current = window.setTimeout(() => {
      onToggleNoteSelection(note.id);
      isLongPress.current = true;
    }, 500);
  };

  const handlePointerUp = () => {
    clearTimeout(longPressTimer.current);
  };

  const handleClick = () => {
    if (isLongPress.current) {
      return;
    }
    
    if (selectedNoteIds.length > 0) {
      onToggleNoteSelection(note.id);
    } else {
      onSelectNote(note);
    }
  };

  const getContentPreview = (content: string) => {
    // Remove markdown syntax and get first 150 characters
    const plainText = content
      .replace(/^#{1,6}\s+/gm, '') // Remove headers
      .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
      .replace(/\*(.*?)\*/g, '$1') // Remove italic
      .replace(/`(.*?)`/g, '$1') // Remove inline code
      .replace(/\[(.*?)\]\(.*?\)/g, '$1') // Remove links, keep text
      .replace(/^\s*[-*+]\s+/gm, '') // Remove list markers
      .replace(/\n/g, ' ') // Replace newlines with spaces
      .trim();
    
    return plainText.length > 150 ? `${plainText.substring(0, 150)}...` : plainText;
  };

  const isSelected = selectedNoteIds.includes(note.id);
  const isFocused = note.id === selectedNoteId && selectedNoteIds.length === 0;

  return (
    <Card
      className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
        isSelected || isFocused ? 'ring-2 ring-primary/50 bg-primary/5' : ''
      }`}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      onClick={handleClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="w-5 h-5 shrink-0 flex items-center justify-center mt-0.5">
              {selectedNoteIds.length > 0 ? (
                <Checkbox
                  checked={isSelected}
                  aria-label={`Select note ${note.title}`}
                  className="pointer-events-none"
                />
              ) : (
                <File className="text-primary h-4 w-4" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-base font-medium truncate">
                {note.title}
              </CardTitle>
            </div>
          </div>
          {note.isPublic && (
            <Badge variant="secondary" className="shrink-0 text-xs">
              Public
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="pt-0 pb-3">
        <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
          {getContentPreview(note.content)}
        </p>
      </CardContent>
      
      <CardFooter className="pt-0 pb-4 flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-4">
          {profile?.username && (
            <div className="flex items-center gap-1">
              <User className="h-3 w-3" />
              <span>{profile.username}</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>
              {formatDistanceToNow(new Date(note.updatedAt), { addSuffix: true })}
            </span>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
};