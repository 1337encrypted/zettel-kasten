
import React from "react";
import { Note } from "@/pages/Index";
import { List } from "lucide-react";

type Props = {
  notes: Note[];
  selectedId?: string;
  setSelectedId: (id: string) => void;
  setShowEditor: (v: boolean) => void;
  search: string;
  setSearch: (v: string) => void;
  tag: string;
  setTag: (v: string) => void;
};

const uniqueTags = (notes: Note[]) =>
  Array.from(new Set(notes.flatMap(n => n.tags))).filter(Boolean);

const NoteList: React.FC<Props> = ({
  notes,
  selectedId,
  setSelectedId,
  setShowEditor,
  tag,
  setTag,
}) => {
  const tags = uniqueTags(notes);
  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-wrap items-center px-4 py-2 border-b bg-background gap-2">
        <span className="font-semibold uppercase tracking-wide text-xs text-muted-foreground mr-2 flex items-center">
          <List size={16} className="mr-1" /> Notes
        </span>
        {tags.map((t) => (
          <button
            key={t}
            onClick={() => setTag(tag === t ? "" : t)}
            className={`text-xs font-medium px-2 py-1 rounded transition ${tag === t ? "bg-primary text-white" : "hover:bg-border bg-muted text-muted-foreground"}`}
            tabIndex={0}
          >
            #{t}
          </button>
        ))}
        {tag && (
          <button className="ml-4 text-xs text-destructive" onClick={() => setTag("")}>
            Clear
          </button>
        )}
      </div>
      <ul className="flex-1 overflow-y-auto divide-y divide-border">
        {notes.length === 0 && (
          <div className="p-8 text-muted-foreground text-center">No notes found.</div>
        )}
        {notes.map((note) => (
          <li
            key={note.id}
            onClick={() => { setSelectedId(note.id); }}
            className={`cursor-pointer px-5 py-3 transition border-l-4 ${selectedId === note.id ? "border-primary bg-background/50" : "border-transparent hover:bg-accent"} `}
            tabIndex={0}
          >
            <div className="font-medium text-base truncate">{note.title || "(untitled)"}</div>
            <div className="flex gap-2 mt-1">
              {note.tags.map((t) => (
                <span key={t} className="text-xs text-muted-foreground">
                  #{t}
                </span>
              ))}
            </div>
            <div className="text-xs text-muted-foreground">{new Date(note.updated).toLocaleString()}</div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default NoteList;
