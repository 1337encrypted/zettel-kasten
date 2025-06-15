
import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/components/ui/sonner';
import { Loader2 } from 'lucide-react';
import { AppHeader } from '@/components/AppHeader';
import { useAuth } from '@/context/AuthContext';

type Profile = {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  website: string | null;
  created_at: string;
  updated_at: string | null;
};

type UserWithRole = Profile & { isAdmin: boolean };

const fetchUsersAndRoles = async (): Promise<UserWithRole[]> => {
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('*');

  if (profilesError) {
    toast.error(`Error fetching profiles: ${profilesError.message}`);
    throw profilesError;
  }

  const { data: roles, error: rolesError } = await supabase
    .from('user_roles')
    .select('user_id, role');

  if (rolesError) {
    toast.error(`Error fetching roles: ${rolesError.message}`);
    throw rolesError;
  }

  const usersWithRoles = profiles.map(profile => {
    const userRoles = roles.filter(r => r.user_id === profile.id);
    const isAdmin = userRoles.some(r => r.role === 'admin');
    return { ...profile, isAdmin };
  });

  return usersWithRoles;
};

const updateUserAdminStatus = async ({ userId, isAdmin }: { userId: string; isAdmin: boolean }) => {
  if (isAdmin) {
    const { error } = await supabase.from('user_roles').insert({ user_id: userId, role: 'admin' });
    if (error) {
      toast.error(`Error granting admin role: ${error.message}`);
      throw error;
    }
  } else {
    const { error } = await supabase.from('user_roles').delete().match({ user_id: userId, role: 'admin' });
    if (error) {
      toast.error(`Error revoking admin role: ${error.message}`);
      throw error;
    }
  }
};

const AdminPage = () => {
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuth();
  const { data: users, isLoading, error } = useQuery<UserWithRole[]>({
    queryKey: ['usersWithRoles'],
    queryFn: fetchUsersAndRoles,
  });

  const mutation = useMutation({
    mutationFn: updateUserAdminStatus,
    onSuccess: (_, variables) => {
      toast.success('User role updated successfully.');
      queryClient.invalidateQueries({ queryKey: ['usersWithRoles'] });
      // also invalidate isAdmin for the current user if their role changed
      if (variables.userId === currentUser?.id) {
        queryClient.invalidateQueries({ queryKey: ['isAdmin', currentUser.id] });
      }
    },
  });

  const handleAdminToggle = (userId: string, currentIsAdmin: boolean) => {
    if (userId === currentUser?.id) {
        toast.error("You cannot change your own admin status.");
        return;
    }
    mutation.mutate({ userId, isAdmin: !currentIsAdmin });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="animate-spin" size={48} />
      </div>
    );
  }

  if (error) {
    return <div className="text-destructive text-center p-4">Error loading users. Please try again later.</div>;
  }

  return (
    <div className="min-h-screen w-full flex flex-col bg-background p-4 md:p-8">
      <AppHeader />
      <main className="flex-grow container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6">User Management</h1>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Username</TableHead>
                <TableHead>Full Name</TableHead>
                <TableHead>Is Admin</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users?.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.username || 'N/A'}</TableCell>
                  <TableCell>{user.full_name || 'N/A'}</TableCell>
                  <TableCell>
                    <Switch
                      checked={user.isAdmin}
                      onCheckedChange={() => handleAdminToggle(user.id, user.isAdmin)}
                      disabled={mutation.isPending || user.id === currentUser?.id}
                      aria-label={`Toggle admin status for ${user.username}`}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </main>
    </div>
  );
};

export default AdminPage;
