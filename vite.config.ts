import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { motionStudioServer } from "./scripts/motion-studio-server.mjs";

export default defineConfig({
  plugins: [react(), motionStudioServer()],
  optimizeDeps: { entries: ["index.html"] },
  server: {
    port: 5173,
    watch: {
      ignored: [
        "**/.venv-intelligence/**",
        "**/.music-work/**",
        "**/.motion-exports/**",
        "**/.studio-tts/**",
        "**/.motion-qa/**",
      ],
    },
  },
  build: {
    outDir: "dist",
  },
});
