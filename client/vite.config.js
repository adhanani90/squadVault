import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwind from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwind(),
  ],
  server: {
    port: 5173,
    proxy: {
      '/auth':    { target: 'http://localhost:3000', changeOrigin: true },
      '/clubs':   { target: 'http://localhost:3000', changeOrigin: true },
      '/players': { target: 'http://localhost:3000', changeOrigin: true },
    }
  }
});
