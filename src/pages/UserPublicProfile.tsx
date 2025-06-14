
import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AppHeader } from '@/components/AppHeader';
import { AppFooter } from '@/components/AppFooter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Folder as FolderIcon } from 'lucide-react';

const fetchUserProfileData = async (userId: string) => {
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, username')
    .eq('id', userId)
    .single();

  if (profileError) throw new Error('User not found');
  if (!profile) throw new Error('User not found');

  const { data: notes, error: notesError } = await supabase
    .from('notes')
    .select('*')
    .eq('user_id', profile.id);

  if (notesError) throw notesError;

  const { data: folders, error: foldersError } = await supabase
    .from('folders')
    .select('*')
    .eq('user_id', profile.id);

  if (foldersError) throw foldersError;

  return { profile, notes: notes || [], folders: folders || [] };
};

const UserPublicProfile = () => {
  const { userId } = useParams<{ userId: string }>();

  const { data, isLoading, error } = useQuery({
    queryKey: ['userProfile', userId],
    queryFn: () => fetchUserProfileData(userId!),
    enabled: !!userId,
  });

  // Basic folder/note rendering logic for now. Could be improved with recursion for nested folders.
  const rootFolders = data?.folders.filter(f => !f.parent_id);
  const rootNotes = data?.notes.filter(n => !n.folder_id);

  return (
    <div className="min-h-screen w-full flex flex-col bg-background p-4 md:p-8">
      <AppHeader />
      <main className="flex-grow container mx-auto px-4 py-8">
        {isLoading && <p className="text-center">Loading profile...</p>}
        {error && <p className="text-destructive text-center">{(error as Error).message}</p>}
        {data && (
          <div>
            <h1 className="text-3xl font-bold mb-8">Notes by {data.profile.username || 'Anonymous'}</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rootFolders?.map(folder => (
                <Card key={folder.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FolderIcon /> {folder.name}
                    </CardTitle>
                  </CardHeader>
                </Card>
              ))}
              {rootNotes?.map(note => (
                <Card key={note.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText /> {note.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="line-clamp-3">{note.content}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
            {data.notes.length === 0 && data.folders.length === 0 && (
              <p className="text-center text-muted-foreground">This user has no public notes yet.</p>
            )}
          </div>
        )}
      </main>
      <AppFooter />
    </div>
  );
};

export default UserPublicProfile;
