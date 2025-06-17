
import React from 'react';
import { HomeHeader } from '@/components/HomeHeader';
import { AppHeader } from '@/components/AppHeader';
import { AppFooter } from '@/components/AppFooter';
import NoteView from '@/components/NoteView';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import UserProfileHeader from '@/components/user-profile/UserProfileHeader';
import UserPublicListView from '@/components/user-profile/UserPublicListView';
import UserOwnListView from '@/components/user-profile/UserOwnListView';
import { usePublicProfileLogic } from '@/hooks/usePublicProfileLogic';
import { Button } from '@/components/ui/button';
import { Copy, Edit } from 'lucide-react';
import { toast } from 'sonner';
import { Toaster } from '@/components/ui/sonner';

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
    sortOrder,
    setSortOrder,
    searchQuery,
    setSearchQuery,
    searchedAndSortedFolders,
    searchedAndSortedNotes,
    isOwnProfile,
    handleGoToDashboard,
  } = usePublicProfileLogic();

  const {
    profile,
    allNotes,
    allFolders,
    isLoading,
    error,
    readmeNote,
  } = userProfileQuery;

  useKeyboardShortcuts({
    onNewNote: () => {},
    onToggleCommandMenu: () => {},
    onEscape: handleEscape,
    onSelectAll: () => {},
    onOpenShortcuts: () => {},
  });

  const handleCopyId = () => {
    if (selectedNote) {
      navigator.clipboard.writeText(selectedNote.id);
      toast.info("Note ID copied to clipboard.");
    }
  };

  const handleEditNote = () => {
    if (selectedNote && isOwnProfile) {
      // Navigate to dashboard with the note selected
      window.location.href = `/dashboard?note=${selectedNote.id}`;
    }
  };

  const isAtProfileRoot = viewMode === 'list' && !currentFolderId;

  // Use AppHeader for own profile, HomeHeader for public profiles
  const HeaderComponent = isOwnProfile ? AppHeader : HomeHeader;

  return (
    <div className="min-h-screen w-full flex flex-col bg-background" style={{ fontFamily: "Inter, sans-serif" }}>
      {isOwnProfile ? (
        <AppHeader
          onExportAllNotes={() => {}}
          viewMode={viewMode}
          onBackToList={viewMode === 'preview' ? handleBackToList : undefined}
          cheatSheetOpen={false}
          onCheatSheetOpenChange={() => {}}
          onNavigateUp={viewMode === 'list' && currentFolderId ? handleNavigateUp : undefined}
        />
      ) : (
        <HomeHeader
          onBackToList={viewMode === 'preview' ? handleBackToList : undefined}
          onNavigateUp={viewMode === 'list' && currentFolderId ? handleNavigateUp : undefined}
          showHomeButton={isAtProfileRoot}
        />
      )}
      
      <main className="flex-grow container mx-auto px-4 py-8">
        {isLoading && <p className="text-center">Loading profile...</p>}
        {error && <p className="text-destructive text-center">{(error as Error).message}</p>}
        {profile && (
          <div>
            <UserProfileHeader profile={profile} isOwnProfile={isOwnProfile} />

            {viewMode === 'list' ? (
              isOwnProfile ? (
                <UserOwnListView
                  filteredFolders={searchedAndSortedFolders}
                  notesForList={searchedAndSortedNotes}
                  allNotes={allNotes}
                  allFolders={allFolders}
                  currentFolderId={currentFolderId}
                  onSelectFolder={handleSelectFolder}
                  onSelectNote={handleSelectNote}
                  onNavigateUp={handleNavigateUp}
                  sortOrder={sortOrder}
                  onSortOrderChange={setSortOrder}
                  searchQuery={searchQuery}
                  onSearchQueryChange={setSearchQuery}
                  onGoToDashboard={handleGoToDashboard}
                />
              ) : (
                <UserPublicListView
                  filteredFolders={searchedAndSortedFolders}
                  notesForList={searchedAndSortedNotes}
                  allNotes={allNotes}
                  allFolders={allFolders}
                  currentFolderId={currentFolderId}
                  onSelectFolder={handleSelectFolder}
                  onSelectNote={handleSelectNote}
                  onNavigateUp={handleNavigateUp}
                  sortOrder={sortOrder}
                  onSortOrderChange={setSortOrder}
                  searchQuery={searchQuery}
                  onSearchQueryChange={setSearchQuery}
                />
              )
            ) : (
                <div className="flex-grow flex flex-col">
                  <div className="flex-grow">
                     <NoteView 
                        note={selectedNote}
                        allNotes={allNotes}
                        onSelectNote={handleSelectNote}
                     />
                  </div>
                  {selectedNote && (
                    <div className="flex items-center justify-end gap-2 mt-4 p-2 border-t sticky bottom-0 bg-background">
                      {isOwnProfile && (
                        <Button variant="outline" size="icon" title="Edit Note" onClick={handleEditNote}>
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                      <Button variant="outline" size="icon" title="Copy Note ID" onClick={handleCopyId}>
                          <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
            )}

            {viewMode === 'list' && !currentFolderId && !readmeNote && allNotes.length === 0 && allFolders.length === 0 && (
              <p className="text-center text-muted-foreground mt-12">
                {isOwnProfile ? "You have no notes yet." : "This user has no public notes yet."}
              </p>
            )}
          </div>
        )}
      </main>
      <AppFooter />
      <Toaster />
    </div>
  );
};

export default UserPublicProfile;
