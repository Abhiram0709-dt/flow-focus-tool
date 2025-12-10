import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const plugins = [react()];

  // Only include componentTagger in development mode
  // In production builds, this will be skipped automatically
  if (mode === "development") {
    try {
      // Dynamic import to avoid issues in production
      const lovableTagger = require("lovable-tagger");
      if (lovableTagger?.componentTagger) {
        plugins.push(lovableTagger.componentTagger());
      }
    } catch {
      // Ignore errors - lovable-tagger is optional
    }
  }

  return {
    server: {
      host: "::",
      port: 8080,
      strictPort: false,
      // Proxy headers to help with Turnstile
      proxy: {}
    },
    plugins,
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    build: {
      outDir: "dist",
      sourcemap: false,
      rollupOptions: {
        output: {
          manualChunks: undefined,
        },
      },
      commonjsOptions: {
        include: [/node_modules/],
        transformMixedEsModules: true,
      },
    },
    optimizeDeps: {
      include: ["axios"],
    },
  };
});

