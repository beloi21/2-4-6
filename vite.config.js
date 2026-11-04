import { defineConfig } from 'vite';

export default defineConfig({
  // Relative paths so it works at /2-4-6/ on GitHub Pages and anywhere else.
  base: './',
  build: { chunkSizeWarningLimit: 900 },
});
