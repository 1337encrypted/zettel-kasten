
import React, { useMemo } from 'react';
import { Note } from '@/types';
import { Link2 } from 'lucide-react';

export const useCustomRenderers = (allNotes: Note[], onSelectNote: (note: Note) => void) => {
    const notesById = useMemo(() => {
        return allNotes.reduce((acc, note) => {
            acc[note.id] = note;
            return acc;
        }, {} as Record<string, Note>);
    }, [allNotes]);

    const customRenderers = useMemo(() => ({
        p: (paragraph: { children?: React.ReactNode; node?: any }) => {
            const childrenArray = React.Children.toArray(paragraph.children);

            const processedChildren = childrenArray.flatMap((child, i) => {
                if (typeof child === 'string') {
                    const parts = child.split(/(\[\[.+?\]\])/g);
                    return parts.map((part, j) => {
                        const match = /\[\[(.+?)\]\]/.exec(part);
                        if (match) {
                            const noteId = match[1];
                            const linkedNote = notesById[noteId];
                            if (linkedNote) {
                                return (
                                    <a
                                        key={`${i}-${j}`}
                                        className="text-primary hover:underline cursor-pointer font-semibold inline-flex items-center gap-1"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            onSelectNote(linkedNote);
                                        }}
                                        href="#"
                                    >
                                        <Link2 className="w-4 h-4" />
                                        {linkedNote.title}
                                    </a>
                                );
                            } else {
                                return (
                                    <span key={`${i}-${j}`} className="text-muted-foreground italic">
                                        {`[[${noteId}]]`}
                                    </span>
                                );
                            }
                        }
                        return part;
                    });
                }
                return child;
            });

            return <p>{processedChildren}</p>;
        },
    }), [notesById, onSelectNote]);

    return customRenderers;
};
