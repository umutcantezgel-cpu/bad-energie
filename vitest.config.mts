import path from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['src/**/*.test.ts', 'test/**/*.test.ts', 'scripts/**/*.test.ts'],
    environment: 'node',
    globals: false,
    setupFiles: ['test/setup.ts'],
    testTimeout: 30000,
    // Migration und Seed einer frischen PGlite-Datenbank laufen in Hooks; unter paralleler Last
    // reichen die 10 Sekunden der Vorgabe nicht.
    hookTimeout: 30000,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      'server-only': path.resolve(__dirname, 'test/stubs/server-only.ts'),
    },
  },
});
