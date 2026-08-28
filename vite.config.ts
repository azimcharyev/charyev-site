import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    rollupOptions: {
      input: {
        home: 'index.html',
        case: 'case.html',
        privacy: 'privacy.html',
        /* GitHub Pages сам отдаёт 404.html на любой неизвестный адрес —
           достаточно, чтобы файл оказался в корне сборки. */
        notFound: '404.html',
      },
    },
  },
  server: {
    port: 5173,
    open: true,
  },
});
