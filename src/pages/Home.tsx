import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { HomeHeader } from '@/components/HomeHeader';
import { AppFooter } from '@/components/AppFooter';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { User, Clock } from 'lucide-react';
import { Toaster } from '@/components/ui/sonner';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { useNavigationShortcuts } from '@/hooks/useNavigationShortcuts';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useDebounce } from '@/hooks/useDebounce';
import { NoteSearchResultCard } from '@/components/search/NoteSearchResultCard';
import { UserSearchResultCard } from '@/components/search/UserSearchResultCard';

interface UserProfile {
  id: string;
  username: string | null;
  note_count: number;
  created_at: string | null;
  avatar_url: string | null;
  updated_at: string | null;
}

const fetchUsersWithNoteCounts = async (): Promise<UserProfile[]> => {
  const { data, error } = await supabase.rpc('get_users_with_public_note_counts');
  
  if (error) {
    console.error('Error fetching users with note counts:', error);
    throw error;
  }

  return (data as any || []) as UserProfile[];
};

interface SearchResult {
    result_type: 'user' | 'note';
    result_id: string;
    username: string | null;
    user_avatar_url: string | null;
    user_updated_at: string | null;
    note_title: string | null;
    note_slug: string | null;
    note_updated_at: string | null;
    note_tags: string[] | null;
    note_author_id: string | null;
    note_author_username: string | null;
    note_author_avatar_url: string | null;
    note_author_updated_at: string | null;
}

const searchPublicContent = async (searchTerm: string): Promise<SearchResult[]> => {
    if (!searchTerm.trim()) return [];
    const { data, error } = await supabase.rpc('search_public_content', { p_search_term: searchTerm });

    if (error) {
        console.error('Error searching public content:', error);
        throw error;
    }

    return (data as any || []) as SearchResult[];
}

const Home = () => {
  useNavigationShortcuts();
  const [search, setSearch] = React.useState('');
  const debouncedSearch = useDebounce(search, 300);

  const { data: users, isLoading: isLoadingUsers, error: usersError } = useQuery({
    queryKey: ['usersWithNoteCounts'],
    queryFn: fetchUsersWithNoteCounts,
    retry: false,
    enabled: !debouncedSearch,
  });

  const { data: searchResults, isLoading: isLoadingSearch, error: searchError } = useQuery({
      queryKey: ['publicSearch', debouncedSearch],
      queryFn: () => searchPublicContent(debouncedSearch),
      enabled: !!debouncedSearch,
      retry: false,
  });

  return (
    <div className="min-h-screen w-full flex flex-col bg-background" style={{ fontFamily: "Inter, sans-serif" }}>
      <HomeHeader />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="mb-8 max-w-lg mx-auto">
          <Input 
            placeholder="Search for users, notes, or tags..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        {(isLoadingUsers || isLoadingSearch) && <p className="text-center">Loading...</p>}
        {usersError && <p className="text-destructive text-center">Could not load users. Please try again later.</p>}
        {searchError && <p className="text-destructive text-center">Could not perform search. Please try again later.</p>}
        <div className="flex flex-col gap-4 max-w-3xl mx-auto w-full">
          {debouncedSearch ? (
            <>
              {searchResults && searchResults.length > 0 ? (
                searchResults.map(result => {
                    if (result.result_type === 'user') {
                        return <UserSearchResultCard key={`user-${result.result_id}`} result={result as any} />;
                    }
                    if (result.result_type === 'note') {
                        return <NoteSearchResultCard key={`note-${result.result_id}`} result={result as any} />;
                    }
                    return null;
                })
              ) : (
                !isLoadingSearch && <p className="text-center text-muted-foreground">No results found for "{debouncedSearch}".</p>
              )}
            </>
          ) : (
            users?.map(user => {
            const uniqueAvatarUrl = user.avatar_url && user.updated_at ? `${user.avatar_url}?t=${new Date(user.updated_at).getTime()}` : user.avatar_url;
            return (
              <Link to={`/u/${user.id}`} key={user.id}>
                <Card className="hover:bg-muted/50 transition-colors w-full">
                  <div className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                          <Avatar>
                              <AvatarImage src={uniqueAvatarUrl || undefined} alt={user.username || 'Anonymous'} />
                              <AvatarFallback>
                                  {(user.username || 'A').charAt(0).toUpperCase()}
                              </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-semibold text-lg">{user.username || 'Anonymous'}</p>
                            {user.created_at && (
                                <p className="text-sm text-muted-foreground flex items-center gap-1">
                                    <Clock className="h-4 w-4" />
                                    Joined {formatDistanceToNow(new Date(user.created_at), { addSuffix: true })}
                                </p>
                            )}
                          </div>
                      </div>
                      <div className="text-right">
                         <p className="font-semibold text-lg">{user.note_count}</p>
                         <p className="text-sm text-muted-foreground">{user.note_count === 1 ? 'note' : 'notes'}</p>
                      </div>
                  </div>
                </Card>
              </Link>
            )
          })
          )}
        </div>
      </main>
      <AppFooter />
      <Toaster />
    </div>
  );
};

export default Home;
