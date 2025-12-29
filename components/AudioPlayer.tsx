"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Download,
  Loader2,
  Gauge,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { formatDuration } from "@/lib/utils";

interface AudioPlayerProps {
  audioUrl: string | null;
  isGenerating: boolean;
  onGenerateAudio?: () => void;
  storyTitle: string;
  autoPlay?: boolean;
}

// Speed options for playback
const SPEED_OPTIONS = [
  { value: 0.5, label: "0.5x", description: "Very Slow" },
  { value: 0.75, label: "0.75x", description: "Slow" },
  { value: 1, label: "1x", description: "Normal" },
  { value: 1.25, label: "1.25x", description: "Fast" },
];

export default function AudioPlayer({
  audioUrl,
  isGenerating,
  onGenerateAudio,
  storyTitle,
  autoPlay = false,
}: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(0.75); // Default to slow for bedtime

  // Audio visualization bars
  const [visualBars, setVisualBars] = useState<number[]>(
    Array(20).fill(0)
  );

  // Initialize audio element
  useEffect(() => {
    if (audioUrl && !audioRef.current) {
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      audio.playbackRate = playbackSpeed;

      audio.addEventListener("loadedmetadata", () => {
        setDuration(audio.duration);
        setIsLoaded(true);
      });

      audio.addEventListener("canplaythrough", () => {
        // Auto-play when audio is ready if autoPlay is true
        if (autoPlay && audioRef.current) {
          audioRef.current.play();
          setIsPlaying(true);
        }
      });

      audio.addEventListener("timeupdate", () => {
        setCurrentTime(audio.currentTime);
      });

      audio.addEventListener("ended", () => {
        setIsPlaying(false);
        setCurrentTime(0);
      });

      audio.addEventListener("error", (e) => {
        console.error("Audio error:", e);
        setIsLoaded(false);
      });

      return () => {
        audio.pause();
        audio.src = "";
        audioRef.current = null;
      };
    }
  }, [audioUrl, autoPlay, playbackSpeed]);

  // Update volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  // Update playback speed
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed]);

  // Animate visualization bars when playing
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isPlaying) {
      interval = setInterval(() => {
        setVisualBars(
          Array(20)
            .fill(0)
            .map(() => Math.random() * 100)
        );
      }, 100);
    } else {
      setVisualBars(Array(20).fill(10));
    }

    return () => clearInterval(interval);
  }, [isPlaying]);

  // Play/Pause toggle
  const togglePlayPause = useCallback(() => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  // Seek to position
  const handleSeek = (value: number[]) => {
    if (!audioRef.current) return;
    const newTime = value[0];
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  // Restart from beginning
  const handleRestart = () => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = 0;
    setCurrentTime(0);
    if (!isPlaying) {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  // Toggle mute
  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  // Change playback speed
  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
  };

  // Download audio
  const handleDownload = () => {
    if (!audioUrl) return;

    const link = document.createElement("a");
    link.href = audioUrl;
    link.download = `${storyTitle.replace(/[^a-z0-9]/gi, "-").toLowerCase()}.mp3`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // If no audio yet, show generate button
  if (!audioUrl) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-dream-purple-50 to-dream-blue-50 rounded-2xl p-6 text-center"
      >
        <div className="mb-4">
          <Volume2 className="h-12 w-12 mx-auto text-dream-purple-400 mb-2" />
          <p className="text-dream-purple-700 font-medium">
            Ready to hear the story?
          </p>
          <p className="text-sm text-dream-purple-500">
            Generate soothing narration for bedtime
          </p>
        </div>
        <Button
          onClick={onGenerateAudio}
          disabled={isGenerating}
          variant="magic"
          size="lg"
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Creating Audio...
            </>
          ) : (
            <>
              <Volume2 className="mr-2 h-5 w-5" />
              Generate Narration
            </>
          )}
        </Button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-dream-purple-50 to-dream-blue-50 rounded-2xl p-6"
    >
      {/* Visualization */}
      <div className="flex items-end justify-center gap-1 h-16 mb-6">
        {visualBars.map((height, i) => (
          <motion.div
            key={i}
            className="w-2 bg-gradient-to-t from-dream-purple-400 to-dream-pink-300 rounded-full"
            animate={{ height: `${Math.max(10, height)}%` }}
            transition={{ duration: 0.1 }}
          />
        ))}
      </div>

      {/* Progress bar */}
      <div className="mb-4">
        <Slider
          value={[currentTime]}
          max={duration || 100}
          step={0.1}
          onValueChange={handleSeek}
          disabled={!isLoaded}
          className="cursor-pointer"
        />
        <div className="flex justify-between mt-2 text-sm text-dream-purple-600">
          <span>{formatDuration(currentTime)}</span>
          <span>{formatDuration(duration)}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4">
        {/* Restart */}
        <Button
          variant="ghost"
          size="icon"
          onClick={handleRestart}
          disabled={!isLoaded}
          className="text-dream-purple-600 hover:text-dream-purple-700 hover:bg-dream-purple-100"
        >
          <RotateCcw className="h-5 w-5" />
        </Button>

        {/* Play/Pause */}
        <Button
          variant="default"
          size="lg"
          onClick={togglePlayPause}
          disabled={!isLoaded}
          className="h-14 w-14 rounded-full"
        >
          {isPlaying ? (
            <Pause className="h-6 w-6" />
          ) : (
            <Play className="h-6 w-6 ml-1" />
          )}
        </Button>

        {/* Mute */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleMute}
          className="text-dream-purple-600 hover:text-dream-purple-700 hover:bg-dream-purple-100"
        >
          {isMuted ? (
            <VolumeX className="h-5 w-5" />
          ) : (
            <Volume2 className="h-5 w-5" />
          )}
        </Button>
      </div>

      {/* Speed Control */}
      <div className="mt-5">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Gauge className="h-4 w-4 text-dream-purple-500" />
          <span className="text-sm font-medium text-dream-purple-700">
            Speed
          </span>
        </div>
        <div className="flex justify-center gap-2">
          {SPEED_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => handleSpeedChange(option.value)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                playbackSpeed === option.value
                  ? "bg-dream-purple-500 text-white shadow-md"
                  : "bg-white text-dream-purple-600 hover:bg-dream-purple-100 border border-dream-purple-200"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
        <p className="text-xs text-center text-dream-purple-400 mt-1">
          {SPEED_OPTIONS.find((o) => o.value === playbackSpeed)?.description} - Perfect for bedtime
        </p>
      </div>

      {/* Volume slider */}
      <div className="flex items-center gap-3 mt-4 px-8">
        <VolumeX className="h-4 w-4 text-dream-purple-400" />
        <Slider
          value={[isMuted ? 0 : volume]}
          max={1}
          step={0.01}
          onValueChange={(value) => {
            setVolume(value[0]);
            if (value[0] > 0) setIsMuted(false);
          }}
          className="flex-1"
        />
        <Volume2 className="h-4 w-4 text-dream-purple-400" />
      </div>

      {/* Download button */}
      <div className="mt-6 text-center">
        <Button
          variant="outline"
          size="sm"
          onClick={handleDownload}
          className="text-dream-purple-600"
        >
          <Download className="mr-2 h-4 w-4" />
          Download Audio
        </Button>
      </div>
    </motion.div>
  );
}
