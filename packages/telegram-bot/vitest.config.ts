import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'dist/',
        '**/*.config.*',
        '**/*.test.ts',
        '**/*.spec.ts',
        'src/index.ts', // Entry point, minimal logic
      ],
      thresholds: {
        lines: 70,
        functions: 70,
        branches: 70,
        statements: 70,
      },
    },
  },
  resolve: {
    alias: {
      '@blihops/core': path.resolve(__dirname, '../core/src'),
      '@blihops/shared': path.resolve(__dirname, '../shared/src'),
    },
  },
});


