/**
 * localStorage utilities for managing saved stories
 */

import type { Story } from "@/types/story";

const STORAGE_KEY = "dreamtales_stories";

/**
 * Get all saved stories from localStorage
 */
export function getStoredStories(): Story[] {
  if (typeof window === "undefined") return [];

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];

    const stories = JSON.parse(stored) as Story[];
    // Sort by creation date, newest first
    return stories.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  } catch (error) {
    console.error("Failed to parse stored stories:", error);
    return [];
  }
}

/**
 * Get a single story by ID
 */
export function getStoryById(id: string): Story | null {
  const stories = getStoredStories();
  return stories.find((story) => story.id === id) || null;
}

/**
 * Save a new story to localStorage
 */
export function saveStory(story: Story): void {
  if (typeof window === "undefined") return;

  try {
    const stories = getStoredStories();

    // Check if story already exists (update it)
    const existingIndex = stories.findIndex((s) => s.id === story.id);
    if (existingIndex >= 0) {
      stories[existingIndex] = story;
    } else {
      stories.unshift(story); // Add to beginning
    }

    // Keep only the last 50 stories to prevent localStorage overflow
    const trimmedStories = stories.slice(0, 50);

    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmedStories));
  } catch (error) {
    console.error("Failed to save story:", error);
    throw new Error("Failed to save story to storage");
  }
}

/**
 * Update an existing story (e.g., to add audio URL)
 */
export function updateStory(id: string, updates: Partial<Story>): Story | null {
  if (typeof window === "undefined") return null;

  try {
    const stories = getStoredStories();
    const index = stories.findIndex((s) => s.id === id);

    if (index === -1) return null;

    const updatedStory = { ...stories[index], ...updates };
    stories[index] = updatedStory;

    localStorage.setItem(STORAGE_KEY, JSON.stringify(stories));
    return updatedStory;
  } catch (error) {
    console.error("Failed to update story:", error);
    return null;
  }
}

/**
 * Delete a story from localStorage
 */
export function deleteStory(id: string): boolean {
  if (typeof window === "undefined") return false;

  try {
    const stories = getStoredStories();
    const filteredStories = stories.filter((s) => s.id !== id);

    if (filteredStories.length === stories.length) {
      return false; // Story not found
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredStories));
    return true;
  } catch (error) {
    console.error("Failed to delete story:", error);
    return false;
  }
}

/**
 * Clear all stored stories
 */
export function clearAllStories(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}

/**
 * Check if localStorage is available
 */
export function isStorageAvailable(): boolean {
  if (typeof window === "undefined") return false;

  try {
    const test = "__storage_test__";
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}
