
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/components/ui/sonner';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { Globe, Lock, Loader2 } from 'lucide-react';
import type { Database } from '@/types/supabase';

type Profile = Database['public']['Tables']['profiles']['Row'];

const fetchProfile = async (userId: string): Promise<Profile | null> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') { // "Not found"
      return null;
    }
    throw new Error(error.message);
  }

  return data;
};

const updateProfileVisibility = async ({ userId, is_public }: { userId: string; is_public: boolean }) => {
  const { data, error } = await supabase
    .from('profiles')
    .update({ is_public })
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }
  return data;
};

export const ProfileVisibilityToggle = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const queryKey = ['profile', user?.id];

  const { data: profile, isLoading } = useQuery<Profile | null>({
    queryKey,
    queryFn: () => fetchProfile(user!.id),
    enabled: !!user,
  });

  const mutation = useMutation({
    mutationFn: updateProfileVisibility,
    onMutate: async (newProfileData) => {
      await queryClient.cancelQueries({ queryKey });
      const previousProfile = queryClient.getQueryData<Profile | null>(queryKey);
      queryClient.setQueryData<Profile | null>(queryKey, (old) => old ? { ...old, is_public: newProfileData.is_public } : null);
      return { previousProfile };
    },
    onSuccess: (data, variables) => {
      toast.success(`Your profile is now ${variables.is_public ? 'public' : 'private'}.`);
    },
    onError: (err: Error, newProfileData, context) => {
      if (context?.previousProfile) {
        queryClient.setQueryData(queryKey, context.previousProfile);
      }
      toast.error(`Failed to update visibility: ${err.message}`);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const handleToggle = (checked: boolean) => {
    if (user) {
      mutation.mutate({ userId: user.id, is_public: checked });
    }
  };
  
  if (!user) return null;

  return (
    <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="cursor-pointer">
      <div className="flex items-center justify-between w-full">
        <label htmlFor="profile-visibility" className="flex items-center cursor-pointer gap-2">
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            profile?.is_public ? <Globe className="h-4 w-4" /> : <Lock className="h-4 w-4" />
          )}
          <span>
            {isLoading
              ? 'Loading...'
              : profile?.is_public
              ? 'Public Profile'
              : 'Private Profile'}
          </span>
        </label>
        <Switch
          id="profile-visibility"
          checked={profile?.is_public ?? false}
          onCheckedChange={handleToggle}
          disabled={isLoading || mutation.isPending}
          aria-label="Toggle profile visibility"
        />
      </div>
    </DropdownMenuItem>
  );
};
