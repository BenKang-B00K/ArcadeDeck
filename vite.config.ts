import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt',
      includeAssets: ['favicon.ico', 'images/Favicon.webp', 'images/ArcadeDeck Banner.webp'],
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
        },
      },
    },
  },
})
