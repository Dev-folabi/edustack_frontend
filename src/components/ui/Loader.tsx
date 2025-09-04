"use client";

import React from "react";
import { motion } from "framer-motion";

interface LoaderProps {
  size?: "sm" | "md" | "lg";
  text?: string;
  fullScreen?: boolean;
}

const sizeClasses = {
  sm: "w-4 h-4",
  md: "w-8 h-8",
  lg: "w-12 h-12",
};

export const Loader: React.FC<LoaderProps> = ({
  size = "md",
  text,
  fullScreen = false,
}) => {
  const LoaderSpinner = () => (
    <motion.div
      className={`${sizeClasses[size]} border-2 border-gray-200 border-t-sky-500 rounded-full`}
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
    />
  );

  const LoaderContent = () => (
    <div className="flex flex-col items-center justify-center gap-4">
      <LoaderSpinner />
      {text && (
        <p className="text-gray-600 text-sm font-medium">
          {text}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-50">
        <div className="bg-white rounded-lg p-8 shadow-lg">
          <LoaderContent />
        </div>
      </div>
    );
  }

  return <LoaderContent />;
};

export const ButtonLoader: React.FC = () => (
    <motion.div
      className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full"
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
    />
);
