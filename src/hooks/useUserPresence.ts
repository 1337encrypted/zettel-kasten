
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

interface UserPresence {
  user_id: string;
  username: string;
  online_at: string;
}

export const useUserPresence = () => {
  const { user } = useAuth();
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!user) return;

    const channel = supabase.channel('user_presence');

    // Track current user's presence
    const userStatus = {
      user_id: user.id,
      username: user.email,
      online_at: new Date().toISOString(),
    };

    channel
      .on('presence', { event: 'sync' }, () => {
        const presenceState = channel.presenceState();
        const onlineUserIds = new Set<string>();
        
        Object.keys(presenceState).forEach(key => {
          const presences = presenceState[key] as UserPresence[];
          presences.forEach(presence => {
            onlineUserIds.add(presence.user_id);
          });
        });
        
        setOnlineUsers(onlineUserIds);
      })
      .on('presence', { event: 'join' }, ({ newPresences }) => {
        const newUserIds = new Set(onlineUsers);
        (newPresences as UserPresence[]).forEach(presence => {
          newUserIds.add(presence.user_id);
        });
        setOnlineUsers(newUserIds);
      })
      .on('presence', { event: 'leave' }, ({ leftPresences }) => {
        const remainingUserIds = new Set(onlineUsers);
        (leftPresences as UserPresence[]).forEach(presence => {
          remainingUserIds.delete(presence.user_id);
        });
        setOnlineUsers(remainingUserIds);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track(userStatus);
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return onlineUsers;
};
