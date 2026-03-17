import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';
import tailwind from '@astrojs/tailwind';

// https://astro.build/config
export default defineConfig({
  output: 'server',
  integrations: [tailwind()],
  vite: {
    server: {
      port: 4321,
      strictPort: true
    }
  },
  adapter: vercel(),
  security: {
    checkOrigin: false
  }
});