"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Sparkles, Wand2, Star, Moon, CloudMoon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import VoiceInput from "@/components/VoiceInput";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent } from "@/components/ui/card";
import {
  type StoryFormData,
  type StoryLength,
  type ValidationErrors,
  INTEREST_OPTIONS,
  MORAL_OPTIONS,
  STORY_LENGTH_OPTIONS,
} from "@/types/story";

interface StoryFormProps {
  onSubmit: (data: StoryFormData) => Promise<void>;
  isLoading: boolean;
  initialData?: Partial<StoryFormData> | null;
}

export default function StoryForm({ onSubmit, isLoading, initialData }: StoryFormProps) {
  const [formData, setFormData] = useState<StoryFormData>({
    childName: "",
    age: 5,
    interests: [],
    moral: "",
    storyLength: 2,
    customInterest: "",
  });

  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isSuggestingInterests, setIsSuggestingInterests] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);

  // Load initial data when available
  useEffect(() => {
    if (initialData) {
      setFormData((prev) => ({
        ...prev,
        childName: initialData.childName || prev.childName,
        age: initialData.age || prev.age,
        interests: initialData.interests || prev.interests,
        moral: initialData.moral || prev.moral,
        storyLength: initialData.storyLength || prev.storyLength,
      }));
    }
  }, [initialData]);

  // Validate the form
  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};

    if (!formData.childName.trim()) {
      newErrors.childName = "Please enter your child's nick name";
    } else if (formData.childName.length > 50) {
      newErrors.childName = "Name is too long";
    }

    if (formData.age < 1 || formData.age > 12) {
      newErrors.age = "Age must be between 1 and 12";
    }

    if (formData.interests.length === 0) {
      newErrors.interests = "Please select at least one interest";
    }

    if (!formData.moral) {
      newErrors.moral = "Please select a moral lesson";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    // Add custom interest to the list if provided
    const finalInterests = [...formData.interests];
    if (formData.customInterest?.trim()) {
      finalInterests.push(formData.customInterest.trim());
    }

    await onSubmit({
      ...formData,
      interests: finalInterests,
    });
  };

  // Toggle interest selection
  const toggleInterest = (interest: string) => {
    setFormData((prev) => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter((i) => i !== interest)
        : prev.interests.length < 5
          ? [...prev.interests, interest]
          : prev.interests,
    }));
    // Clear error when user makes a selection
    if (errors.interests) {
      setErrors((prev) => ({ ...prev, interests: undefined }));
    }
  };

  // Get AI suggestions for interests based on age
  const handleSuggestInterests = async () => {
    setIsSuggestingInterests(true);
    setAiSuggestions([]);

    try {
      const response = await fetch("/api/suggest-interests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          age: formData.age,
          currentInterests: formData.interests,
        }),
      });

      const data = await response.json();
      if (data.success && data.suggestions) {
        setAiSuggestions(data.suggestions);
      }
    } catch (error) {
      console.error("Failed to get suggestions:", error);
    } finally {
      setIsSuggestingInterests(false);
    }
  };

  // Add AI suggestion to interests
  const addAiSuggestion = (suggestion: string) => {
    if (formData.interests.length < 5 && !formData.interests.includes(suggestion)) {
      setFormData((prev) => ({
        ...prev,
        interests: [...prev.interests, suggestion],
      }));
      setAiSuggestions((prev) => prev.filter((s) => s !== suggestion));
      if (errors.interests) {
        setErrors((prev) => ({ ...prev, interests: undefined }));
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Child's Name */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="space-y-3"
      >
        <Label htmlFor="childName" className="text-lg flex items-center gap-2">
          <Star className="h-5 w-5 text-dream-yellow-300" />
          What is your child&apos;s name?
        </Label>
        <div className="flex gap-2">
          <Input
            id="childName"
            placeholder="Enter name or tap mic to speak..."
            value={formData.childName}
            onChange={(e) => {
              setFormData((prev) => ({ ...prev, childName: e.target.value }));
              if (errors.childName) {
                setErrors((prev) => ({ ...prev, childName: undefined }));
              }
            }}
            className={`flex-1 ${errors.childName ? "border-red-400" : ""}`}
            disabled={isLoading}
          />
          <VoiceInput
            onResult={(transcript) => {
              setFormData((prev) => ({ ...prev, childName: transcript }));
              if (errors.childName) {
                setErrors((prev) => ({ ...prev, childName: undefined }));
              }
            }}
            disabled={isLoading}
          />
        </div>
        {errors.childName && (
          <p className="text-red-500 text-sm">{errors.childName}</p>
        )}
      </motion.div>

      {/* Age Slider */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-4"
      >
        <Label className="text-lg flex items-center gap-2">
          <Moon className="h-5 w-5 text-dream-purple-400" />
          How old is {formData.childName || "your child"}?
        </Label>
        <div className="flex items-center gap-6">
          <Slider
            value={[formData.age]}
            onValueChange={(value) =>
              setFormData((prev) => ({ ...prev, age: value[0] }))
            }
            min={1}
            max={12}
            step={1}
            className="flex-1"
            disabled={isLoading}
          />
          <div className="bg-gradient-to-br from-dream-purple-100 to-dream-pink-100 rounded-xl px-5 py-2 min-w-[80px] text-center">
            <span className="text-2xl font-bold text-dream-purple-700">
              {formData.age}
            </span>
            <span className="text-sm text-dream-purple-500 ml-1">
              {formData.age === 1 ? "year" : "years"}
            </span>
          </div>
        </div>
        {errors.age && <p className="text-red-500 text-sm">{errors.age}</p>}
      </motion.div>

      {/* Interests Selection */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="space-y-4"
      >
        <div className="flex items-center justify-between flex-wrap gap-2">
          <Label className="text-lg flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-dream-yellow-300" />
            What does {formData.childName || "your child"} love? (Pick up to 5)
          </Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleSuggestInterests}
            disabled={isLoading || isSuggestingInterests}
            className="text-dream-purple-600 border-dream-purple-300 hover:bg-dream-purple-50"
          >
            {isSuggestingInterests ? (
              <>
                <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                Thinking...
              </>
            ) : (
              <>
                <Wand2 className="mr-1 h-3 w-3" />
                AI Suggest
              </>
            )}
          </Button>
        </div>

        {/* AI Suggestions */}
        {aiSuggestions.length > 0 && (
          <div className="flex flex-wrap gap-2 p-3 bg-gradient-to-r from-dream-purple-50 to-dream-pink-50 rounded-xl border border-dream-purple-200">
            <span className="text-xs text-dream-purple-600 w-full mb-1">✨ AI suggests for {formData.age} year olds:</span>
            {aiSuggestions.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => addAiSuggestion(suggestion)}
                className="px-3 py-1 text-sm bg-white border border-dream-purple-300 rounded-full text-dream-purple-700 hover:bg-dream-purple-100 hover:border-dream-purple-400 transition-colors"
              >
                + {suggestion}
              </button>
            ))}
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {INTEREST_OPTIONS.map((interest) => (
            <Card
              key={interest.value}
              className={`cursor-pointer transition-all duration-200 hover:scale-105 ${
                formData.interests.includes(interest.value)
                  ? "bg-gradient-to-br from-dream-purple-100 to-dream-pink-100 border-dream-purple-400 shadow-md"
                  : "hover:border-dream-purple-300"
              } ${isLoading ? "pointer-events-none opacity-60" : ""}`}
              onClick={() => toggleInterest(interest.value)}
            >
              <CardContent className="p-3 text-center">
                <span className="text-2xl block mb-1">{interest.emoji}</span>
                <span className="text-sm font-medium text-dream-purple-700">
                  {interest.label}
                </span>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Custom Interest */}
        <div className="flex gap-2 items-center">
          <Input
            placeholder="Or add your own interest (type or speak)..."
            value={formData.customInterest}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, customInterest: e.target.value }))
            }
            className="flex-1"
            disabled={isLoading}
          />
          <VoiceInput
            onResult={(transcript) => {
              setFormData((prev) => ({ ...prev, customInterest: transcript }));
            }}
            disabled={isLoading}
          />
        </div>

        {errors.interests && (
          <p className="text-red-500 text-sm">{errors.interests}</p>
        )}

        {formData.interests.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {formData.interests.map((interest) => {
              const option = INTEREST_OPTIONS.find(
                (o) => o.value === interest
              );
              return (
                <span
                  key={interest}
                  className="bg-dream-purple-100 text-dream-purple-700 px-3 py-1 rounded-full text-sm font-medium"
                >
                  {option?.emoji} {option?.label || interest}
                </span>
              );
            })}
          </div>
        )}
      </motion.div>

      {/* Moral Lesson */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="space-y-3"
      >
        <Label className="text-lg flex items-center gap-2">
          <CloudMoon className="h-5 w-5 text-dream-blue-400" />
          What lesson should the story teach?
        </Label>
        <Select
          value={formData.moral}
          onValueChange={(value) => {
            setFormData((prev) => ({ ...prev, moral: value }));
            if (errors.moral) {
              setErrors((prev) => ({ ...prev, moral: undefined }));
            }
          }}
          disabled={isLoading}
        >
          <SelectTrigger className={errors.moral ? "border-red-400" : ""}>
            <SelectValue placeholder="Choose a moral lesson..." />
          </SelectTrigger>
          <SelectContent>
            {MORAL_OPTIONS.map((moral) => (
              <SelectItem key={moral.value} value={moral.value}>
                {moral.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.moral && <p className="text-red-500 text-sm">{errors.moral}</p>}
      </motion.div>

      {/* Story Length */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="space-y-4"
      >
        <Label className="text-lg flex items-center gap-2">
          <Wand2 className="h-5 w-5 text-dream-pink-300" />
          How long should the story be?
        </Label>
        <div className="grid grid-cols-3 gap-4">
          {STORY_LENGTH_OPTIONS.map((option) => (
            <Card
              key={option.value}
              className={`cursor-pointer transition-all duration-200 hover:scale-105 ${
                formData.storyLength === option.value
                  ? "bg-gradient-to-br from-dream-purple-100 to-dream-blue-100 border-dream-purple-400 shadow-md"
                  : "hover:border-dream-purple-300"
              } ${isLoading ? "pointer-events-none opacity-60" : ""}`}
              onClick={() =>
                setFormData((prev) => ({
                  ...prev,
                  storyLength: option.value as StoryLength,
                }))
              }
            >
              <CardContent className="p-4 text-center">
                <span className="text-xl font-bold text-dream-purple-700 block">
                  {option.label}
                </span>
                <span className="text-xs text-dream-purple-500">
                  {option.description}
                </span>
              </CardContent>
            </Card>
          ))}
        </div>
      </motion.div>

      {/* Submit Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="pt-4"
      >
        <Button
          type="submit"
          variant="magic"
          size="lg"
          className="w-full"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Creating Your Magical Story...
            </>
          ) : (
            <>
              <Wand2 className="mr-2 h-5 w-5" />
              Create Bedtime Story
            </>
          )}
        </Button>
      </motion.div>
    </form>
  );
}
