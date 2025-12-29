import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility function to merge Tailwind CSS classes
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format duration in seconds to MM:SS format
 */
export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

/**
 * Format date to a readable string
 */
export function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Estimate reading time based on word count
 * Average speaking rate is ~150 words per minute
 */
export function estimateReadingTime(text: string): number {
  const words = text.trim().split(/\s+/).length;
  return Math.ceil(words / 150);
}

/**
 * Generate word count range based on story length selection
 */
export function getWordCountRange(minutes: number): { min: number; max: number } {
  const wordsPerMinute = 150;
  return {
    min: Math.floor(minutes * wordsPerMinute * 0.8),
    max: Math.ceil(minutes * wordsPerMinute * 1.2),
  };
}

/**
 * Truncate text with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + "...";
}

/**
 * Sleep utility for async delays
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
