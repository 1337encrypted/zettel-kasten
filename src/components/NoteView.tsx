
import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import { Note } from '@/types';

interface NoteViewProps {
  note: Note | null;
}

const NoteView: React.FC<NoteViewProps> = ({ note }) => {
  if (!note) {
    return (
      <div className="p-4 border rounded-lg shadow min-h-[200px] flex items-center justify-center">
        <p className="text-muted-foreground">Select a note to view its content, or create a new one.</p>
      </div>
    );
  }

  return (
    <div className="p-4 border rounded-lg shadow prose dark:prose-invert max-w-none">
      <h1 className="text-3xl font-bold mb-4">{note.title}</h1>
      <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>{note.content}</ReactMarkdown>
      <div className="mt-4 text-xs text-muted-foreground">
        <p>Created: {note.createdAt.toLocaleDateString()}</p>
        <p>Last Updated: {note.updatedAt.toLocaleDateString()}</p>
      </div>
    </div>
  );
};

export default NoteView;
