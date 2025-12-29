"use client";

import { motion } from "framer-motion";
import { Moon, Stars } from "lucide-react";

export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-dream-purple-900 via-dream-purple-800 to-dream-blue-900 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center"
      >
        <div className="relative mb-6">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            className="relative"
          >
            <Moon className="h-16 w-16 text-dream-yellow-200" />
          </motion.div>
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute -top-2 -right-2"
          >
            <Stars className="h-8 w-8 text-dream-yellow-200" />
          </motion.div>
        </div>
        <motion.p
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="text-dream-purple-200 text-lg font-medium"
        >
          Loading magical stories...
        </motion.p>
      </motion.div>
    </div>
  );
}
