
import * as React from "react"
import { cn } from "@/lib/utils"
import { Textarea, TextareaProps } from "@/components/ui/textarea"

const TextareaWithLineNumbers = React.forwardRef<
  HTMLTextAreaElement,
  TextareaProps
>(({ className, value, ...props }, ref) => {
  const [lineCount, setLineCount] = React.useState(1);
  const lineNumbersRef = React.useRef<HTMLDivElement>(null);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  React.useImperativeHandle(ref, () => textareaRef.current as HTMLTextAreaElement);

  React.useEffect(() => {
    const count = (value as string || '').split('\n').length;
    setLineCount(count > 0 ? count : 1);
  }, [value]);

  const handleTextAreaScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    if (lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = e.currentTarget.scrollTop;
    }
  };

  const lineNumbers = Array.from({ length: lineCount }, (_, i) => (
    <div key={i}>{i + 1}</div>
  ));

  return (
    <div
      className={cn(
        "flex w-full rounded-md border border-input bg-background ring-offset-background focus-within:outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
        "has-[textarea:disabled]:cursor-not-allowed has-[textarea:disabled]:opacity-50",
        className
      )}
    >
      <div
        ref={lineNumbersRef}
        className="font-mono text-sm text-right text-muted-foreground select-none py-2 pl-3 pr-2 overflow-hidden"
        style={{ lineHeight: "1.5rem" }}
        aria-hidden="true"
      >
        {lineNumbers}
      </div>
      <Textarea
        ref={textareaRef}
        value={value}
        onScroll={handleTextAreaScroll}
        className="!h-full flex-grow resize-none font-mono text-sm !border-0 !ring-0 !outline-none !ring-offset-0 !shadow-none p-0 pr-3 pl-2 py-2"
        style={{ lineHeight: "1.5rem" }}
        {...props}
      />
    </div>
  );
});
TextareaWithLineNumbers.displayName = "TextareaWithLineNumbers"

export { TextareaWithLineNumbers }
