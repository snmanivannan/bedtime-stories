/**
 * API Route: Generate Story
 * POST /api/generate-story
 *
 * Generates a personalized bedtime story using Google Gemini AI
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { generateStory } from "@/lib/gemini";
import type { GenerateStoryResponse, StoryLength } from "@/types/story";

// Request validation schema
const requestSchema = z.object({
  childName: z
    .string()
    .min(1, "Child's name is required")
    .max(50, "Name is too long"),
  age: z
    .number()
    .int()
    .min(1, "Age must be at least 1")
    .max(12, "Age must be 12 or less"),
  interests: z
    .array(z.string())
    .min(1, "At least one interest is required")
    .max(5, "Maximum 5 interests allowed"),
  moral: z.string().min(1, "Moral lesson is required"),
  storyLength: z.union([z.literal(2), z.literal(4), z.literal(7)]),
});

export async function POST(
  request: NextRequest
): Promise<NextResponse<GenerateStoryResponse>> {
  try {
    // Check API key configuration
    if (!process.env.GEMINI_API_KEY) {
      console.error("GEMINI_API_KEY is not configured");
      return NextResponse.json(
        {
          success: false,
          error: "Story generation service is not configured. Please add your Gemini API key.",
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

    const { childName, age, interests, moral, storyLength } =
      validationResult.data;

    // Generate the story using Gemini
    const { title, content } = await generateStory({
      childName,
      age,
      interests,
      moral,
      storyLength: storyLength as StoryLength,
    });

    return NextResponse.json({
      success: true,
      story: {
        title,
        content,
      },
    });
  } catch (error) {
    console.error("Story generation error:", error);

    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes("API key")) {
        return NextResponse.json(
          {
            success: false,
            error: "Invalid API key. Please check your Gemini API configuration.",
          },
          { status: 401 }
        );
      }

      if (error.message.includes("quota") || error.message.includes("rate")) {
        return NextResponse.json(
          {
            success: false,
            error: "API rate limit reached. Please try again in a few moments.",
          },
          { status: 429 }
        );
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: "Failed to generate story. Please try again.",
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
