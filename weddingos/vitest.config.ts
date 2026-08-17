import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
  // Mirrors vite.config.ts's `define` block — Vitest does not read vite.config.ts,
  // so these build-time constants need to be provided here too or any test that
  // imports src/lib/appVersion.ts (directly or transitively) fails at import time.
  define: {
    __APP_VERSION__: JSON.stringify('test'),
    __BUILD_TIMESTAMP__: JSON.stringify(new Date(0).toISOString()),
    __GIT_SHA__: JSON.stringify('test'),
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
  },
});
