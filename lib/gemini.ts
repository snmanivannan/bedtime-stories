/**
 * Google Gemini API client for story generation
 */

import { GoogleGenerativeAI } from "@google/generative-ai";
import type { StoryLength } from "@/types/story";
import { getWordCountRange } from "./utils";

// Initialize the Gemini client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// Get the generative model
const model = genAI.getGenerativeModel({
  model: "gemini-flash-latest",// "gemini-1.5-flash", // Using flash for faster responses
});

interface StoryGenerationParams {
  childName: string;
  age: number;
  interests: string[];
  moral: string;
  storyLength: StoryLength;
}

interface GeneratedStory {
  title: string;
  content: string;
}

/**
 * Generate a personalized bedtime story using Gemini AI
 */
export async function generateStory(
  params: StoryGenerationParams
): Promise<GeneratedStory> {
  const { childName, age, interests, moral, storyLength } = params;
  const wordRange = getWordCountRange(storyLength);

  // Build the prompt for Gemini
  const prompt = buildStoryPrompt({
    childName,
    age,
    interests,
    moral,
    wordRange,
  });

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Parse the response to extract title and content
    const { title, content } = parseStoryResponse(text, childName);

    return { title, content };
  } catch (error) {
    console.error("Gemini API error:", error);
    throw new Error("Failed to generate story. Please try again.");
  }
}

/**
 * Build the story generation prompt
 */
function buildStoryPrompt(params: {
  childName: string;
  age: number;
  interests: string[];
  moral: string;
  wordRange: { min: number; max: number };
}): string {
  const { childName, age, interests, moral, wordRange } = params;
  const interestsList = interests.join(", ");

  // Age-appropriate vocabulary guidance - SIMPLIFIED for kids
  let vocabularyGuidance = "";
  if (age <= 3) {
    vocabularyGuidance =
      "Use VERY simple words only. Short sentences of 5-8 words max. Lots of repetition. Focus on sounds, colors, and simple actions. Words a toddler knows.";
  } else if (age <= 5) {
    vocabularyGuidance =
      "Use simple everyday words a 5 year old knows. Keep sentences short and easy. No complex words. Simple descriptions like 'big', 'small', 'happy', 'soft'.";
  } else if (age <= 8) {
    vocabularyGuidance =
      "Use simple vocabulary that a child can understand easily. Avoid fancy or difficult words. Keep sentences clear and not too long.";
  } else {
    vocabularyGuidance =
      "Use clear, easy to understand language. Some descriptive words are okay but keep it simple and engaging for a child.";
  }

  return `You are a kind storyteller telling a bedtime story to a young child. Create a simple, sweet, and calming bedtime story.

**Story Details:**
- Hero's name: ${childName}
- Age: ${age} years old
- Things they love: ${interestsList}
- Lesson to learn: ${moral}
- Length: ${wordRange.min}-${wordRange.max} words

**IMPORTANT Writing Rules:**
- ${vocabularyGuidance}
- Use SIMPLE words that children use every day
- Keep sentences SHORT and EASY to follow
- NO asterisks (*) or special symbols anywhere in the story
- NO bullet points or formatting marks
- Write numbers as words (say "three" not "3")
- Add natural pauses with commas and periods
- Use "..." for gentle pauses in speech (like "and then... he saw something amazing")
- Make ${childName} the brave and kind hero
- Include what they love in the story
- End with something peaceful and sleepy

**How to Format:**
TITLE: [A simple, fun title]

STORY:
[Write the story here in plain text with short paragraphs. No special formatting.]

Remember: This will be read out loud by a computer voice. Write it so it sounds natural when spoken slowly to a sleepy child. End with the character feeling safe, warm, and ready to sleep.`;
}

/**
 * Parse the Gemini response to extract title and content
 */
function parseStoryResponse(
  text: string,
  childName: string
): { title: string; content: string } {
  // Try to extract title using the TITLE: format
  const titleMatch = text.match(/TITLE:\s*(.+?)(?:\n|STORY:)/i);
  let title = titleMatch ? titleMatch[1].trim() : "";

  // Extract the story content
  const storyMatch = text.match(/STORY:\s*([\s\S]+)/i);
  let content = storyMatch ? storyMatch[1].trim() : text.trim();

  // Fallback title if not found
  if (!title) {
    title = `${childName}'s Magical Adventure`;
  }

  // Clean up any remaining formatting artifacts
  content = content
    .replace(/^STORY:\s*/i, "")
    .replace(/^\*\*STORY:\*\*\s*/i, "")
    .trim();

  // Remove any trailing notes or meta-text from Gemini
  const endMarkers = [
    "\n\n---",
    "\n\nNote:",
    "\n\n*Note:",
    "\n\nI hope",
    "\n\nSweet dreams",
  ];
  for (const marker of endMarkers) {
    const markerIndex = content.indexOf(marker);
    if (markerIndex > 0) {
      content = content.substring(0, markerIndex).trim();
    }
  }

  // Clean content for TTS - remove symbols that sound bad when spoken
  content = cleanTextForTTS(content);
  title = cleanTextForTTS(title);

  return { title, content };
}

/**
 * Clean text to make it sound natural when read by TTS
 */
function cleanTextForTTS(text: string): string {
  return text
    // Remove asterisks (read as "asterisk")
    .replace(/\*/g, "")
    // Remove underscores
    .replace(/_/g, " ")
    // Remove hash symbols
    .replace(/#/g, "")
    // Remove brackets
    .replace(/[\[\]]/g, "")
    // Remove curly braces
    .replace(/[{}]/g, "")
    // Replace multiple dots with pause
    .replace(/\.{3,}/g, "...")
    // Remove em dashes, replace with comma for pause
    .replace(/—/g, ", ")
    .replace(/–/g, ", ")
    // Remove quotes around words (keep the words)
    .replace(/["'"]/g, "")
    // Replace & with "and"
    .replace(/&/g, " and ")
    // Remove @ symbol
    .replace(/@/g, " at ")
    // Clean up extra spaces
    .replace(/\s+/g, " ")
    // Clean up space before punctuation
    .replace(/\s+([.,!?])/g, "$1")
    .trim();
}

/**
 * Test the Gemini API connection
 */
export async function testGeminiConnection(): Promise<boolean> {
  try {
    const result = await model.generateContent("Say 'Hello' in one word.");
    const response = await result.response;
    return response.text().toLowerCase().includes("hello");
  } catch (error) {
    console.error("Gemini connection test failed:", error);
    return false;
  }
}
