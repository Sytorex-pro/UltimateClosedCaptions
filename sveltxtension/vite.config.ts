import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import basicSsl from '@vitejs/plugin-basic-ssl';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [svelte(), basicSsl()],
  server: {
    port: 5174
  },
  base: './',
  build: {
    minify: false,
    sourcemap: true,
  }
})
