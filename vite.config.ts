import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// `base` must match the GitHub Pages project subpath (berndpl.github.io/Packspace/).
// Vite's dev server ignores it, so local dev is unaffected.
export default defineConfig({
  base: '/Packspace/',
  plugins: [react()],
  build: { outDir: 'dist' },
});
