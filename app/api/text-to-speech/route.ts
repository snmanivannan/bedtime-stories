/**
 * API Route: Text-to-Speech
 * POST /api/text-to-speech
 *
 * Converts story text to audio using ElevenLabs TTS API
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { textToSpeech, estimateAudioDuration } from "@/lib/elevenlabs";
import type { TextToSpeechResponse } from "@/types/story";

// Request validation schema
const requestSchema = z.object({
  text: z
    .string()
    .min(10, "Text is too short")
    .max(10000, "Text exceeds maximum length"),
  storyId: z.string().min(1, "Story ID is required"),
});

export async function POST(request: NextRequest) {
  try {
    // Check API key configuration
    if (!process.env.ELEVENLABS_API_KEY) {
      console.error("ELEVENLABS_API_KEY is not configured");
      return NextResponse.json(
        {
          success: false,
          error: "Text-to-speech service is not configured. Please add your ElevenLabs API key.",
        },
        { status: 500 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = requestSchema.safeParse(body);

    if (!validationResult.success) {
      const errors = validationResult.error.errors
        .map((e) => e.message)
        .join(", ");
      return NextResponse.json(
        {
          success: false,
          error: `Invalid request: ${errors}`,
        },
        { status: 400 }
      );
    }

    const { text, storyId } = validationResult.data;

    // Generate audio using ElevenLabs with natural, human-like settings
    const { audioBuffer, contentType } = await textToSpeech(text, {
      // Optimized for natural, expressive bedtime storytelling
      stability: 0.35, // Lower = more expressive/human variation
      similarityBoost: 0.65, // Lower = more natural, less robotic
      style: 0.45, // Higher = more expressive narration with emotion
      speakerBoost: true,
    });

    // Estimate duration based on text
    const audioDuration = estimateAudioDuration(text);

    // Return audio as a blob response with metadata in headers
    const response = new NextResponse(audioBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Length": audioBuffer.byteLength.toString(),
        "X-Story-Id": storyId,
        "X-Audio-Duration": audioDuration.toString(),
        "Cache-Control": "public, max-age=3600", // Cache for 1 hour
      },
    });

    return response;
  } catch (error) {
    console.error("Text-to-speech error:", error);

    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes("API key") || error.message.includes("401")) {
        return NextResponse.json(
          {
            success: false,
            error: "Invalid API key. Please check your ElevenLabs API configuration.",
          },
          { status: 401 }
        );
      }

      if (error.message.includes("rate") || error.message.includes("429")) {
        return NextResponse.json(
          {
            success: false,
            error: "Rate limit exceeded. Please try again later.",
          },
          { status: 429 }
        );
      }

      if (error.message.includes("quota") || error.message.includes("characters")) {
        return NextResponse.json(
          {
            success: false,
            error: "Character quota exceeded. Please check your ElevenLabs subscription.",
          },
          { status: 402 }
        );
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: "Failed to generate audio. Please try again.",
      },
      { status: 500 }
    );
  }
}

// Handle unsupported methods
export async function GET() {
  return NextResponse.json(
    { success: false, error: "Method not allowed" },
    { status: 405 }
  );
}
