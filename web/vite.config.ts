import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// BASE_PATH is "/farket/" on GitHub Pages and "/" on a custom domain.
export default defineConfig({
  base: process.env.BASE_PATH ?? '/',
  plugins: [react()],
})
