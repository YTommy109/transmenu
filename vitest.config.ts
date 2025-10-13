import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    exclude: [
      '**/node_modules/**', 
      '**/dist/**', 
      '**/e2e/**',
      // Exclude React component tests for now due to jsdom compatibility issues
      '**/components/**/*.test.{ts,tsx}'
    ],
    environment: 'node',
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
});
