
import React from 'react';
import { HomeHeader } from '@/components/HomeHeader';
import { AppFooter } from '@/components/AppFooter';
import NoteView from '@/components/NoteView';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import UserProfileHeader from '@/components/user-profile/UserProfileHeader';
import UserPublicListView from '@/components/user-profile/UserPublicListView';
import { usePublicProfileLogic } from '@/hooks/usePublicProfileLogic';

const UserPublicProfile = () => {
  const {
    viewMode,
    selectedNote,
    currentFolderId,
    userProfileQuery,
    handleSelectNote,
    handleBackToList,
    handleSelectFolder,
    handleNavigateUp,
    handleEscape,
  } = usePublicProfileLogic();

  const {
    profile,
    allNotes,
    allFolders,
    isLoading,
    error,
    filteredFolders,
    notesForList,
    readmeNote,
  } = userProfileQuery;

  useKeyboardShortcuts({
    onNewNote: () => {},
    onToggleCommandMenu: () => {},
    onEscape: handleEscape,
    onSelectAll: () => {},
    onOpenShortcuts: () => {},
  });

  const isAtProfileRoot = viewMode === 'list' && !currentFolderId;

  return (
    <div className="min-h-screen w-full flex flex-col bg-background">
      <HomeHeader
        onBackToList={viewMode === 'preview' ? handleBackToList : undefined}
        onNavigateUp={currentFolderId ? handleNavigateUp : undefined}
        showHomeButton={isAtProfileRoot}
      />
      <main className="flex-grow container mx-auto px-4 py-8">
        {isLoading && <p className="text-center">Loading profile...</p>}
        {error && <p className="text-destructive text-center">{(error as Error).message}</p>}
        {profile && (
          <div>
            <UserProfileHeader profile={profile} />

            {viewMode === 'list' ? (
              <UserPublicListView
                filteredFolders={filteredFolders}
                notesForList={notesForList}
                allNotes={allNotes}
                allFolders={allFolders}
                currentFolderId={currentFolderId}
                readmeNote={readmeNote}
                onSelectFolder={handleSelectFolder}
                onSelectNote={handleSelectNote}
                onNavigateUp={handleNavigateUp}
              />
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
