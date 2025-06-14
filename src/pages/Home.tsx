import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AppHeader } from '@/components/AppHeader';
import { AppFooter } from '@/components/AppFooter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { User, Clock } from 'lucide-react';
import { Toaster } from '@/components/ui/sonner';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

interface UserProfile {
  id: string;
  username: string | null;
  note_count: number;
  created_at: string | null;
}

const fetchUsersWithNoteCounts = async () => {
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('id, username, created_at');
  
  if (profilesError) throw profilesError;

  const { data: notes, error: notesError } = await supabase
    .from('notes')
    .select('user_id');

  if (notesError) throw notesError;

  const noteCounts = (notes || []).reduce((acc, note) => {
    if (note.user_id) {
      acc[note.user_id] = (acc[note.user_id] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  const usersWithCounts: UserProfile[] = (profiles || []).map(profile => ({
    ...profile,
    note_count: noteCounts[profile.id] || 0,
  })).sort((a, b) => b.note_count - a.note_count);

  return usersWithCounts;
};

const Home = () => {
  const [search, setSearch] = React.useState('');
  const { data: users, isLoading, error } = useQuery({
    queryKey: ['usersWithNoteCounts'],
    queryFn: fetchUsersWithNoteCounts,
    retry: false,
  });

  const filteredUsers = users?.filter(user => 
    (user.username || 'anonymous').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen w-full flex flex-col bg-background p-4 md:p-8" style={{ fontFamily: "Inter, sans-serif" }}>
      <AppHeader />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-primary tracking-wide">Welcome to Zet</h1>
            <p className="text-xl text-muted-foreground mt-2">Discover and read notes from our community.</p>
        </div>
        <div className="mb-8 max-w-lg mx-auto">
          <Input 
            placeholder="Search for users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        {isLoading && <p className="text-center">Loading users...</p>}
        {error && <p className="text-destructive text-center">Could not load users. For this to work, RLS policies on 'profiles' and 'notes' tables must allow public read access.</p>}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUsers?.map(user => (
            <Link to={`/u/${user.id}`} key={user.id}>
              <Card className="h-full hover:bg-muted/50 transition-colors">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User />
                    {user.username || 'Anonymous'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{user.note_count} {user.note_count === 1 ? 'note' : 'notes'}</p>
                  {user.created_at && (
                    <p className="text-sm text-muted-foreground mt-2 flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      Joined {formatDistanceToNow(new Date(user.created_at), { addSuffix: true })}
                    </p>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </main>
      <AppFooter />
      <Toaster />
    </div>
  );
};

export default Home;
