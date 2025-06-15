
import React, { useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import { Note } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Tag, Link2 } from 'lucide-react';

interface NoteViewProps {
  note: Note | null;
  allNotes: Note[];
  onSelectNote: (note: Note) => void;
}

const NoteView: React.FC<NoteViewProps> = ({ note, allNotes, onSelectNote }) => {
  const notesBySlug = useMemo(() => {
    return allNotes.reduce((acc, note) => {
        if (note.slug) {
            acc[note.slug] = note;
        }
        return acc;
    }, {} as Record<string, Note>);
  }, [allNotes]);

  if (!note) {
    return (
      <div className="p-4 border rounded-lg shadow min-h-[200px] flex items-center justify-center">
        <p className="text-muted-foreground">Select a note to view its content, or create a new one.</p>
      </div>
    );
  }

  const customRenderers = {
    p: (paragraph: { children?: React.ReactNode; node?: any }) => {
      const childrenArray = React.Children.toArray(paragraph.children);
  
      const processedChildren = childrenArray.flatMap((child, i) => {
        if (typeof child === 'string') {
          const parts = child.split(/(\[\[[a-zA-Z0-9-]+\]\])/g);
          return parts.map((part, j) => {
            const match = /\[\[([a-zA-Z0-9-]+)\]\]/.exec(part);
            if (match) {
              const noteSlug = match[1];
              const linkedNote = notesBySlug[noteSlug];
              if (linkedNote) {
                return (
                  <a
                    key={`${i}-${j}`}
                    className="text-primary hover:underline cursor-pointer font-semibold inline-flex items-center gap-1"
                    onClick={(e) => {
                      e.preventDefault();
                      onSelectNote(linkedNote);
                    }}
                    href="#"
                  >
                    <Link2 className="w-4 h-4" />
                    {linkedNote.title}
                  </a>
                );
              } else {
                return (
                  <span key={`${i}-${j}`} className="text-destructive font-semibold">
                    [broken link]
                  </span>
                );
              }
            }
            return part;
          });
        }
        return child;
      });
  
      return <p>{processedChildren}</p>;
    },
  };

  return (
    <div className="p-4 border rounded-lg shadow prose dark:prose-invert max-w-none">
      <h1 className="text-3xl font-bold mb-4">{note.title}</h1>
      {note.tags && note.tags.length > 0 && (
        <div className="flex items-center gap-2 mb-4 not-prose">
          <Tag className="w-4 h-4 text-muted-foreground" />
          {note.tags.map((tag) => (
            <Badge key={tag} variant="secondary">{tag}</Badge>
          ))}
        </div>
      )}
      <ReactMarkdown 
        remarkPlugins={[remarkGfm, remarkBreaks]}
        components={customRenderers}
      >
        {note.content}
      </ReactMarkdown>
      <div className="mt-4 text-xs text-muted-foreground">
        <p>Created: {note.createdAt.toLocaleDateString()}</p>
        <p>Last Updated: {note.updatedAt.toLocaleDateString()}</p>
      </div>
    </div>
  );
};

export default NoteView;
