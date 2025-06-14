
import React from "react";
import { Note } from "@/pages/Index";
import { Button } from "@/components/ui/button";
import renderMarkdown from "@/lib/markdown";

type Props = {
  note: Note;
  backlinks: Note[];
  onEdit?: () => void;
};

const NoteViewer: React.FC<Props> = ({ note, backlinks, onEdit }) => {
  return (
    <div className="max-w-3xl mx-auto py-10">
      <div className="flex items-center mb-2 gap-4">
        <h1 className="font-serif text-3xl font-bold flex-1">{note.title}</h1>
        {onEdit && (
          <Button variant="outline" onClick={onEdit}>Edit</Button>
        )}
      </div>
      <div className="mb-3 flex gap-2">
        {note.tags.map((t) => (
          <span key={t} className="bg-muted px-2 py-1 text-xs rounded text-muted-foreground">
            #{t}
          </span>
        ))}
      </div>
      <div className="prose max-w-none font-serif mb-8">
        {renderMarkdown(note.body)}
      </div>
      <div className="border-t pt-4 mt-8">
        <div className="font-semibold text-muted-foreground mb-2 text-base">Backlinks</div>
        <ul>
          {backlinks.length === 0 && (
            <li className="text-sm text-muted-foreground">No backlinks yet.</li>
          )}
          {backlinks.map((n) => (
            <li key={n.id} className="text-sm text-accent-foreground py-1">{n.title}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default NoteViewer;
