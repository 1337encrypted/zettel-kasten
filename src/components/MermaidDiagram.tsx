
import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import { useTheme } from 'next-themes';
import { Skeleton } from '@/components/ui/skeleton';

interface MermaidDiagramProps {
  chart: string;
}

const MermaidDiagram: React.FC<MermaidDiagramProps> = ({ chart }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const chartId = useRef(`mermaid-${Math.random().toString(36).substring(2, 9)}`).current;

  useEffect(() => {
    if (!chart) {
      setIsLoading(false);
      setError(null);
      if(containerRef.current) containerRef.current.innerHTML = '';
      return;
    }

    setIsLoading(true);
    setError(null);
    
    mermaid.initialize({
        startOnLoad: false,
        theme: theme === 'dark' ? 'dark' : 'default',
        securityLevel: 'loose',
        fontFamily: 'inherit',
    });

    mermaid.render(chartId, chart)
        .then(({ svg }) => {
            if (containerRef.current) {
                containerRef.current.innerHTML = svg;
                const svgEl = containerRef.current.querySelector('svg');
                if (svgEl) {
                    svgEl.style.maxWidth = '100%';
                    svgEl.style.height = 'auto';
                }
            }
            setError(null);
        })
        .catch((e) => {
            console.error("Mermaid rendering failed:", e);
            const errorMessage = e instanceof Error ? e.message : String(e);
            setError(`Failed to render Mermaid diagram. Check syntax. Error: ${errorMessage.split('\n')[0]}`);
        })
        .finally(() => {
            setIsLoading(false);
        });

  }, [chart, theme, chartId]);

  if (error) {
    return (
      <div className="p-4 border rounded-md bg-destructive/10 text-destructive prose dark:prose-invert max-w-none">
        <p className="font-bold">Mermaid Diagram Error</p>
        <p className="text-sm">{error}</p>
        <pre className="mt-2 text-sm bg-destructive/20 p-2 rounded"><code>{chart}</code></pre>
      </div>
    );
  }

  return (
    <div className="not-prose flex justify-center p-4 border rounded-md bg-card min-h-[100px] overflow-x-auto">
        {isLoading && <Skeleton className="w-full h-full min-h-[200px]" />}
        <div ref={containerRef} className={isLoading ? 'hidden' : 'w-full h-full flex justify-center'}></div>
    </div>
  );
};

export default MermaidDiagram;
