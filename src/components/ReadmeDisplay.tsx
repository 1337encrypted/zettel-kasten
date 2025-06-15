
import React from 'react';
import { Note } from '@/types';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import rehypeRaw from 'rehype-raw';
import { File } from 'lucide-react';

interface ReadmeDisplayProps {
  readmeNote: Note;
  onSelectNote: (note: Note) => void;
  customRenderers: any;
}

export const ReadmeDisplay: React.FC<ReadmeDisplayProps> = ({
  readmeNote,
  onSelectNote,
  customRenderers,
}) => {
  return (
    <div
      className="mt-6 p-4 border rounded-lg prose dark:prose-invert max-w-none bg-card text-card-foreground shadow cursor-pointer hover:bg-card/95 transition-colors"
      onClick={() => onSelectNote(readmeNote)}
    >
      <h2 className="font-bold text-lg mb-2 flex items-center gap-2 not-prose">
        <File className="w-5 h-5 inline-block" />
        README
      </h2>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkBreaks]}
        rehypePlugins={[rehypeRaw]}
        components={customRenderers}
      >
        {readmeNote.content}
      </ReactMarkdown>
    </div>
  );
};
