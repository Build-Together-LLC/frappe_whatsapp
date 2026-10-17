import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
import path from 'path';

export default defineConfig({
  plugins: [react(), svgr()],
  define: { 'process.env.NODE_ENV': '"production"' },
  resolve: { alias: { '@': path.resolve(__dirname, './src') } },
  build: {
    outDir: '../frappe_whatsapp/public/personal_whatsapp',
    emptyOutDir: true,
    target: 'es2019',
    lib: {
      entry: path.resolve(__dirname, 'src/main.tsx'),
      formats: ['iife'],
      name: 'PersonalWhatsapp',
      fileName: () => 'personal_whatsapp.js',
    },
    rollupOptions: {
      output: { assetFileNames: 'personal_whatsapp.[ext]' },
    },
  },
});
