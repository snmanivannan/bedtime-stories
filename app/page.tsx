"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Moon, Stars, CloudMoon, BookOpen, Library } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import StoryForm from "@/components/StoryForm";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { saveStory } from "@/lib/storage";
import type { Story, StoryFormData } from "@/types/story";

// Key for storing last form inputs in localStorage
const LAST_FORM_DATA_KEY = "dreamtales_last_form_data";

// Floating stars animation component
function FloatingStars() {
  const stars = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    size: Math.random() * 4 + 2,
    x: Math.random() * 100,
    y: Math.random() * 100,
    delay: Math.random() * 3,
    duration: Math.random() * 2 + 2,
  }));

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {stars.map((star) => (
        <motion.div
          key={star.id}
          className="absolute bg-white rounded-full"
          style={{
            width: star.size,
            height: star.size,
            left: `${star.x}%`,
            top: `${star.y}%`,
          }}
          animate={{
            opacity: [0.3, 1, 0.3],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: star.duration,
            repeat: Infinity,
            delay: star.delay,
          }}
        />
      ))}
    </div>
  );
}

export default function HomePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [initialFormData, setInitialFormData] = useState<Partial<StoryFormData> | null>(null);

  // Load last form data from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LAST_FORM_DATA_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Validate storyLength - must be 2, 4, or 7
        if (parsed.storyLength && ![2, 4, 7].includes(parsed.storyLength)) {
          parsed.storyLength = 2; // Default to 2 if invalid
        }
        setInitialFormData(parsed);
      }
    } catch (error) {
      console.error("Failed to load saved form data:", error);
    }
  }, []);

  const handleSubmit = async (formData: StoryFormData) => {
    setIsLoading(true);

    // Save form data to localStorage for next time
    try {
      localStorage.setItem(LAST_FORM_DATA_KEY, JSON.stringify({
        childName: formData.childName,
        age: formData.age,
        interests: formData.interests,
        moral: formData.moral,
        storyLength: formData.storyLength,
      }));
    } catch (error) {
      console.error("Failed to save form data:", error);
    }

    try {
      // Call the story generation API
      const response = await fetch("/api/generate-story", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to generate story");
      }

      // Create story object
      const story: Story = {
        id: uuidv4(),
        title: data.story.title,
        content: data.story.content,
        childName: formData.childName,
        age: formData.age,
        interests: formData.interests,
        moral: formData.moral,
        storyLength: formData.storyLength,
        createdAt: new Date().toISOString(),
        wordCount: data.story.content.split(/\s+/).length,
      };

      // Save to localStorage
      saveStory(story);

      toast({
        title: "Story Created!",
        description: `"${story.title}" is ready for ${formData.childName}!`,
        variant: "default",
      });

      // Navigate to story page with "new" flag for auto-play
      router.push(`/story/${story.id}?new=true`);
    } catch (error) {
      console.error("Story generation error:", error);
      toast({
        title: "Oops!",
        description:
          error instanceof Error
            ? error.message
            : "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-dream-purple-900 via-dream-purple-800 to-dream-blue-900 relative">
      <FloatingStars />

      {/* Header */}
      <header className="relative z-10 pt-8 pb-4 px-4">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <div className="bg-dream-purple-100/20 p-2 rounded-xl">
              <Moon className="h-8 w-8 text-dream-yellow-200" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">DreamTales AI</h1>
              <p className="text-xs text-dream-purple-200">
                Magical Bedtime Stories
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Button
              variant="ghost"
              onClick={() => router.push("/library")}
              className="text-white hover:bg-white/10"
            >
              <Library className="mr-2 h-5 w-5" />
              My Stories
            </Button>
          </motion.div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 px-4 py-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="max-w-2xl mx-auto"
        >
          <div className="flex justify-center gap-4 mb-6">
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <Stars className="h-12 w-12 text-dream-yellow-200" />
            </motion.div>
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
            >
              <CloudMoon className="h-14 w-14 text-dream-blue-200" />
            </motion.div>
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity, delay: 1 }}
            >
              <BookOpen className="h-12 w-12 text-dream-pink-200" />
            </motion.div>
          </div>

          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Create Magical
            <span className="block bg-gradient-to-r from-dream-yellow-200 via-dream-pink-200 to-dream-blue-200 bg-clip-text text-transparent">
              Bedtime Stories
            </span>
          </h2>

          <p className="text-lg text-dream-purple-200 mb-8">
            Personalized AI-generated stories with soothing voice narration.
            <br />
            Make bedtime magical for your little one.
          </p>
        </motion.div>
      </section>

      {/* Form Section */}
      <section className="relative z-10 px-4 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="max-w-2xl mx-auto"
        >
          <div className="bg-white/95 backdrop-blur-lg rounded-3xl p-6 md:p-8 shadow-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-gradient-to-br from-dream-purple-100 to-dream-pink-100 p-2 rounded-xl">
                <BookOpen className="h-6 w-6 text-dream-purple-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-dream-purple-800">
                  Create Your Story
                </h3>
                <p className="text-sm text-dream-purple-500">
                  Tell us about your child
                </p>
              </div>
            </div>

            <StoryForm
              onSubmit={handleSubmit}
              isLoading={isLoading}
              initialData={initialFormData}
            />
          </div>
        </motion.div>
      </section>

      {/* Features Preview */}
      <section className="relative z-10 px-4 pb-16">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: <Stars className="h-8 w-8" />,
                title: "AI-Powered",
                description:
                  "Unique stories generated by Google Gemini AI, tailored to your child",
              },
              {
                icon: <CloudMoon className="h-8 w-8" />,
                title: "Voice Narration",
                description:
                  "Soothing bedtime narration powered by ElevenLabs TTS",
              },
              {
                icon: <BookOpen className="h-8 w-8" />,
                title: "Story Library",
                description:
                  "Save and replay your favorite stories anytime",
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center"
              >
                <div className="text-dream-yellow-200 mb-3 flex justify-center">
                  {feature.icon}
                </div>
                <h4 className="text-lg font-semibold text-white mb-2">
                  {feature.title}
                </h4>
                <p className="text-sm text-dream-purple-200">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
