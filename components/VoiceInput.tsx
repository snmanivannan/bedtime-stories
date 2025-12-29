"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic } from "lucide-react";
import { Button } from "@/components/ui/button";

// Type declarations for Web Speech API
interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognitionInstance;
    webkitSpeechRecognition: new () => SpeechRecognitionInstance;
  }
}

interface VoiceInputProps {
  onResult: (transcript: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

// Check if Web Speech API is supported
const isSpeechRecognitionSupported = () => {
  if (typeof window === "undefined") return false;
  return "webkitSpeechRecognition" in window || "SpeechRecognition" in window;
};

export default function VoiceInput({
  onResult,
  placeholder = "Tap to speak...",
  disabled = false,
}: VoiceInputProps) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [recognition, setRecognition] = useState<SpeechRecognitionInstance | null>(null);

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window === "undefined") return;

    const supported = isSpeechRecognitionSupported();
    setIsSupported(supported);

    if (supported) {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();

      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = "en-US";

      recognitionInstance.onresult = (event) => {
        const current = event.resultIndex;
        const result = event.results[current];
        const transcriptText = result[0].transcript;

        setTranscript(transcriptText);

        if (result.isFinal) {
          onResult(transcriptText);
          setIsListening(false);
          setTranscript("");
        }
      };

      recognitionInstance.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
        setTranscript("");
      };

      recognitionInstance.onend = () => {
        setIsListening(false);
      };

      setRecognition(recognitionInstance);
    }

    return () => {
      if (recognition) {
        recognition.abort();
      }
    };
  }, []);

  const toggleListening = useCallback(() => {
    if (!recognition) return;

    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      setTranscript("");
      recognition.start();
      setIsListening(true);
    }
  }, [recognition, isListening]);

  if (!isSupported) {
    return null; // Don't show if not supported
  }

  return (
    <div className="relative">
      <Button
        type="button"
        variant="outline"
        size="icon"
        onClick={toggleListening}
        disabled={disabled}
        className={`relative transition-all duration-300 ${
          isListening
            ? "bg-dream-pink-100 border-dream-pink-400 text-dream-pink-600 hover:bg-dream-pink-200"
            : "hover:bg-dream-purple-50 hover:border-dream-purple-300"
        }`}
      >
        <AnimatePresence mode="wait">
          {isListening ? (
            <motion.div
              key="listening"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
            >
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                <Mic className="h-4 w-4" />
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              key="idle"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
            >
              <Mic className="h-4 w-4" />
            </motion.div>
          )}
        </AnimatePresence>
      </Button>

      {/* Listening indicator with transcript */}
      <AnimatePresence>
        {isListening && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-1/2 -translate-x-1/2 mt-2 z-50"
          >
            <div className="bg-dream-purple-800 text-white px-4 py-2 rounded-xl shadow-lg whitespace-nowrap">
              <div className="flex items-center gap-2">
                <motion.div
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="w-2 h-2 bg-dream-pink-400 rounded-full"
                />
                <span className="text-sm">
                  {transcript || "Listening..."}
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
