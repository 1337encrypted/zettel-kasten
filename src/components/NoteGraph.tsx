
import React from "react";
import { Note } from "@/pages/Index";
import { SigmaContainer, useLoadGraph, useRegisterEvents } from "react-sigma-v2";

type GraphProps = {
  notes: Note[];
  selectNote: (id: string) => void;
  selectedId?: string;
};

const GraphEvents: React.FC<{ selectNote: (id: string) => void }> = ({ selectNote }) => {
  const registerEvents = useRegisterEvents();

  React.useEffect(() => {
    registerEvents({
      clickNode: (event) => {
        selectNote(event.node);
      },
    });
  }, [registerEvents, selectNote]);

  return null;
};

const LoadGraph: React.FC<{ nodes: any[], edges: any[] }> = ({ nodes, edges }) => {
  const loadGraph = useLoadGraph();

  React.useEffect(() => {
    loadGraph({ nodes, edges });
  }, [loadGraph, nodes, edges]);

  return null;
};

const NoteGraph: React.FC<GraphProps> = ({ notes, selectNote, selectedId }) => {
  // Prepare nodes/edges for graph lib
  const nodes = notes.map((n, i) => ({
    id: n.id,
    label: n.title,
    color: n.id === selectedId ? "#2563eb" : "#8884d8",
    size: 16 + Math.log2((n.links?.length || 1)) * 4,
    x: Math.cos(i * 2 * Math.PI / notes.length) * 100,
    y: Math.sin(i * 2 * Math.PI / notes.length) * 100,
  }));
  
  const edges = notes.flatMap(n =>
    (n.links || []).map(l => {
      const targetNote = notes.find(nn => nn.title === l || nn.id === l);
      if (!targetNote) return null;
      return {
        id: n.id + "_to_" + targetNote.id,
        source: n.id,
        target: targetNote.id,
        color: "#bbb"
      };
    }).filter(Boolean)
  ) as any[];

  return (
    <div className="w-full h-[480px] bg-muted rounded border">
      <SigmaContainer
        style={{ height: 480, width: '100%', borderRadius: 8, background: '#f9fafb' }}
        settings={{
          renderLabels: true,
          defaultNodeType: "circle",
          defaultEdgeType: "line",
        }}
      >
        <LoadGraph nodes={nodes} edges={edges} />
        <GraphEvents selectNote={selectNote} />
      </SigmaContainer>
      <div className="text-xs text-muted-foreground py-2 text-center">Click a node to view note</div>
    </div>
  );
};

export default NoteGraph;
