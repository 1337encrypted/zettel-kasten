
import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import rehypeRaw from 'rehype-raw';
import { Note } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Tag, Copy, AlertTriangle, Info, Lightbulb, CircleHelp, OctagonX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useCustomRenderers } from '@/hooks/useCustomRenderers';
import MermaidDiagram from './MermaidDiagram';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface NoteViewProps {
  note: Note | null;
  allNotes: Note[];
  onSelectNote: (note: Note) => void;
}

const NoteView: React.FC<NoteViewProps> = ({ note, allNotes, onSelectNote }) => {
  const customLinkRenderer = useCustomRenderers(allNotes, onSelectNote);

  if (!note) {
    return (
      <div className="p-4 border rounded-lg shadow min-h-[200px] flex items-center justify-center">
        <p className="text-muted-foreground">Select a note to view its content, or create a new one.</p>
      </div>
    );
  }

  const customRenderers = {
    ...customLinkRenderer,
    blockquote: (props: React.ComponentPropsWithoutRef<'blockquote'>) => {
      // The `node` prop is not part of the official API but is passed by react-markdown
      const { node, children, ...rest } = props as any;

      if (!node?.children?.[0]?.children?.[0]?.value) {
        return <blockquote className="pl-4 my-4 border-l-4" {...rest}>{children}</blockquote>;
      }

      const textValue = node.children[0].children[0].value as string;
      const match = textValue.match(/^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\s*/);

      if (!match) {
        return <blockquote className="pl-4 my-4 border-l-4" {...rest}>{children}</blockquote>;
      }
      
      const type = match[1].toLowerCase();
      const title = match[1].charAt(0).toUpperCase() + match[1].slice(1);

      let variant: 'default' | 'destructive' = 'default';
      let icon: React.ReactNode;
      let extraClasses = '';

      switch (type) {
        case 'note':
          icon = <CircleHelp className="h-5 w-5" />;
          extraClasses = 'bg-blue-50 border-blue-200 text-blue-900 dark:bg-blue-950 dark:border-blue-800 dark:text-blue-50 [&>svg]:text-blue-500 dark:[&>svg]:text-blue-400';
          break;
        case 'tip':
          icon = <Lightbulb className="h-5 w-5" />;
          extraClasses = 'bg-green-50 border-green-200 text-green-900 dark:bg-green-950 dark:border-green-800 dark:text-green-50 [&>svg]:text-green-500 dark:[&>svg]:text-green-400';
          break;
        case 'important':
          icon = <Info className="h-5 w-5" />;
          extraClasses = 'bg-purple-50 border-purple-200 text-purple-900 dark:bg-purple-950 dark:border-purple-800 dark:text-purple-50 [&>svg]:text-purple-500 dark:[&>svg]:text-purple-400';
          break;
        case 'warning':
          icon = <AlertTriangle className="h-5 w-5" />;
          extraClasses = 'bg-yellow-50 border-yellow-200 text-yellow-900 dark:bg-yellow-950 dark:border-yellow-800 dark:text-yellow-50 [&>svg]:text-yellow-500 dark:[&>svg]:text-yellow-400';
          break;
        case 'caution':
          variant = 'destructive';
          icon = <OctagonX className="h-5 w-5" />;
          extraClasses = 'border-red-200 text-red-900 bg-red-50 dark:border-red-800 dark:text-red-50 dark:bg-red-950 [&>svg]:text-red-500 dark:[&>svg]:text-red-400';
          break;
        default:
          return <blockquote className="pl-4 my-4 border-l-4" {...rest}>{children}</blockquote>;
      }
      
      const originalChildren = React.Children.toArray(children);
      const firstPara = originalChildren[0] as React.ReactElement;
      
      const paraChildren = React.Children.toArray(firstPara.props.children);

      let newParaChildren;
      const firstChildOfPara = paraChildren[0];

      if (typeof firstChildOfPara === 'string') {
        const newText = firstChildOfPara.substring(match[0].length);
        newParaChildren = [newText, ...paraChildren.slice(1)];
      } else if (React.isValidElement(firstChildOfPara) && typeof firstChildOfPara.props.children === 'string') {
        const newText = (firstChildOfPara.props.children as string).substring(match[0].length);
        const newChild = React.cloneElement(firstChildOfPara, { children: newText });
        newParaChildren = [newChild, ...paraChildren.slice(1)];
      } else {
        return <blockquote className="pl-4 my-4 border-l-4" {...rest}>{children}</blockquote>;
      }

      const newFirstPara = React.cloneElement(firstPara, { children: newParaChildren });
      const newChildren = [newFirstPara, ...originalChildren.slice(1)];
      
      return (
        <Alert variant={variant} className={`my-4 not-prose ${extraClasses}`}>
          {icon}
          <AlertTitle className="font-bold">{title}</AlertTitle>
          <AlertDescription asChild>
            <div>{newChildren}</div>
          </AlertDescription>
        </Alert>
      );
    },
    pre: ({ children }: { children?: React.ReactNode }) => {
      if (!children || !React.isValidElement(children)) {
        return <pre>{children}</pre>;
      }
      
      const codeProps = children.props as { className?: string; children?: React.ReactNode };
      const language = codeProps.className?.replace('language-', '');
      const codeString = String(codeProps.children).replace(/\n$/, '');

      if (language === 'mermaid') {
        return <MermaidDiagram chart={codeString} />;
      }

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
    img: (props: React.ComponentPropsWithoutRef<'img'>) => {
      return <img {...props} className="max-w-full h-auto rounded-md border" alt={props.alt || ''} />;
    }
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
