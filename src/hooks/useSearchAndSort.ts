
import { useState, useMemo } from 'react';
import { Note, Folder } from '@/types';
import Fuse from 'fuse.js';

interface useSearchAndSortProps {
  notes: Note[];
  folders: Folder[];
  currentFolderId: string | null;
}

export const useSearchAndSort = ({ notes, folders, currentFolderId }: useSearchAndSortProps) => {
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [searchQuery, setSearchQuery] = useState('');

  const fuse = useMemo(() => new Fuse(notes, {
    keys: ['title', 'content', 'tags', 'id'],
    includeScore: true,
    threshold: 0.4,
  }), [notes]);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];

    const exactMatchById = notes.find(note => note.id === searchQuery.trim());
    if (exactMatchById) {
      return [exactMatchById];
    }
    
    return fuse.search(searchQuery).map(result => result.item);
  }, [searchQuery, fuse, notes]);

  const filteredFolders = useMemo(() => {
    if (searchQuery.trim()) return [];
    return folders.filter(folder => {
      if (currentFolderId === null) {
        return !folder.parentId;
      }
      return folder.parentId === currentFolderId;
    });
  }, [folders, currentFolderId, searchQuery]);

  const filteredNotes = useMemo(() => {
    if (searchQuery.trim()) {
      return searchResults;
    }
    const notesInFolder = notes.filter(note => {
      if (currentFolderId === null) {
        return !note.folderId;
      }
      return note.folderId === currentFolderId;
    });
    
    return [...notesInFolder].sort((a, b) => {
      if (a.title.toLowerCase() === 'readme') return -1;
      if (b.title.toLowerCase() === 'readme') return 1;
      
      const titleA = a.title.toLowerCase();
      const titleB = b.title.toLowerCase();

      if (sortOrder === 'asc') {
        return titleA.localeCompare(titleB);
      } else {
        return titleB.localeCompare(titleA);
      }
    });
  }, [notes, currentFolderId, sortOrder, searchQuery, searchResults]);

  return {
    sortOrder,
    setSortOrder,
    searchQuery,
    setSearchQuery,
    filteredFolders,
    filteredNotes,
  };
};
