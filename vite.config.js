import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true,
    // 重要：確保 Service Worker 被正確提供
    headers: {
      'Service-Worker-Allowed': '/',
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'terser',
  },
  // 確保文件作為資源被複製
  publicDir: 'public',
});
