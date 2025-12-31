import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import keystatic from '@keystatic/astro';
import cloudflare from '@astrojs/cloudflare';

// https://astro.build/config
export default defineConfig({
  site: 'https://piranhastories.com',

  // Static output with per-route SSR for Keystatic (Astro 5.x)
  output: 'static',

  // Cloudflare Pages adapter
  adapter: cloudflare({
    platformProxy: {
      enabled: true,
    },
  }),

  integrations: [
    // React for Keystatic UI
    react(),
    // Keystatic CMS integration
    keystatic(),
  ],

  // Vite configuration for Cloudflare Workers compatibility
  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          // Add any global SCSS options here if needed
        },
      },
    },
    ssr: {
      // Externalize Node.js modules for Cloudflare Workers
      external: ['node:buffer', 'node:async_hooks'],
    },
    resolve: {
      // Use Cloudflare-compatible conditions
      conditions: ['workerd', 'worker', 'browser'],
    },
  },
});