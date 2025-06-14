import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AppHeader } from '@/components/AppHeader';
import { AppFooter } from '@/components/AppFooter';
import NoteList from '@/components/NoteList';
import FolderList from '@/components/FolderList';
import NoteView from '@/components/NoteView';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { Note, Folder } from '@/types';

const fetchUserProfileData = async (userId: string) => {
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, username')
    .eq('id', userId)
    .single();

  if (profileError) throw new Error('User not found');
  if (!profile) throw new Error('User not found');

  const { data: notesData, error: notesError } = await supabase
    .from('notes')
    .select('*')
    .eq('user_id', profile.id);

  if (notesError) throw notesError;

  const notes: Note[] = (notesData || []).map(note => ({
    id: note.id,
    title: note.title,
    content: note.content ?? '',
    createdAt: new Date(note.created_at),
    updatedAt: new Date(note.updated_at),
    folderId: note.folder_id ?? undefined,
    tags: note.tags ?? undefined,
  }));

  const { data: foldersData, error: foldersError } = await supabase
    .from('folders')
    .select('*')
    .eq('user_id', profile.id);

  if (foldersError) throw foldersError;

  const folders: Folder[] = (foldersData || []).map(folder => ({
    id: folder.id,
    name: folder.name,
    createdAt: new Date(folder.created_at),
    parentId: folder.parent_id,
  }));

  return { profile, notes, folders };
};

const UserPublicProfile = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();

  const [viewMode, setViewMode] = useState<'list' | 'preview'>('list');
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ['userProfile', userId],
    queryFn: () => fetchUserProfileData(userId!),
    enabled: !!userId,
  });

  const { filteredFolders, filteredNotes, currentFolder } = useMemo(() => {
    if (!data) return { filteredFolders: [], filteredNotes: [], currentFolder: null };
    const folders = data.folders.filter(f => f.parentId === currentFolderId);
    const notes = data.notes
      .filter(n => n.folderId === currentFolderId || (!n.folderId && currentFolderId === null))
      .sort((a, b) => a.title.localeCompare(b.title));
    const currentFolder = data.folders.find(f => f.id === currentFolderId) || null;
    return { filteredFolders: folders, filteredNotes: notes, currentFolder };
  }, [data, currentFolderId]);

  const readmeNote = useMemo(() => {
    return filteredNotes.find(n => n.title.toLowerCase() === 'readme');
  }, [filteredNotes]);

  const notesForList = useMemo(() => {
    if (readmeNote) {
      return filteredNotes.filter(n => n.id !== readmeNote.id);
    }
    return filteredNotes;
  }, [filteredNotes, readmeNote]);

  const allNotes = useMemo(() => data?.notes || [], [data]);

  const handleSelectNote = (note: Note) => {
    setSelectedNote(note);
    setViewMode('preview');
  };

  const handleBackToList = () => {
    setViewMode('list');
    setSelectedNote(null);
  };

  const handleSelectFolder = (folderId: string) => {
    setCurrentFolderId(folderId);
  };

  const handleNavigateUp = () => {
    if (!currentFolderId || !data) return;
    const currentFolder = data.folders.find(f => f.id === currentFolderId);
    setCurrentFolderId(currentFolder?.parentId || null);
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
        {data && (
          <div>
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-bold">Notes by {data.profile.username || 'Anonymous'}</h1>
            </div>

            {viewMode === 'list' ? (
              <div>
                <div className="space-y-6">
                  <FolderList
                    folders={filteredFolders}
                    notes={allNotes}
                    currentFolderId={currentFolderId}
                    onSelectFolder={handleSelectFolder}
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

            {viewMode === 'list' && !currentFolderId && !readmeNote && allNotes.length === 0 && data.folders.length === 0 && (
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
