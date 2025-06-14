
import * as React from "react";
import { Textarea, TextareaProps } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const TextareaWithLineNumbers = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ className, value, ...props }, ref) => {
        const lineNumbersRef = React.useRef<HTMLDivElement>(null);
        const textareaRef = React.useRef<HTMLTextAreaElement>(null);

        // Combine forwarded ref with internal ref
        React.useImperativeHandle(ref, () => textareaRef.current!);
        
        const lineCount = React.useMemo(() => {
            const count = value ? String(value).split('\n').length : 1;
            return Math.max(1, count);
        }, [value]);

        const handleScroll = () => {
            if (lineNumbersRef.current && textareaRef.current) {
                lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
            }
        };

        return (
            <div className={cn("flex w-full overflow-hidden rounded-md border border-input bg-background", className)}>
                <div
                    ref={lineNumbersRef}
                    className="p-2 pr-3 text-right text-muted-foreground select-none font-mono text-sm"
                    style={{ lineHeight: '1.5rem', flexShrink: 0 }}
                    aria-hidden="true"
                >
                    {Array.from({ length: lineCount }, (_, i) => i + 1).map(lineNumber => (
                        <div key={lineNumber}>{lineNumber}</div>
                    ))}
                </div>
                <Textarea
                    ref={textareaRef}
                    value={value}
                    onScroll={handleScroll}
                    className="flex-grow !border-0 !rounded-none !ring-0 !ring-offset-0 p-2 font-mono text-sm resize-none bg-transparent"
                    style={{ lineHeight: '1.5rem' }}
                    {...props}
                />
            </div>
        );
    }
);
TextareaWithLineNumbers.displayName = "TextareaWithLineNumbers";

export { TextareaWithLineNumbers };
