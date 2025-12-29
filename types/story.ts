/**
 * Story type definitions for DreamTales AI
 */

// Available story lengths (in minutes)
export type StoryLength = 2 | 4 | 7;

// Story form input data
export interface StoryFormData {
  childName: string;
  age: number;
  interests: string[];
  moral: string;
  storyLength: StoryLength;
  customInterest?: string;
}

// Generated story object
export interface Story {
  id: string;
  title: string;
  content: string;
  childName: string;
  age: number;
  interests: string[];
  moral: string;
  storyLength: StoryLength;
  audioUrl?: string;
  audioDuration?: number;
  createdAt: string;
  wordCount: number;
}

// API response types
export interface GenerateStoryRequest {
  childName: string;
  age: number;
  interests: string[];
  moral: string;
  storyLength: StoryLength;
}

export interface GenerateStoryResponse {
  success: boolean;
  story?: {
    title: string;
    content: string;
  };
  error?: string;
}

export interface TextToSpeechRequest {
  text: string;
  storyId: string;
}

export interface TextToSpeechResponse {
  success: boolean;
  audioUrl?: string;
  audioDuration?: number;
  error?: string;
}

// Predefined interests for multi-select
export const INTEREST_OPTIONS = [
  { value: "dinosaurs", label: "Dinosaurs", emoji: "🦕" },
  { value: "space", label: "Space & Stars", emoji: "🚀" },
  { value: "animals", label: "Animals", emoji: "🐾" },
  { value: "princesses", label: "Princesses & Princes", emoji: "👑" },
  { value: "superheroes", label: "Superheroes", emoji: "🦸" },
  { value: "pirates", label: "Pirates", emoji: "🏴‍☠️" },
  { value: "fairies", label: "Fairies & Magic", emoji: "🧚" },
  { value: "cars", label: "Cars & Trucks", emoji: "🚗" },
  { value: "underwater", label: "Underwater World", emoji: "🐠" },
  { value: "cooking", label: "Cooking & Food", emoji: "🍳" },
  { value: "sports", label: "Sports", emoji: "⚽" },
  { value: "robots", label: "Robots", emoji: "🤖" },
  { value: "nature", label: "Nature & Gardens", emoji: "🌸" },
  { value: "music", label: "Music", emoji: "🎵" },
  { value: "dragons", label: "Dragons", emoji: "🐉" },
] as const;

// Predefined moral lessons
export const MORAL_OPTIONS = [
  { value: "kindness", label: "Being Kind to Others" },
  { value: "bravery", label: "Being Brave" },
  { value: "honesty", label: "Telling the Truth" },
  { value: "friendship", label: "The Value of Friendship" },
  { value: "sharing", label: "Sharing with Others" },
  { value: "perseverance", label: "Never Giving Up" },
  { value: "gratitude", label: "Being Grateful" },
  { value: "creativity", label: "Using Your Imagination" },
  { value: "respect", label: "Respecting Others" },
  { value: "patience", label: "Being Patient" },
  { value: "helping", label: "Helping Those in Need" },
  { value: "self-belief", label: "Believing in Yourself" },
] as const;

// Story length options with descriptions
export const STORY_LENGTH_OPTIONS = [
  { value: 2 as StoryLength, label: "2 minutes", description: "Short & sweet (~300 words)" },
  { value: 4 as StoryLength, label: "4 minutes", description: "Just right (~600 words)" },
  { value: 7 as StoryLength, label: "7 minutes", description: "Extended adventure (~1000 words)" },
] as const;

// Validation schema types
export interface ValidationErrors {
  childName?: string;
  age?: string;
  interests?: string;
  moral?: string;
  storyLength?: string;
}
