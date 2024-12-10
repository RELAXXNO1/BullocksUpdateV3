import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import * as path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/components': path.resolve(__dirname, './src/components'),
      '@/pages': path.resolve(__dirname, './src/pages')
    }
  },
  // Add build configuration for Netlify
  build: {
    outDir: 'dist',
    rollupOptions: {
      external: ['react-phone-number-input/input']
    }
  }
});
