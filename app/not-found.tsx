"use client";

import { motion } from "framer-motion";
import { Moon, Home, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-dream-purple-900 via-dream-purple-800 to-dream-blue-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-md"
      >
        <div className="relative mb-8">
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <Moon className="h-24 w-24 text-dream-yellow-200 mx-auto" />
          </motion.div>
          <motion.div
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute top-0 left-1/4"
          >
            <span className="text-2xl">✨</span>
          </motion.div>
          <motion.div
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
            className="absolute top-4 right-1/4"
          >
            <span className="text-2xl">⭐</span>
          </motion.div>
        </div>

        <h1 className="text-6xl font-bold text-white mb-4">404</h1>

        <h2 className="text-2xl font-bold text-dream-purple-200 mb-4">
          Page Not Found
        </h2>

        <p className="text-dream-purple-300 mb-8">
          This story seems to have wandered off into dreamland.
          Let&apos;s help you find your way back!
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/">
            <Button
              variant="default"
              size="lg"
              className="bg-white text-dream-purple-700 hover:bg-dream-purple-50 w-full sm:w-auto"
            >
              <Home className="mr-2 h-5 w-5" />
              Go Home
            </Button>
          </Link>

          <Link href="/library">
            <Button
              variant="outline"
              size="lg"
              className="border-white/30 text-white hover:bg-white/10 w-full sm:w-auto"
            >
              <BookOpen className="mr-2 h-5 w-5" />
              View Library
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
