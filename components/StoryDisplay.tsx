"use client";

import { motion } from "framer-motion";
import { BookOpen, Clock, Heart, Sparkles } from "lucide-react";
import type { Story } from "@/types/story";
import { formatDate, estimateReadingTime } from "@/lib/utils";
import { INTEREST_OPTIONS, MORAL_OPTIONS } from "@/types/story";

interface StoryDisplayProps {
  story: Story;
  highlightProgress?: number; // 0-100 for scroll-along highlight
}

export default function StoryDisplay({
  story,
  highlightProgress,
}: StoryDisplayProps) {
  // Split story into paragraphs for display
  const paragraphs = story.content.split("\n\n").filter((p) => p.trim());

  // Get interest labels
  const interestLabels = story.interests.map((interest) => {
    const option = INTEREST_OPTIONS.find((o) => o.value === interest);
    return option ? `${option.emoji} ${option.label}` : interest;
  });

  // Get moral label
  const moralLabel =
    MORAL_OPTIONS.find((m) => m.value === story.moral)?.label || story.moral;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Story Header */}
      <div className="text-center mb-8">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl md:text-4xl font-bold text-dream-purple-800 mb-4"
        >
          {story.title}
        </motion.h1>

        {/* Story Meta */}
        <div className="flex flex-wrap justify-center gap-4 text-sm text-dream-purple-600">
          <span className="flex items-center gap-1">
            <BookOpen className="h-4 w-4" />
            {story.wordCount} words
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {estimateReadingTime(story.content)} min read
          </span>
          <span className="flex items-center gap-1">
            <Heart className="h-4 w-4" />
            For {story.childName}, age {story.age}
          </span>
        </div>
      </div>

      {/* Story Tags */}
      <div className="flex flex-wrap justify-center gap-2 mb-6">
        {interestLabels.map((label, index) => (
          <span
            key={index}
            className="bg-dream-purple-100 text-dream-purple-700 px-3 py-1 rounded-full text-sm"
          >
            {label}
          </span>
        ))}
        <span className="bg-dream-pink-100 text-dream-pink-700 px-3 py-1 rounded-full text-sm flex items-center gap-1">
          <Sparkles className="h-3 w-3" />
          {moralLabel}
        </span>
      </div>

      {/* Story Content */}
      <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 md:p-8 shadow-lg border border-dream-purple-100">
        <div className="prose prose-lg max-w-none">
          {paragraphs.map((paragraph, index) => {
            // Calculate if this paragraph should be highlighted based on progress
            const paragraphProgress =
              highlightProgress !== undefined
                ? (index / paragraphs.length) * 100
                : -1;
            const isActive =
              highlightProgress !== undefined &&
              paragraphProgress <= highlightProgress &&
              paragraphProgress + 100 / paragraphs.length > highlightProgress;

            return (
              <motion.p
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`text-lg leading-relaxed mb-6 transition-all duration-300 ${
                  isActive
                    ? "text-dream-purple-900 bg-dream-yellow-100/50 -mx-2 px-2 py-1 rounded-lg"
                    : highlightProgress !== undefined &&
                        paragraphProgress < highlightProgress
                      ? "text-dream-purple-700"
                      : "text-dream-purple-600"
                }`}
              >
                {paragraph}
              </motion.p>
            );
          })}
        </div>
      </div>

      {/* Story Footer */}
      <div className="text-center text-sm text-dream-purple-500">
        <p>Created on {formatDate(story.createdAt)}</p>
        <p className="mt-1 text-dream-purple-400">
          Sweet dreams, {story.childName}!
        </p>
      </div>
    </motion.div>
  );
}
