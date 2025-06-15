
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

const checkIsAdmin = async (userId: string) => {
  const { data, error } = await supabase.rpc('is_admin', { user_id: userId });
  if (error) {
    console.error('Error checking admin status:', error);
    return false;
  };
  return data;
};

export const useIsAdmin = () => {
  const { user } = useAuth();

  const { data: isAdmin, isLoading } = useQuery({
    queryKey: ['isAdmin', user?.id],
    queryFn: () => checkIsAdmin(user!.id),
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return { isAdmin: isAdmin ?? false, isLoading };
};
