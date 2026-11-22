import { configDefaults, defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './',
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['src/test-setup.ts'],
    // Agent worktrees hold full copies of the repo.
    exclude: [...configDefaults.exclude, '.claude/worktrees/**'],
  },
});
