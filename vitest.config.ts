import { defineConfig } from 'vitest/config';
import path from 'node:path';

/**
 * Minimal Vitest config: Node environment (no DOM needed — every test here
 * exercises the pricing engine and validation schemas, not React
 * components), with the same `@/` → `src/` alias used everywhere else in
 * the app so test files can import modules exactly like application code
 * does.
 */
export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
