/**
 * API Route: Suggest Interests
 * POST /api/suggest-interests
 *
 * Uses Gemini AI to suggest age-appropriate interests for a child
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Request validation schema
const requestSchema = z.object({
  age: z.number().int().min(1).max(12),
  currentInterests: z.array(z.string()).optional(),
});

interface SuggestInterestsResponse {
  success: boolean;
  suggestions?: string[];
  error?: string;
}

export async function POST(
  request: NextRequest
): Promise<NextResponse<SuggestInterestsResponse>> {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: "AI service not configured" },
        { status: 500 }
      );
    }

    const body = await request.json();
    const validationResult = requestSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { success: false, error: "Invalid request" },
        { status: 400 }
      );
    }

    const { age, currentInterests = [] } = validationResult.data;

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `You are helping suggest story themes for a ${age} year old child.

${currentInterests.length > 0 ? `They already like: ${currentInterests.join(", ")}` : ""}

Suggest 3 age-appropriate interests/themes that would make great bedtime stories. Consider:
- What ${age} year olds typically enjoy
- Themes that are calming for bedtime
- Things that spark imagination

Return ONLY a JSON array of 3 simple words or short phrases, like:
["unicorns", "friendly monsters", "space adventures"]

No explanation, just the JSON array.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().trim();

    // Parse the JSON array from response
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error("Invalid AI response format");
    }

    const suggestions = JSON.parse(jsonMatch[0]) as string[];

    return NextResponse.json({
      success: true,
      suggestions: suggestions.slice(0, 3),
    });
  } catch (error) {
    console.error("Suggest interests error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate suggestions" },
      { status: 500 }
    );
  }
}
