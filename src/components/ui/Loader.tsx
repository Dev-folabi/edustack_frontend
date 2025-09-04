"use client";

import React from "react";
import { motion } from "framer-motion";

interface LoaderProps {
  size?: "sm" | "md" | "lg";
  text?: string;
  fullScreen?: boolean;
}

const sizeClasses = {
  sm: "w-6 h-6",
  md: "w-10 h-10",
  lg: "w-16 h-16",
};

export const Loader: React.FC<LoaderProps> = ({
  size = "md",
  text,
  fullScreen = false,
}) => {
  const LoaderContent = () => (
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        {/* Outer ring */}
        <motion.div
          className={`${sizeClasses[size]} rounded-full border-2 border-white/20`}
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        />

        {/* Inner spinning element */}
        <motion.div
          className={`absolute inset-0 ${sizeClasses[size]} rounded-full border-2 border-transparent border-t-blue-400 border-r-purple-400`}
          animate={{ rotate: -360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />

        {/* Center dot */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            className="w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          />
        </div>
      </div>

      {text && (
        <motion.p
          className="text-white/80 text-sm font-medium"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          {text}
        </motion.p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-8">
          <LoaderContent />
        </div>
      </div>
    );
  }

  return <LoaderContent />;
};

// Button loader variant
export const ButtonLoader: React.FC = () => (
  <motion.div
    className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
    animate={{ rotate: 360 }}
    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
  />
);
