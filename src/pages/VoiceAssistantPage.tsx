
import React from 'react';
import { VoiceAssistant } from '@/components/VoiceAssistant';

const VoiceAssistantPage = () => {
  return (
    <div className="min-h-screen w-full flex flex-col bg-background p-4 md:p-8" style={{ fontFamily: "Inter, sans-serif" }}>
      <div className="max-w-4xl mx-auto w-full">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">AI Voice Assistant</h1>
          <p className="text-muted-foreground">
            Meet Zoe, your intelligent voice assistant for exploring and connecting your knowledge.
          </p>
        </div>
        
        <VoiceAssistant />
      </div>
    </div>
  );
};

export default VoiceAssistantPage;
