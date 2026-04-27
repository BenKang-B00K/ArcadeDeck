import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// Inject <link rel="modulepreload"> for the entry chunk near the top of <head>
// so the browser starts the entry fetch in parallel with HTML parsing instead
// of waiting until the bottom <script type="module"> tag is parsed.
function preloadEntry(): Plugin {
  return {
    name: 'preload-entry',
    enforce: 'post',
    transformIndexHtml(html, ctx) {
      const bundle = ctx.bundle;
      if (!bundle) return html;
      const entry = Object.values(bundle).find(
        (c): c is import('rollup').OutputChunk =>
          c.type === 'chunk' && c.isEntry && c.fileName.endsWith('.js'),
      );
      if (!entry) return html;
      const tag = `<link rel="modulepreload" crossorigin href="/${entry.fileName}">`;
      return html.replace('<head>', `<head>\n    ${tag}`);
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    preloadEntry(),
    VitePWA({
      registerType: 'prompt',
      includeAssets: ['favicon.ico', 'images/favicon.webp', 'images/arcadedeck-banner.webp'],
      manifest: {
        name: 'ArcadeDeck | The Ultimate Free Browser Games Platform',
        short_name: 'ArcadeDeck',
        description: 'Play the best free online browser games on ArcadeDeck. High-quality Action, RPG, Strategy, and Idle games.',
        theme_color: '#050507',
        background_color: '#050507',
        display: 'standalone',
        icons: [
          {
            src: 'images/icon-192x192.webp',
            sizes: '192x192',
            type: 'image/webp'
          },
          {
            src: 'images/icon-512x512.webp',
            sizes: '512x512',
            type: 'image/webp'
          },
          {
            src: 'images/icon-512x512.webp',
            sizes: '512x512',
            type: 'image/webp',
            purpose: 'maskable'
          }
        ]
      }
    })
  ],
  base: '/',
  build: {
    target: 'es2015', // Increase compatibility for older browsers like Firefox
    cssTarget: 'chrome61', // Better CSS compatibility
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          firebase: ['firebase/app', 'firebase/firestore/lite'],
          icons: ['lucide-react'],
        },
      },
    },
  },
})
