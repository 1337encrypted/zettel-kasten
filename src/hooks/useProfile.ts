
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Profile } from '@/types';

export const useProfile = () => {
  const { user } = useAuth();

  const { data: profile } = useQuery<Profile | null>({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      if (error) {
        console.error("Error fetching profile", error);
        return null;
      }
      return data as Profile;
    },
    enabled: !!user,
  });

  return { profile };
};
