import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      // The embedded PGlite database lives in .data/ — never let its writes
      // trigger an HMR reload (that would remount the app mid-interaction).
      watch: process.env.DISABLE_HMR === 'true'
        ? null
        : { ignored: ['**/.data/**', '**/dist/**', '**/dist-server/**'] },
      proxy: {
        '/api': {
          target: 'http://localhost:8787',
          changeOrigin: true,
        },
      },
    },
  };
});
