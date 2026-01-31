/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import { devtools } from '@tanstack/devtools-vite'
import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

import { tanstackRouter } from '@tanstack/router-plugin/vite'
import { fileURLToPath, URL } from 'node:url'

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined
          // React core (often loaded first)
          if (id.includes('react-dom') || id.includes('/react/')) {
            return 'react-vendor'
          }
          // TanStack (router, query, devtools)
          if (id.includes('@tanstack')) {
            return 'tanstack'
          }
          // Supabase client (can be large)
          if (id.includes('@supabase')) {
            return 'supabase'
          }
          // Radix UI primitives
          if (id.includes('@radix-ui')) {
            return 'radix'
          }
          // DnD kit
          if (id.includes('@dnd-kit')) {
            return 'dnd-kit'
          }
          // Icons (lucide can be large if many icons are used)
          if (id.includes('lucide-react')) {
            return 'lucide'
          }
          // Everything else from node_modules
          return 'vendor'
        },
      },
    },
    chunkSizeWarningLimit: 600, // optional: raise if you still see warnings for intentional chunks
  },
  test: {
    passWithNoTests: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json-summary'],
      reportsDirectory: 'coverage',
    },
  },
  plugins: [
    devtools(),
    tanstackRouter({
      target: 'react',
      autoCodeSplitting: true,
    }),
    viteReact(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
