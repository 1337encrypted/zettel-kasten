import React, { useState, useMemo } from "react";
import NoteList from "@/components/NoteList";
import NoteEditor from "@/components/NoteEditor";
import NoteViewer from "@/components/NoteViewer";
import NoteGraph from "@/components/NoteGraph";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Search, List, Network } from "lucide-react";

// --- Types ---
export type Note = {
  id: string;
  title: string;
  body: string;
  tags: string[];
  created: number;
  updated: number;
  links: string[]; // IDs of linked notes
};
// --- Utilities for Zettelkasten / demo storage ---
function generateId() {
  // Zettelkasten-style: yyyyMMddHHmmss random 4 digit
  const d = new Date();
  const pad = (n:number) => n.toString().padStart(2,"0");
  const id = `${d.getFullYear()}${pad(d.getMonth()+1)}${pad(d.getDate())}${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
  return id + Math.floor(1000+Math.random()*9000);
}

function parseLinks(markdown:string): string[] {
  // Extract [[linked note ids or titles]]
  return [...markdown.matchAll(/\[\[([^\]]+)\]\]/g)].map(m=>m[1]);
}

const DEMO_NOTES: Note[] = [
  {
    id: "202406140930000181",
    title: "What is Zettelkasten?",
    body: "The Zettelkasten Method is a personal knowledge management and note-taking system. See also: [[Links and Connections]]",
    tags: ["zettelkasten", "method"],
    created: Date.now() - 86400000 * 2,
    updated: Date.now() - 86400000 * 1,
    links: ["Links and Connections"],
  },
  {
    id: "202406140940100299",
    title: "Links and Connections",
    body: "Zettelkasten works by connecting notes via unique IDs or [[wikilink]]s. Try linking notes using [[What is Zettelkasten?]].",
    tags: ["links"],
    created: Date.now() - 86400000,
    updated: Date.now(),
    links: ["What is Zettelkasten?"],
  },
];

const Index = () => {
  // Simulate user session (upgrade with proper Clerk auth in next step)
  const isAuthenticated = true;
  const [notes, setNotes] = useState<Note[]>(DEMO_NOTES);
  const [selectedNoteId, setSelectedNoteId] = useState<string|undefined>(notes[0]?.id);
  const [search, setSearch] = useState("");
  const [tag, setTag] = useState("");
  const [showEditor, setShowEditor] = useState(false);
  const [showGraph, setShowGraph] = useState(false);
  const { toast } = useToast();

  const visibleNotes = useMemo(() =>
      notes.filter(
        n =>
          (!search || n.title.toLowerCase().includes(search.toLowerCase()) || n.body.toLowerCase().includes(search.toLowerCase()))
          && (!tag || n.tags.includes(tag))
      ),
    [notes, search, tag]
  );

  const selectedNote = notes.find(n => n.id === selectedNoteId);

  const handleCreate = () => {
    const id = generateId();
    const title = "New Note";
    const body = "";
    const tags: string[] = [];
    const created = Date.now();
    const updated = created;
    const links: string[] = [];
    const newNote = { id, title, body, tags, created, updated, links };
    setNotes([newNote, ...notes]);
    setSelectedNoteId(id);
    setShowEditor(true);
    toast({ title: "Note created" });
  }

  const handleUpdate = (updatedNote: Note) => {
    setNotes(notes.map(n => n.id === updatedNote.id ? updatedNote : n));
    toast({ title: "Note saved" });
  }

  const handleDelete = (id: string) => {
    setNotes(notes.filter(n => n.id !== id));
    setSelectedNoteId(notes[0]?.id);
    toast({ title: "Note deleted" });
  }

  // --- Backlink resolution
  const backlinks = useMemo(() => {
    if (!selectedNote) return [];
    return notes.filter(n =>
      n.links.includes(selectedNote.title) || n.links.includes(selectedNote.id)
    );
  }, [selectedNote, notes]);

  return (
    <div className="min-h-screen w-full flex flex-col" style={{ fontFamily: "Inter, sans-serif" }}>
      {/* Top bar */}
      <header className="flex items-center border-b h-16 px-6 bg-background sticky top-0 z-10">
        <span className="font-semibold text-lg text-primary mr-6 tracking-wide select-none">
          Zettelkasten Notes
        </span>
        <div className="flex-1 flex items-center gap-2">
          <div className="relative flex-1 max-w-sm">
            <input
              type="text"
              placeholder="Search notes…"
              className="w-full bg-muted px-3 py-1.5 rounded text-sm focus:outline-none focus:border-primary border"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <Search size={16} className="absolute right-2 top-2 text-muted-foreground pointer-events-none"/>
          </div>
          <Button
            variant={showGraph ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setShowGraph(v=>!v)}
            className="ml-2"
          >
            <Network size={16} className="mr-1" />
            Graph View
          </Button>
        </div>
        {isAuthenticated && (
          <Button variant="default" size="sm" className="ml-4" onClick={handleCreate}>
            + New Note
          </Button>
        )}
      </header>
      {/* Main split area */}
      <main className="flex flex-1 overflow-hidden bg-background">
        {/* Sidebar: Notes List */}
        <aside className="w-80 shrink-0 bg-muted/40 border-r h-full flex flex-col overflow-y-auto">
          <NoteList
            notes={visibleNotes}
            selectedId={selectedNoteId}
            setSelectedId={id => { setSelectedNoteId(id); setShowEditor(false); }}
            setShowEditor={setShowEditor}
            search={search}
            setSearch={setSearch}
            tag={tag}
            setTag={setTag}
          />
        </aside>
        {/* Main Panel: Editor/Viewer */}
        <section className="flex-1 h-full max-w-screen-xl mx-auto transition-all duration-200" style={{ fontFamily:"Playfair Display, serif" }}>
          {showGraph ? (
            <div className="h-full flex items-center justify-center bg-background">
              <NoteGraph notes={notes} selectNote={setSelectedNoteId} selectedId={selectedNoteId} />
            </div>
          ) : showEditor && isAuthenticated && selectedNote ? (
            <NoteEditor
              note={selectedNote}
              onSave={updatedNote => {
                handleUpdate({
                  ...updatedNote,
                  links: parseLinks(updatedNote.body),
                  updated: Date.now()
                });
                setShowEditor(false);
              }}
              onCancel={() => setShowEditor(false)}
              onDelete={() => {
                handleDelete(selectedNote.id)
                setShowEditor(false);
              }}
            />
          ) : selectedNote ? (
            <NoteViewer
              note={selectedNote}
              backlinks={backlinks}
              onEdit={isAuthenticated ? () => setShowEditor(true) : undefined}
            />
          ) : (
            <div className="h-full flex items-center justify-center text-muted-foreground">No note selected.</div>
          )}
        </section>
      </main>
    </div>
  );
};

export default Index;
