import { defineConfig } from 'vite';
import path from 'path';
import fs from 'fs';
import react from '@vitejs/plugin-react';
import { viteStaticCopy } from 'vite-plugin-static-copy';

const tinymcePath = path.resolve(__dirname, 'node_modules/tinymce');

function serveTinyMCE() {
  return {
    name: 'serve-tinymce',
    configureServer(server: { middlewares: { use: (fn: (req: any, res: any, next: () => void) => void) => void } }) {
      server.middlewares.use((req, res, next) => {
        if (!req.url?.startsWith('/tinymce/')) return next();
        const subpath = req.url.replace(/^\/tinymce\/?/, '') || 'tinymce.min.js';
        const filePath = path.resolve(tinymcePath, subpath);
        if (!filePath.startsWith(tinymcePath + path.sep) && filePath !== tinymcePath) return next();
        if (!fs.existsSync(filePath)) return next();
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) return next();
        res.setHeader('Content-Type', req.url.endsWith('.js') ? 'application/javascript' : 'text/css');
        res.end(fs.readFileSync(filePath));
      });
    },
  };
}

export default defineConfig({
  plugins: [
    react(),
    serveTinyMCE(),
    viteStaticCopy({
      targets: [
        {
          src: 'node_modules/tinymce/tinymce.min.js',
          dest: 'tinymce',
        },
        {
          src: 'node_modules/tinymce/themes',
          dest: 'tinymce',
        },
        {
          src: 'node_modules/tinymce/plugins',
          dest: 'tinymce',
        },
        {
          src: 'node_modules/tinymce/icons',
          dest: 'tinymce',
        },
        {
          src: 'node_modules/tinymce/models',
          dest: 'tinymce',
        },
        {
          src: 'node_modules/tinymce/skins',
          dest: 'tinymce',
        },
      ],
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5174,
    fs: { allow: ['.', 'node_modules'] },
  },
});
