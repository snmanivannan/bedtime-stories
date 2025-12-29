"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { Moon, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-dream-purple-900 via-dream-purple-800 to-dream-blue-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-md"
      >
        <div className="bg-dream-purple-800/50 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
          <Moon className="h-12 w-12 text-dream-purple-200" />
        </div>

        <h1 className="text-2xl font-bold text-white mb-2">
          Oops! Something went wrong
        </h1>

        <p className="text-dream-purple-200 mb-8">
          Don&apos;t worry, even magical things need a little help sometimes.
          Let&apos;s try that again!
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={reset}
            variant="default"
            size="lg"
            className="bg-white text-dream-purple-700 hover:bg-dream-purple-50"
          >
            <RefreshCw className="mr-2 h-5 w-5" />
            Try Again
          </Button>

          <Button
            onClick={() => (window.location.href = "/")}
            variant="outline"
            size="lg"
            className="border-white/30 text-white hover:bg-white/10"
          >
            <Home className="mr-2 h-5 w-5" />
            Go Home
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
