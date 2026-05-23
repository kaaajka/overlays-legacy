// src/debug.ts
export const debugLog = (...args: unknown[]) => {
  if (import.meta.env.DEV || import.meta.env.VITE_DEBUG_LOGS === "true") {
    console.log(...args);
  }
};
