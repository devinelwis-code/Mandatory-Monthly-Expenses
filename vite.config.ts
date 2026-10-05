import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/Mandatory-Monthly-Expenses/',
  resolve: {
    alias: [
      { find: '@', replacement: '/src' }
    ]
  }
});
