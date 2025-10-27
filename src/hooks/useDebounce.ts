"use client";

import { useState, useEffect } from "react";

/**
 * A custom hook to debounce a value.
 * @param value The value to debounce (e.g., a search query).
 * @param delay The debounce delay in milliseconds.
 * @returns The debounced value, which only updates after the specified delay.
 */
export function useDebounce<T>(value: T, delay: number): T {
  // State to store the debounced value
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
}
