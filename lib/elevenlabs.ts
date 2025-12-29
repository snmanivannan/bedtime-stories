/**
 * ElevenLabs Text-to-Speech API client
 */

// Voice IDs for soothing bedtime narration
export const VOICE_OPTIONS = {
  bella: "EXAVITQu4vr4xnSDxMaL", // Bella - calm, soothing female voice
  rachel: "21m00Tcm4TlvDq8ikWAM", // Rachel - warm, friendly female voice
  adam: "pNInz6obpgDQGcFmaJgB", // Adam - gentle male voice
  josh: "TxGEqnHWrfWFTfGW9XjX", // Josh - soothing male voice
} as const;

// Default voice for bedtime stories
const DEFAULT_VOICE_ID = VOICE_OPTIONS.bella;

// ElevenLabs API configuration
const ELEVENLABS_API_URL = "https://api.elevenlabs.io/v1";

interface TTSConfig {
  voiceId?: string;
  modelId?: string;
  stability?: number;
  similarityBoost?: number;
  style?: number;
  speakerBoost?: boolean;
}

interface TTSResponse {
  audioBuffer: ArrayBuffer;
  contentType: string;
}

/**
 * Convert text to speech using ElevenLabs API
 * Settings optimized for natural, human-like bedtime narration
 */
export async function textToSpeech(
  text: string,
  config: TTSConfig = {}
): Promise<TTSResponse> {
  const {
    voiceId = DEFAULT_VOICE_ID,
    modelId = "eleven_multilingual_v2", // Better quality, more natural
    // Lower stability = more expressive/human variation (0.3-0.5 for storytelling)
    stability = 0.35,
    // Lower similarity = more natural/less robotic
    similarityBoost = 0.65,
    // Higher style = more expressive narration
    style = 0.45,
    // Speaker boost for clarity
    speakerBoost = true,
  } = config;

  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    throw new Error("ELEVENLABS_API_KEY is not configured");
  }

  const url = `${ELEVENLABS_API_URL}/text-to-speech/${voiceId}`;

  const requestBody = {
    text,
    model_id: modelId,
    voice_settings: {
      stability,
      similarity_boost: similarityBoost,
      style,
      use_speaker_boost: speakerBoost,
    },
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Accept: "audio/mpeg",
        "Content-Type": "application/json",
        "xi-api-key": apiKey,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("ElevenLabs API error:", response.status, errorText);

      if (response.status === 401) {
        throw new Error("Invalid ElevenLabs API key");
      } else if (response.status === 429) {
        throw new Error("Rate limit exceeded. Please try again later.");
      } else if (response.status === 400) {
        throw new Error("Invalid request to text-to-speech API");
      }

      throw new Error(`Text-to-speech failed: ${response.statusText}`);
    }

    const audioBuffer = await response.arrayBuffer();
    const contentType = response.headers.get("content-type") || "audio/mpeg";

    return { audioBuffer, contentType };
  } catch (error) {
    console.error("ElevenLabs TTS error:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to generate audio. Please try again.");
  }
}

/**
 * Get user's subscription info and remaining characters
 */
export async function getSubscriptionInfo(): Promise<{
  characterCount: number;
  characterLimit: number;
  voiceCount: number;
  voiceLimit: number;
} | null> {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) return null;

  try {
    const response = await fetch(`${ELEVENLABS_API_URL}/user/subscription`, {
      headers: {
        "xi-api-key": apiKey,
      },
    });

    if (!response.ok) return null;

    const data = await response.json();
    return {
      characterCount: data.character_count || 0,
      characterLimit: data.character_limit || 0,
      voiceCount: data.voice_count || 0,
      voiceLimit: data.voice_limit || 0,
    };
  } catch {
    return null;
  }
}

/**
 * Test the ElevenLabs API connection
 */
export async function testElevenLabsConnection(): Promise<boolean> {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) return false;

  try {
    const response = await fetch(`${ELEVENLABS_API_URL}/voices`, {
      headers: {
        "xi-api-key": apiKey,
      },
    });

    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Estimate audio duration based on text length
 * Average speaking rate is ~150 words per minute or ~2.5 words per second
 */
export function estimateAudioDuration(text: string): number {
  const words = text.trim().split(/\s+/).length;
  const wordsPerSecond = 2.5;
  return Math.ceil(words / wordsPerSecond);
}

/**
 * Split long text into chunks for processing
 * ElevenLabs has a character limit per request
 */
export function splitTextForTTS(text: string, maxChars: number = 5000): string[] {
  if (text.length <= maxChars) return [text];

  const chunks: string[] = [];
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  let currentChunk = "";

  for (const sentence of sentences) {
    if ((currentChunk + sentence).length > maxChars) {
      if (currentChunk) {
        chunks.push(currentChunk.trim());
        currentChunk = "";
      }
      // If a single sentence is too long, split by words
      if (sentence.length > maxChars) {
        const words = sentence.split(" ");
        let wordChunk = "";
        for (const word of words) {
          if ((wordChunk + " " + word).length > maxChars) {
            chunks.push(wordChunk.trim());
            wordChunk = word;
          } else {
            wordChunk += " " + word;
          }
        }
        if (wordChunk) currentChunk = wordChunk;
      } else {
        currentChunk = sentence;
      }
    } else {
      currentChunk += sentence;
    }
  }

  if (currentChunk) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
}
