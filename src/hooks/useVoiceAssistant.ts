
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface VoiceConversation {
  id: string;
  user_id: string;
  session_id: string;
  message_type: string;
  content: string;
  audio_url?: string;
  note_references?: string[];
  created_at: string;
}

export const useVoiceAssistant = (sessionId: string) => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<VoiceConversation[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadConversations = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('voice_conversations')
        .select('*')
        .eq('user_id', user.id)
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setConversations(data || []);
    } catch (error) {
      console.error('Error loading conversations:', error);
      toast.error('Failed to load conversation history');
    }
  };

  const sendMessage = async (message: string) => {
    if (!user || !message.trim()) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('voice-assistant', {
        body: {
          text: message.trim(),
          user_id: user.id,
          session_id: sessionId,
        },
      });

      if (error) throw error;
      
      // Reload conversations to get the latest messages
      await loadConversations();
      
      return data;
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const sendAudioMessage = async (audioBlob: Blob) => {
    if (!user) return;

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.wav');
      formData.append('user_id', user.id);
      formData.append('session_id', sessionId);

      const { data, error } = await supabase.functions.invoke('voice-assistant', {
        body: formData,
      });

      if (error) throw error;
      
      // Reload conversations to get the latest messages
      await loadConversations();
      
      return data;
    } catch (error) {
      console.error('Error sending audio message:', error);
      toast.error('Failed to process voice message');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const clearSession = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('voice_conversations')
        .delete()
        .eq('user_id', user.id)
        .eq('session_id', sessionId);

      if (error) throw error;
      
      setConversations([]);
      toast.success('Conversation cleared');
    } catch (error) {
      console.error('Error clearing session:', error);
      toast.error('Failed to clear conversation');
    }
  };

  useEffect(() => {
    loadConversations();
  }, [user, sessionId]);

  return {
    conversations,
    isLoading,
    sendMessage,
    sendAudioMessage,
    clearSession,
    loadConversations,
  };
};
