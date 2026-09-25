"use client";

/** Stub translator: the second argument is the English fallback. */
export function useT() {
  return (key: string, fallback?: string) => fallback ?? key;
}
