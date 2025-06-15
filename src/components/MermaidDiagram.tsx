
import React, { useEffect, useState, useRef } from 'react';
import mermaid from 'mermaid';
import { useTheme } from '@/components/theme-provider';
import { Skeleton } from '@/components/ui/skeleton';

interface MermaidDiagramProps {
  chart: string;
}

const MermaidDiagram: React.FC<MermaidDiagramProps> = ({ chart }) => {
  const [svg, setSvg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { theme } = useTheme();
  const chartId = useRef(`mermaid-chart-${Math.random().toString(36).substring(2, 9)}`).current;

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: theme === 'dark' ? 'dark' : 'neutral',
      securityLevel: 'loose',
      fontFamily: 'inherit',
    });

    const renderMermaid = async () => {
      try {
        setError(null);
        setSvg(null);
        const { svg: renderedSvg } = await mermaid.render(chartId, chart);
        setSvg(renderedSvg);
      } catch (e) {
        console.error("Mermaid rendering failed:", e);
        setError("Failed to render Mermaid diagram. Please check syntax.");
        setSvg(null);
      }
    };

    if (chart) {
      renderMermaid();
    }
  }, [chart, theme, chartId]);

  if (error) {
    return (
      <div className="p-4 border rounded-md bg-destructive/10 text-destructive prose dark:prose-invert max-w-none">
        <p className="font-bold">Mermaid Diagram Error</p>
        <p>{error}</p>
        <pre className="mt-2 text-sm"><code>{chart}</code></pre>
      </div>
    );
  }

  if (svg) {
    return (
      <div 
        className="not-prose flex justify-center p-4 border rounded-md bg-card" 
        dangerouslySetInnerHTML={{ __html: svg }} 
      />
    );
  }

  return (
    <div className="not-prose flex justify-center items-center p-4 border rounded-md min-h-[200px]">
      <Skeleton className="w-full h-full min-h-[180px]" />
    </div>
  );
};

export default MermaidDiagram;
