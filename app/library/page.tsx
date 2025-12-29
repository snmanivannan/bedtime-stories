"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Moon,
  BookOpen,
  Clock,
  Heart,
  Play,
  Trash2,
  Plus,
  Search,
  Library as LibraryIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { getStoredStories, deleteStory } from "@/lib/storage";
import { formatDate, truncateText, estimateReadingTime } from "@/lib/utils";
import type { Story } from "@/types/story";
import { INTEREST_OPTIONS } from "@/types/story";

export default function LibraryPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [stories, setStories] = useState<Story[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Load stories from localStorage
  useEffect(() => {
    const loadedStories = getStoredStories();
    setStories(loadedStories);
    setIsLoading(false);
  }, []);

  // Filter stories based on search query
  const filteredStories = stories.filter((story) => {
    const query = searchQuery.toLowerCase();
    return (
      story.title.toLowerCase().includes(query) ||
      story.childName.toLowerCase().includes(query) ||
      story.interests.some((i) => i.toLowerCase().includes(query))
    );
  });

  // Handle story deletion
  const handleDelete = (e: React.MouseEvent, storyId: string) => {
    e.stopPropagation();

    const confirmed = window.confirm(
      "Are you sure you want to delete this story?"
    );

    if (confirmed) {
      deleteStory(storyId);
      setStories((prev) => prev.filter((s) => s.id !== storyId));
      toast({
        title: "Story Deleted",
        description: "The story has been removed from your library.",
      });
    }
  };

  // Get interest emojis for a story
  const getInterestEmojis = (interests: string[]): string => {
    return interests
      .slice(0, 3)
      .map((interest) => {
        const option = INTEREST_OPTIONS.find((o) => o.value === interest);
        return option?.emoji || "";
      })
      .join(" ");
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-dream-purple-100 via-dream-purple-50 to-dream-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-dream-purple-100 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => router.push("/")}
            className="text-dream-purple-700 hover:text-dream-purple-800"
          >
            <ArrowLeft className="mr-2 h-5 w-5" />
            Back
          </Button>

          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-br from-dream-purple-100 to-dream-pink-100 p-2 rounded-xl">
              <Moon className="h-5 w-5 text-dream-purple-600" />
            </div>
            <span className="text-sm font-medium text-dream-purple-700 hidden sm:inline">
              DreamTales AI
            </span>
          </div>

          <Button onClick={() => router.push("/")} variant="default">
            <Plus className="mr-2 h-5 w-5" />
            New Story
          </Button>
        </div>
      </header>

      {/* Page Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Page Title */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex justify-center mb-4">
            <div className="bg-gradient-to-br from-dream-purple-200 to-dream-pink-200 p-4 rounded-2xl">
              <LibraryIcon className="h-10 w-10 text-dream-purple-700" />
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-dream-purple-800 mb-2">
            Story Library
          </h1>
          <p className="text-dream-purple-600">
            {stories.length === 0
              ? "Your magical stories will appear here"
              : `${stories.length} ${stories.length === 1 ? "story" : "stories"} saved`}
          </p>
        </motion.div>

        {/* Search */}
        {stories.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="max-w-md mx-auto mb-8"
          >
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-dream-purple-400" />
              <Input
                placeholder="Search stories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12"
              />
            </div>
          </motion.div>
        )}

        {/* Stories Grid */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-pulse text-dream-purple-400">
              Loading stories...
            </div>
          </div>
        ) : stories.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="bg-dream-purple-100/50 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
              <BookOpen className="h-12 w-12 text-dream-purple-400" />
            </div>
            <h2 className="text-xl font-semibold text-dream-purple-700 mb-2">
              No Stories Yet
            </h2>
            <p className="text-dream-purple-500 mb-6">
              Create your first magical bedtime story!
            </p>
            <Button onClick={() => router.push("/")} variant="magic" size="lg">
              <Plus className="mr-2 h-5 w-5" />
              Create First Story
            </Button>
          </motion.div>
        ) : filteredStories.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <p className="text-dream-purple-500">
              No stories found matching &quot;{searchQuery}&quot;
            </p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredStories.map((story, index) => (
              <motion.div
                key={story.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card
                  className="cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-xl group overflow-hidden"
                  onClick={() => router.push(`/story/${story.id}`)}
                >
                  {/* Card Header with gradient */}
                  <div className="h-2 bg-gradient-to-r from-dream-purple-400 via-dream-pink-300 to-dream-blue-400" />

                  <CardContent className="p-5">
                    {/* Interest emojis */}
                    <div className="text-2xl mb-3">
                      {getInterestEmojis(story.interests)}
                    </div>

                    {/* Title */}
                    <h3 className="text-lg font-bold text-dream-purple-800 mb-2 group-hover:text-dream-purple-600 transition-colors">
                      {truncateText(story.title, 50)}
                    </h3>

                    {/* Preview text */}
                    <p className="text-sm text-dream-purple-500 mb-4 line-clamp-2">
                      {truncateText(story.content, 100)}
                    </p>

                    {/* Meta info */}
                    <div className="flex flex-wrap gap-3 text-xs text-dream-purple-400 mb-4">
                      <span className="flex items-center gap-1">
                        <Heart className="h-3 w-3" />
                        {story.childName}, {story.age}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {estimateReadingTime(story.content)} min
                      </span>
                      <span className="flex items-center gap-1">
                        <BookOpen className="h-3 w-3" />
                        {story.wordCount} words
                      </span>
                    </div>

                    {/* Date and actions */}
                    <div className="flex items-center justify-between pt-3 border-t border-dream-purple-100">
                      <span className="text-xs text-dream-purple-400">
                        {formatDate(story.createdAt)}
                      </span>
                      <div className="flex gap-1">
                        {story.audioUrl && (
                          <div className="bg-dream-purple-100 text-dream-purple-600 p-1.5 rounded-lg">
                            <Play className="h-4 w-4" />
                          </div>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-400 hover:text-red-500 hover:bg-red-50"
                          onClick={(e) => handleDelete(e, story.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </main>
  );
}
