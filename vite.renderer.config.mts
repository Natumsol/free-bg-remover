import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// https://vitejs.dev/config
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    minify: 'esbuild',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          // 将大型依赖单独打包
          vendor: ['react', 'react-dom'],
          i18n: ['i18next', 'react-i18next'],
          ui: ['mobx', 'mobx-react-lite'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
});
