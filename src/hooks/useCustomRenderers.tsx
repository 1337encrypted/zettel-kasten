import React, { useMemo, useEffect, useState } from 'react';
import { Note } from '@/types';
import { Link2 } from 'lucide-react';
import UnresolvedNoteLink from '@/components/UnresolvedNoteLink';
import { supabase } from '@/integrations/supabase/client';

// Helper to load movies.json from Supabase Storage per user/folder
const moviesCache: Record<string, any[] | null> = {};
async function loadMoviesFromStorage(userId: string, folderName: string): Promise<any[]> {
  const cacheKey = `${userId}/${folderName}`;
  if (moviesCache[cacheKey]) return moviesCache[cacheKey]!;
  try {
    const { data } = supabase.storage.from('note-files').getPublicUrl(`${userId}/${folderName}/movies.json`);
    if (!data || !data.publicUrl) throw new Error('No public URL');
    const resp = await fetch(data.publicUrl);
    if (!resp.ok) throw new Error('Failed to fetch movies.json');
    const json = await resp.json();
    moviesCache[cacheKey] = json;
    return json;
  } catch {
    moviesCache[cacheKey] = [];
    return [];
  }
}

export const useCustomRenderers = (allNotes: Note[], onSelectNote: (note: Note) => void, currentNote?: Note | null) => {
    const notesById = useMemo(() => {
        return allNotes.reduce((acc, note) => {
            acc[note.id] = note;
            return acc;
        }, {} as Record<string, Note>);
    }, [allNotes]);

    // Movie renderer state
    const [movies, setMovies] = useState<any[] | null>(null);
    useEffect(() => {
      if (!currentNote || !currentNote.userId || !currentNote.folderId) return;
      // Find folder name from allNotes (assuming at least one note in the folder)
      const folderNote = allNotes.find(n => n.folderId === currentNote.folderId);
      const folderName = folderNote?.folderId ? (allNotes.find(n => n.folderId === folderNote.folderId)?.folderId || 'root') : 'root';
      // Try to get folder name from a note in the same folder, fallback to 'root'
      // If you have a folders list, you can improve this
      loadMoviesFromStorage(currentNote.userId, folderName).then(setMovies);
    }, [currentNote, allNotes]);

    const customRenderers = useMemo(() => ({
        p: (paragraph: { children?: React.ReactNode; node?: any }) => {
            const childrenArray = React.Children.toArray(paragraph.children);

            const processedChildren = childrenArray.flatMap((child, i) => {
                if (typeof child === 'string') {
                    const parts = child.split(/(\[\[.+?\]\])/g);
                    return parts.map((part, j) => {
                        const match = /\[\[(.+?)\]\]/.exec(part);
                        if (match) {
                            const noteId = match[1].trim();
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
                                return <UnresolvedNoteLink key={`${i}-${j}`} noteId={noteId} />;
                            }
                        }
                        return part;
                    });
                }
                return child;
            });

            return <p>{processedChildren}</p>;
        },
        movie: ({ children }: { children?: React.ReactNode }) => {
          const title = typeof children === 'string' ? children : Array.isArray(children) ? children.join('') : '';
          if (!movies) return <div>Loading movie info...</div>;
          const movie = movies.find(m => m.title === title);
          if (!movie) return <div className="movie-card-wrapper"><div className="movie-card"><div className="movie-overlay">Movie not found: {title}</div></div></div>;
          return (
            <div className="movie-card-wrapper">
              <div className="movie-card">
                <img src={movie.image} alt={`${movie.title} Poster`} className="movie-image" />
                <div className="movie-overlay">
                  <div className="rating-display">
                    <span className="rating-emoji">⭐</span>
                    <span>{movie.rating} <span className="rating-text-small">/ 10</span></span>
                  </div>
                  <div className="genre-text">
                    {Array.isArray(movie.genre) ? movie.genre.map((g: string) => <span key={g}>{g}</span>) : <span>{movie.genre}</span>}
                  </div>
                  <button type="button" className="view-details-button">View Details</button>
                </div>
              </div>
              <div className="movie-info-div">
                <h2 className="movie-title-link">{movie.title}</h2>
                <p className="movie-year">{movie.year}</p>
              </div>
            </div>
          );
        },
        catalogue: ({ children }: { children?: React.ReactNode }) => {
          return (
            <div className="main-container">
              <div id="movie-cards-grid">
                {children}
              </div>
            </div>
          );
        },
        file: ({ children }: { children?: React.ReactNode }) => {
          // children is the filename
          const filename = typeof children === 'string' ? children : Array.isArray(children) ? children.join('') : '';
          if (!currentNote || !currentNote.userId || !currentNote.folderId) return <div>File: {filename}</div>;
          const [fileContent, setFileContent] = useState<string | null>(null);
          const [error, setError] = useState<string | null>(null);
          useEffect(() => {
            let cancelled = false;
            async function fetchFile() {
              setError(null);
              setFileContent(null);
              try {
                const { data } = supabase.storage.from('note-files').getPublicUrl(`${currentNote.userId}/${currentNote.folderId}/${filename}`);
                if (!data || !data.publicUrl) throw new Error('No public URL');
                const resp = await fetch(data.publicUrl);
                if (!resp.ok) throw new Error('Failed to fetch file');
                const text = await resp.text();
                if (!cancelled) setFileContent(text);
              } catch (e: any) {
                if (!cancelled) setError(e.message || 'Failed to fetch file');
              }
            }
            if (filename.endsWith('.json')) fetchFile();
            // else: could add other file types
            return () => { cancelled = true; };
          }, [filename, currentNote]);
          if (filename.endsWith('.json')) {
            if (error) return <div className="border rounded p-2 bg-destructive/10 text-destructive text-xs">Error loading {filename}: {error}</div>;
            if (!fileContent) return <div>Loading {filename}...</div>;
            let parsed;
            try { parsed = JSON.parse(fileContent); } catch { parsed = fileContent; }
            return <pre className="border rounded p-2 bg-muted text-xs overflow-x-auto"><code>{typeof parsed === 'string' ? parsed : JSON.stringify(parsed, null, 2)}</code></pre>;
          }
          return <div>File: {filename}</div>;
        },
    }), [notesById, onSelectNote, movies, currentNote]);

    return customRenderers;
};
