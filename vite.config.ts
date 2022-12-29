import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [svelte()],
  server: {
    proxy: {
      '/discord-api': {
        target: 'https://discord.com/api',
        rewrite: path => path.replace('/discord-api', ''),
        changeOrigin: true,
        secure: false
      }
    }
  }
})
