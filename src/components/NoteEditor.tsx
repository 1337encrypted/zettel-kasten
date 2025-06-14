
import React, { useState } from "react";
import { Note } from "@/pages/Index";
import { Button } from "@/components/ui/button";

type Props = {
  note: Note;
  onSave: (note: Note) => void;
  onCancel: () => void;
  onDelete: () => void;
};

const NoteEditor: React.FC<Props> = ({
  note,
  onSave,
  onCancel,
  onDelete,
}) => {
  const [title, setTitle] = useState(note.title);
  const [body, setBody] = useState(note.body);
  const [tags, setTags] = useState(note.tags.join(" "));
  return (
    <div className="max-w-3xl mx-auto py-10">
      <div className="flex items-center mb-2">
        <input
          className="font-serif text-3xl font-bold border-none w-full focus:outline-none bg-transparent"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Note title..."
        />
      </div>
      <div className="mb-2">
        <textarea
          className="w-full min-h-[200px] font-serif text-base rounded bg-muted/60 px-3 py-2 focus:outline-none border border-border"
          value={body}
          onChange={e => setBody(e.target.value)}
          placeholder="Write your note in Markdown. Use [[wikilinks]] to connect notes."
        />
      </div>
      <div className="mb-4 flex items-center gap-2">
        <input
          className="text-sm px-2 py-1 border rounded"
          value={tags}
          onChange={e => setTags(e.target.value)}
          placeholder="Tags (space separated)"
        />
        <span className="text-xs text-muted-foreground ml-1">e.g. zettelkasten knowledge</span>
      </div>
      <div className="flex gap-2">
        <Button variant="default" onClick={() => onSave({
          ...note,
          title: title.trim() || "Untitled",
          body,
          tags: tags.split(" ").filter(Boolean),
        })}>Save</Button>
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <Button variant="destructive" onClick={onDelete}>Delete</Button>
      </div>
      <div className="mt-6 border-t pt-5">
        <div className="text-base font-semibold mb-2 text-muted-foreground">Preview</div>
        <div className="prose max-w-none px-2 py-2 bg-card rounded border">
          {/* Preview Area */}
          <pre className="whitespace-pre-wrap font-serif">{body}</pre>
        </div>
      </div>
    </div>
  );
};

export default NoteEditor;
