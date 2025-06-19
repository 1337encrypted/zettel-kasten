
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface VoiceAssistantRequest {
  text?: string;
  user_id: string;
  session_id: string;
}

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const openaiApiKey = Deno.env.get("OPENAI_API_KEY");

const supabase = createClient(supabaseUrl, supabaseKey);

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!openaiApiKey) {
      throw new Error("OpenAI API key not configured");
    }

    let userMessage = "";
    let audioBlob: Blob | null = null;
    let userId = "";
    let sessionId = "";

    // Handle both form-data (audio) and JSON (text) requests
    const contentType = req.headers.get("content-type");
    
    if (contentType?.includes("multipart/form-data")) {
      const formData = await req.formData();
      audioBlob = formData.get("audio") as Blob;
      userId = formData.get("user_id") as string;
      sessionId = formData.get("session_id") as string;

      if (audioBlob) {
        // Transcribe audio using OpenAI Whisper
        const transcriptionFormData = new FormData();
        transcriptionFormData.append("file", audioBlob, "audio.wav");
        transcriptionFormData.append("model", "whisper-1");

        const transcriptionResponse = await fetch("https://api.openai.com/v1/audio/transcriptions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${openaiApiKey}`,
          },
          body: transcriptionFormData,
        });

        if (!transcriptionResponse.ok) {
          throw new Error("Failed to transcribe audio");
        }

        const transcriptionData = await transcriptionResponse.json();
        userMessage = transcriptionData.text;
      }
    } else {
      const requestData: VoiceAssistantRequest = await req.json();
      userMessage = requestData.text || "";
      userId = requestData.user_id;
      sessionId = requestData.session_id;
    }

    if (!userMessage || !userId) {
      throw new Error("Missing required fields");
    }

    // Store user message
    const { error: userMessageError } = await supabase
      .from("voice_conversations")
      .insert({
        user_id: userId,
        session_id: sessionId,
        message_type: "user",
        content: userMessage,
      });

    if (userMessageError) {
      throw userMessageError;
    }

    // Get user's notes for context
    const { data: userNotes, error: notesError } = await supabase
      .from("notes")
      .select("id, title, content, tags")
      .eq("user_id", userId)
      .limit(50);

    if (notesError) {
      console.error("Error fetching user notes:", notesError);
    }

    // Create embeddings for the user's query
    const embeddingResponse = await fetch("https://api.openai.com/v1/embeddings", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openaiApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "text-embedding-3-small",
        input: userMessage,
        encoding_format: "float",
      }),
    });

    let relevantNotes: any[] = [];
    let referencedNoteIds: string[] = [];

    if (embeddingResponse.ok) {
      const embeddingData = await embeddingResponse.json();
      const queryEmbedding = embeddingData.data[0].embedding;

      // Search for similar notes
      const { data: similarNotes, error: searchError } = await supabase
        .rpc("search_notes_by_similarity", {
          p_user_id: userId,
          p_query_embedding: JSON.stringify(queryEmbedding),
          p_limit: 5,
        });

      if (!searchError && similarNotes) {
        relevantNotes = similarNotes.filter((note: any) => note.similarity > 0.7);
        referencedNoteIds = relevantNotes.map((note: any) => note.note_id);
      }
    }

    // Prepare context for the AI assistant
    const notesContext = relevantNotes.length > 0 
      ? relevantNotes.map((note: any) => `Title: ${note.title}\nContent: ${note.content}\nTags: ${note.tags?.join(", ") || "None"}`).join("\n\n")
      : userNotes?.slice(0, 10).map((note: any) => `Title: ${note.title}\nContent: ${note.content?.substring(0, 200)}...`).join("\n\n") || "No notes available";

    const systemPrompt = `You are Zoe, an AI voice assistant for a personal knowledge management system called Zet. You are warm, curious, and intellectually engaging. Your role is to help users explore, reflect on, connect, and recall their knowledge through natural conversation.

Your personality:
- Warm and encouraging, like a thoughtful friend who genuinely cares about learning
- Intellectually curious and insightful
- Able to spot patterns and connections across different ideas
- Patient and supportive, especially when users are struggling with complex thoughts
- Occasionally playful and humorous when appropriate

Your capabilities:
- Help users explore their notes and knowledge base
- Ask thought-provoking questions to deepen understanding
- Suggest connections between different ideas and concepts
- Assist with reflection on learning progress and insights
- Help recall specific information from their notes
- Encourage intellectual curiosity and deeper thinking

Context about the user's notes:
${notesContext}

Always be conversational and natural. Ask follow-up questions to understand what the user really needs. If you reference specific notes, be specific about which ones you're referring to.`;

    // Generate AI response
    const completionResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openaiApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage }
        ],
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    if (!completionResponse.ok) {
      throw new Error("Failed to generate AI response");
    }

    const completionData = await completionResponse.json();
    const assistantMessage = completionData.choices[0].message.content;

    // Generate speech from the assistant's response
    const speechResponse = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openaiApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "tts-1",
        voice: "nova",
        input: assistantMessage,
        response_format: "mp3",
      }),
    });

    let audioUrl = null;
    if (speechResponse.ok) {
      const audioData = await speechResponse.arrayBuffer();
      
      // Upload audio to Supabase Storage (you'll need to create a bucket called 'voice-responses')
      const audioFileName = `${sessionId}-${Date.now()}.mp3`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("voice-responses")
        .upload(audioFileName, audioData, {
          contentType: "audio/mpeg",
        });

      if (!uploadError && uploadData) {
        const { data: urlData } = supabase.storage
          .from("voice-responses")
          .getPublicUrl(audioFileName);
        audioUrl = urlData.publicUrl;
      }
    }

    // Store assistant message
    const { error: assistantMessageError } = await supabase
      .from("voice_conversations")
      .insert({
        user_id: userId,
        session_id: sessionId,
        message_type: "assistant",
        content: assistantMessage,
        audio_url: audioUrl,
        note_references: referencedNoteIds,
      });

    if (assistantMessageError) {
      throw assistantMessageError;
    }

    return new Response(
      JSON.stringify({
        message: assistantMessage,
        assistant_audio_url: audioUrl,
        referenced_notes: referencedNoteIds,
      }),
      {
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in voice-assistant function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
