import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
      '@vyntric/shared': path.resolve(__dirname, './packages/shared/src/index.ts'),
      '@vyntric/db': path.resolve(__dirname, './packages/db/src/index.ts'),
    },
  },
});
