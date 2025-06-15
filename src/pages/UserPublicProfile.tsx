import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { AppHeader } from '@/components/AppHeader';
import { AppFooter } from '@/components/AppFooter';
import NoteList from '@/components/NoteList';
import FolderList from '@/components/FolderList';
import NoteView from '@/components/NoteView';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { Note, Folder } from '@/types';
import { useUserProfile } from '@/hooks/useUserProfile';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Link2 } from 'lucide-react';

const UserPublicProfile = () => {
  const params = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const userId = params.userId;
  const slug = params['*'];

  const [viewMode, setViewMode] = useState<'list' | 'preview'>('list');
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);

  const {
    profile,
    allNotes,
    allFolders,
    isLoading,
    error,
    filteredFolders,
    notesForList,
    readmeNote,
    currentFolder,
  } = useUserProfile(userId, currentFolderId);

  useEffect(() => {
    if (!userId || isLoading) return;

    if (!slug) {
      setCurrentFolderId(null);
      setSelectedNote(null);
      setViewMode('list');
      return;
    }
    
    if (allNotes.length > 0 || allFolders.length > 0) {
      // Find note or folder by slug. Assumes slugs are unique per user.
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
    if (folder.slug) {
      navigate(`/u/${userId}/${folder.slug}`);
    } else {
      setCurrentFolderId(folder.id);
    }
  };

  const handleNavigateUp = () => {
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

  useKeyboardShortcuts({
    onNewNote: () => {},
    onToggleCommandMenu: () => {},
    onEscape: handleEscape,
    onSelectAll: () => {},
    onOpenShortcuts: () => {},
  });

  return (
    <div className="min-h-screen w-full flex flex-col bg-background p-4 md:p-8">
      <AppHeader
        viewMode={viewMode}
        onBackToList={handleBackToList}
        onNavigateUp={currentFolderId ? handleNavigateUp : undefined}
      />
      <main className="flex-grow container mx-auto px-4 py-8">
        {isLoading && <p className="text-center">Loading profile...</p>}
        {error && <p className="text-destructive text-center">{(error as Error).message}</p>}
        {profile && (
          <div>
            <div className="flex items-center gap-4 mb-8">
              <Avatar className="h-16 w-16">
                <AvatarImage src={profile.avatar_url ? `${profile.avatar_url}?t=${new Date(profile.updated_at || Date.now()).getTime()}` : undefined} alt={profile.username || 'Anonymous'} />
                <AvatarFallback className="text-2xl">
                    {(profile.username || 'A').charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <h1 className="text-3xl font-bold">Notes by {profile.username || 'Anonymous'}</h1>
            </div>
            <p className="mb-4 text-muted-foreground flex items-center gap-2">
                <Link2 className="w-4 h-4" />
                Public profile link: <a href={window.location.href} className="text-primary hover:underline">{window.location.href}</a>
            </p>

            {viewMode === 'list' ? (
              <div>
                <div className="space-y-6">
                  <FolderList
                    folders={filteredFolders}
                    notes={allNotes}
                    currentFolderId={currentFolderId}
                    onSelectFolder={(folderId) => {
                        const folder = allFolders.find(f => f.id === folderId);
                        if (folder) handleSelectFolder(folder);
                    }}
                    onNavigateUp={handleNavigateUp}
                    onDeleteFolder={() => {}}
                    onRenameFolder={() => {}}
                    isPublicView={true}
                  />
                  <NoteList
                    notes={notesForList}
                    onSelectNote={handleSelectNote}
                    selectedNoteIds={[]}
                    onToggleNoteSelection={() => {}}
                  />
                   {filteredFolders.length === 0 && notesForList.length === 0 && (
                    <div className="text-center text-muted-foreground pt-8">
                      <p className="font-mono text-lg"># Empty</p>
                      <p>This folder is empty.</p>
                    </div>
                  )}
                </div>
                {readmeNote && (
                  <div className="mt-8">
                    <NoteView 
                      note={readmeNote} 
                      allNotes={allNotes} 
                      onSelectNote={handleSelectNote} 
                    />
                  </div>
                )}
              </div>
            ) : (
                <div className="flex-grow flex flex-col">
                  <div className="flex-grow">
                     <NoteView 
                        note={selectedNote}
                        allNotes={allNotes}
                        onSelectNote={handleSelectNote}
                     />
                  </div>
                </div>
            )}

            {viewMode === 'list' && !currentFolderId && !readmeNote && allNotes.length === 0 && allFolders.length === 0 && (
              <p className="text-center text-muted-foreground mt-12">This user has no public notes yet.</p>
            )}
          </div>
        )}
      </main>
      <AppFooter />
    </div>
  );
};

export default UserPublicProfile;
