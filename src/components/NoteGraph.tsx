
import React from "react";
import { Note } from "@/pages/Index";
import { SigmaContainer, useLoadGraph } from "@react-sigma/core";

// Dummy initial graph, just to render network structure
type GraphProps = {
  notes: Note[];
  selectNote: (id:string)=>void;
  selectedId?: string;
};
const NoteGraph: React.FC<GraphProps> = ({ notes, selectNote, selectedId }) => {
  // Prepare nodes/edges for graph lib
  const nodes = notes.map((n, i) => ({
    id: n.id,
    label: n.title,
    color: n.id === selectedId ? "#2563eb" : "#8884d8",
    size: 16 + Math.log2((n.links?.length||1))*4,
    x: Math.cos(i * 2*Math.PI/notes.length) * 10,
    y: Math.sin(i * 2*Math.PI/notes.length) * 10,
  }));
  const edges = notes.flatMap(n =>
    (n.links||[]).map(l => {
      const targetNote = notes.find(nn=>nn.title===l||nn.id===l);
      if (!targetNote) return null;
      return {
        id: n.id + "_to_" + targetNote.id,
        source: n.id,
        target: targetNote.id,
        color: "#bbb"
      }
    }).filter(Boolean)
  ) as any[];

  const { loadGraph } = useLoadGraph();

  React.useEffect(() => {
    // Simple update, more advanced layout can be added
    loadGraph({ nodes, edges });
  }, [notes, selectedId]);

  return (
    <div className="w-full h-[480px] bg-muted rounded border flex flex-col items-center justify-center">
      <SigmaContainer
        style={{height:480,width:'100%',borderRadius:8,background:'#f9fafb'}}
        settings={{ labelFont: 'Playfair Display', labelSize:16, hoverFontWeight:'bold', minArrowSize:6 }}
        onDownNode={e => selectNote(e.node)}
      />
      <div className="text-xs text-muted-foreground py-2">Click a node to view note</div>
    </div>
  );
};
export default NoteGraph;
