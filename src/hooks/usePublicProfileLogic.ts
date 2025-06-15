
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Note, Folder } from '@/types';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useSearchAndSort } from '@/hooks/useSearchAndSort';

export const usePublicProfileLogic = () => {
    const params = useParams();
    const navigate = useNavigate();
  
    const userId = params.userId;
    const slug = params['*'];
  
    const [viewMode, setViewMode] = useState<'list' | 'preview'>('list');
    const [selectedNote, setSelectedNote] = useState<Note | null>(null);
    const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  
    const userProfileQuery = useUserProfile(userId, currentFolderId);
    const { allNotes, allFolders, isLoading, currentFolder } = userProfileQuery;
  
    const {
      sortOrder,
      setSortOrder,
      searchQuery,
      setSearchQuery,
      filteredFolders: searchedAndSortedFolders,
      filteredNotes: searchedAndSortedNotes,
    } = useSearchAndSort({
      notes: allNotes,
      folders: allFolders,
      currentFolderId,
    });
  
    useEffect(() => {
      if (!userId || isLoading) return;
  
      if (!slug) {
        setCurrentFolderId(null);
        setSelectedNote(null);
        setViewMode('list');
        return;
      }
      
      if (allNotes.length > 0 || allFolders.length > 0) {
        const noteBySlug = allNotes.find(n => n.slug === slug);
        if (noteBySlug) {
          setSelectedNote(noteBySlug);
          setCurrentFolderId(noteBySlug.folderId || null);
          setViewMode('preview');
          return;
        }
    
        const folderBySlug = allFolders.find(f => f.slug === slug);
        if (folderBySlug) {
          setCurrentFolderId(folderBySlug.id);
          setSelectedNote(null);
          setViewMode('list');
          return;
        }
  
        // If slug is provided but no matching content found, redirect to user root.
        if (!isLoading) {
          navigate(`/u/${userId}`, { replace: true });
        }
      }
    }, [slug, userId, allNotes, allFolders, isLoading, navigate]);
  
    const handleSelectNote = (note: Note) => {
      if (note.slug) {
        navigate(`/u/${userId}/${note.slug}`);
      } else {
        setSelectedNote(note);
        setViewMode('preview');
      }
    };
  
    const handleBackToList = () => {
      setSearchQuery('');
      setViewMode('list');
      setSelectedNote(null);
      if (slug) {
        const folder = allFolders.find(f => f.id === currentFolderId);
        if (folder && (folder as any).slug) {
          navigate(`/u/${userId}/${(folder as any).slug}`);
        } else {
          navigate(`/u/${userId}`);
        }
      }
    };
  
    const handleSelectFolder = (folder: Folder) => {
      setSearchQuery('');
      if (folder.slug) {
        navigate(`/u/${userId}/${folder.slug}`);
      } else {
        setCurrentFolderId(folder.id);
      }
    };
  
    const handleNavigateUp = () => {
      setSearchQuery('');
      if (!currentFolderId) return;
      const parentId = currentFolder?.parentId || null;
      const parentFolder = allFolders.find(f => f.id === parentId);
      if (parentFolder && (parentFolder as any).slug) {
          navigate(`/u/${userId}/${(parentFolder as any).slug}`);
      } else {
          navigate(`/u/${userId}`);
      }
      setCurrentFolderId(parentId);
    };
  
    const handleEscape = () => {
      if (viewMode === 'preview') {
        handleBackToList();
      } else if (currentFolderId) {
        handleNavigateUp();
      } else {
        navigate('/');
      }
    };

    return {
        viewMode,
        selectedNote,
        currentFolderId,
        userProfileQuery,
        handleSelectNote,
        handleBackToList,
        handleSelectFolder,
        handleNavigateUp,
        handleEscape,
        sortOrder,
        setSortOrder,
        searchQuery,
        setSearchQuery,
        searchedAndSortedFolders,
        searchedAndSortedNotes,
    }
}
