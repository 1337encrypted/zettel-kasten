
import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";

// Parse [[wikilink]]s to <a> links with a custom renderer
function linkifyWikilinks(text: string) {
  return text.replace(/\[\[([^\]]+?)\]\]/g, (_, inner) =>
    `[${inner}](/#${encodeURIComponent(inner)})`
  );
}

const renderMarkdown = (body: string) => {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm, remarkBreaks]}
      components={{
        a: ({node, ...props}) => (
          <a {...props} className="text-primary underline hover:opacity-80" target="_blank" rel="noopener noreferrer"/>
        ),
        // Could add more overrides for code, blockquote, etc
      }}
    >
      {linkifyWikilinks(body)}
    </ReactMarkdown>
  );
};

export default renderMarkdown;
