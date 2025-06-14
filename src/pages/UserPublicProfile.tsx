
import React, { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AppHeader } from '@/components/AppHeader';
import { AppFooter } from '@/components/AppFooter';
import NoteList from '@/components/NoteList';
import FolderList from '@/components/FolderList';
import NoteView from '@/components/NoteView';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowUp } from 'lucide-react';
import { useNavigationShortcuts } from '@/hooks/useNavigationShortcuts';
import { Note, Folder } from '@/types';
import { Database } from '@/types/supabase';

type NoteRow = Database['public']['Tables']['notes']['Row'];
type MappedNote = Omit<NoteRow, 'created_at' | 'updated_at'> & { createdAt: Date, updatedAt: Date };

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

  const notes: MappedNote[] = (notesData || []).map(note => ({
    ...note,
    createdAt: new Date(note.created_at),
    updatedAt: new Date(note.updated_at),
  }));

  const { data: folders, error: foldersError } = await supabase
    .from('folders')
    .select('*')
    .eq('user_id', profile.id);

  if (foldersError) throw foldersError;

  return { profile, notes, folders: folders || [] };
};

const UserPublicProfile = () => {
  const { userId } = useParams<{ userId: string }>();
  useNavigationShortcuts();

  const [viewMode, setViewMode] = useState<'list' | 'preview'>('list');
  const [selectedNote, setSelectedNote] = useState<MappedNote | null>(null);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ['userProfile', userId],
    queryFn: () => fetchUserProfileData(userId!),
    enabled: !!userId,
  });

  const { filteredFolders, filteredNotes, currentFolder } = useMemo(() => {
    if (!data) return { filteredFolders: [], filteredNotes: [], currentFolder: null };
    const folders = data.folders.filter(f => f.parent_id === currentFolderId);
    const notes = data.notes
      .filter(n => n.folder_id === currentFolderId)
      .sort((a, b) => a.title.localeCompare(b.title));
    const currentFolder = data.folders.find(f => f.id === currentFolderId) || null;
    return { filteredFolders: folders, filteredNotes: notes, currentFolder };
  }, [data, currentFolderId]);

  const allNotes = useMemo(() => data?.notes || [], [data]);

  const handleSelectNote = (note: Note) => {
    setSelectedNote(note as MappedNote);
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
    setCurrentFolderId(currentFolder?.parent_id || null);
  };

  return (
    <div className="min-h-screen w-full flex flex-col bg-background p-4 md:p-8">
      <AppHeader />
      <main className="flex-grow container mx-auto px-4 py-8">
        {isLoading && <p className="text-center">Loading profile...</p>}
        {error && <p className="text-destructive text-center">{(error as Error).message}</p>}
        {data && (
          <div>
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-bold">Notes by {data.profile.username || 'Anonymous'}</h1>
              {currentFolderId && (
                <Button variant="outline" onClick={handleNavigateUp}><ArrowUp className="mr-2" /> Up a level</Button>
              )}
            </div>

            {viewMode === 'list' ? (
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
                  notes={filteredNotes}
                  onSelectNote={handleSelectNote}
                  selectedNoteIds={[]}
                  onToggleNoteSelection={() => {}}
                />
                 {filteredFolders.length === 0 && filteredNotes.length === 0 && (
                  <div className="text-center text-muted-foreground pt-8">
                    <p className="font-mono text-lg"># Empty</p>
                    <p>This folder is empty.</p>
                  </div>
                )}
              </div>
            ) : (
                <div className="flex-grow flex flex-col">
                  <div className="flex-grow">
                     <NoteView 
                        note={selectedNote as Note | null}
                        allNotes={allNotes}
                        onSelectNote={handleSelectNote}
                     />
                  </div>
                  <div className="flex items-center justify-between mt-4 p-2 border-t sticky bottom-0 bg-background">
                    <Button variant="outline" onClick={handleBackToList} size="icon" title="Back to List">
                      <ArrowLeft />
                    </Button>
                  </div>
                </div>
            )}

            {viewMode === 'list' && !currentFolderId && allNotes.length === 0 && data.folders.length === 0 && (
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
