
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Mic, MicOff, Volume2, VolumeX, Loader2, Send } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Textarea } from '@/components/ui/textarea';

interface VoiceMessage {
  id: string;
  message_type: 'user' | 'assistant';
  content: string;
  audio_url?: string;
  note_references?: string[];
  created_at: string;
}

export const VoiceAssistant: React.FC = () => {
  const { user } = useAuth();
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<VoiceMessage[]>([]);
  const [textInput, setTextInput] = useState('');
  const [sessionId] = useState(() => crypto.randomUUID());
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Load conversation history
  useEffect(() => {
    if (user) {
      loadConversationHistory();
    }
  }, [user, sessionId]);

  const loadConversationHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('voice_conversations')
        .select('*')
        .eq('user_id', user?.id)
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error loading conversation history:', error);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        await processAudioMessage(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
      toast.error('Failed to start recording. Please check microphone permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const processAudioMessage = async (audioBlob: Blob) => {
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

      // Reload conversation to get the latest messages
      await loadConversationHistory();
      
      // Play assistant response if audio is available
      if (data.assistant_audio_url) {
        playAudio(data.assistant_audio_url);
      }
    } catch (error) {
      console.error('Error processing audio message:', error);
      toast.error('Failed to process voice message. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const sendTextMessage = async () => {
    if (!user || !textInput.trim()) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('voice-assistant', {
        body: {
          text: textInput.trim(),
          user_id: user.id,
          session_id: sessionId,
        },
      });

      if (error) throw error;

      setTextInput('');
      await loadConversationHistory();
      
      // Play assistant response if audio is available
      if (data.assistant_audio_url) {
        playAudio(data.assistant_audio_url);
      }
    } catch (error) {
      console.error('Error sending text message:', error);
      toast.error('Failed to send message. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const playAudio = (audioUrl: string) => {
    if (audioRef.current) {
      audioRef.current.src = audioUrl;
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const toggleAudioPlayback = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  if (!user) {
    return (
      <Card className="p-6 text-center">
        <p className="text-muted-foreground">Please log in to use the voice assistant.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <h2 className="text-lg font-semibold mb-4">AI Voice Assistant</h2>
        
        {/* Conversation History */}
        <div className="max-h-96 overflow-y-auto space-y-3 mb-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.message_type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.message_type === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                }`}
              >
                <p className="text-sm">{message.content}</p>
                {message.audio_url && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-1 p-1 h-auto"
                    onClick={() => playAudio(message.audio_url!)}
                  >
                    <Volume2 className="h-3 w-3" />
                  </Button>
                )}
                {message.note_references && message.note_references.length > 0 && (
                  <div className="mt-2 text-xs text-muted-foreground">
                    Referenced {message.note_references.length} note(s)
                  </div>
                )}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-muted px-4 py-2 rounded-lg">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            </div>
          )}
        </div>

        {/* Input Controls */}
        <div className="space-y-3">
          {/* Text Input */}
          <div className="flex gap-2">
            <Textarea
              placeholder="Type your message to the assistant..."
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendTextMessage();
                }
              }}
              className="flex-1 min-h-[80px]"
              disabled={isLoading}
            />
            <Button
              onClick={sendTextMessage}
              disabled={!textInput.trim() || isLoading}
              size="icon"
              className="self-end"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>

          {/* Voice Controls */}
          <div className="flex justify-center gap-4">
            <Button
              variant={isRecording ? "destructive" : "default"}
              size="lg"
              onClick={isRecording ? stopRecording : startRecording}
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              {isRecording ? (
                <>
                  <MicOff className="h-5 w-5" />
                  Stop Recording
                </>
              ) : (
                <>
                  <Mic className="h-5 w-5" />
                  Start Recording
                </>
              )}
            </Button>

            <Button
              variant="outline"
              size="lg"
              onClick={toggleAudioPlayback}
              disabled={!audioRef.current}
              className="flex items-center gap-2"
            >
              {isPlaying ? (
                <>
                  <VolumeX className="h-5 w-5" />
                  Pause
                </>
              ) : (
                <>
                  <Volume2 className="h-5 w-5" />
                  Play
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Hidden audio element for playback */}
        <audio
          ref={audioRef}
          onEnded={() => setIsPlaying(false)}
          onPause={() => setIsPlaying(false)}
          onPlay={() => setIsPlaying(true)}
          style={{ display: 'none' }}
        />
      </Card>
    </div>
  );
};
