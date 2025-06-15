
import React, { useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import rehypeRaw from 'rehype-raw';
import { Note } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Tag, Link2, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface NoteViewProps {
  note: Note | null;
  allNotes: Note[];
  onSelectNote: (note: Note) => void;
}

const NoteView: React.FC<NoteViewProps> = ({ note, allNotes, onSelectNote }) => {
  const notesByTitle = useMemo(() => {
    return allNotes.reduce((acc, note) => {
        if (note.title) {
            const normalizedTitle = note.title.trim().toLowerCase();
            if (!acc[normalizedTitle]) { // Take the first one if there are duplicates
                acc[normalizedTitle] = note;
            }
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
          const parts = child.split(/(\[\[.+?\]\])/g);
          return parts.map((part, j) => {
            const match = /\[\[(.+?)\]\]/.exec(part);
            if (match) {
              const noteTitle = match[1];
              const normalizedTitle = noteTitle.trim().toLowerCase();
              const linkedNote = notesByTitle[normalizedTitle];
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
                  <span key={`${i}-${j}`} className="text-muted-foreground italic">
                    {`[[${noteTitle}]]`}
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
    pre: ({ children }: { children?: React.ReactNode }) => {
      if (!children || !React.isValidElement(children)) {
        return <pre>{children}</pre>;
      }
      
      const codeString = String(children.props.children).replace(/\n$/, '');

      const handleCopy = () => {
        navigator.clipboard.writeText(codeString)
          .then(() => {
            toast.success("Code copied to clipboard!");
          })
          .catch(err => {
            toast.error("Failed to copy code.");
            console.error('Failed to copy text: ', err);
          });
      };

      return (
        <div className="relative group">
          <pre>{children}</pre>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            className="absolute top-2 right-2 h-auto px-2 py-1.5 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Copy code"
          >
            <Copy className="h-3 w-3 mr-1" />
            Copy
          </Button>
        </div>
      );
    },
    a: (props: React.ComponentPropsWithoutRef<'a'>) => {
      const { href, children } = props;

      if (href && href.startsWith('#')) {
        const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
          e.preventDefault();
          const id = href.substring(1);
          const element = document.getElementById(id);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        };
        return <a href={href} onClick={handleClick}>{children}</a>;
      }

      // For external links, open in a new tab.
      if (href && (href.startsWith('http://') || href.startsWith('https://'))) {
        return <a href={href} target="_blank" rel="noopener noreferrer">{children}</a>;
      }

      return <a {...props}>{children}</a>;
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
        rehypePlugins={[rehypeRaw]}
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
