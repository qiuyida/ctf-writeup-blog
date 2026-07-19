import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { copyFileSync, writeFileSync } from 'fs'

export default defineConfig({
  // 环境感知：GitHub Pages 需要子路径，Vercel 根路径
  base: process.env.VERCEL ? '/' : '/ctf-writeup-blog/',
  plugins: [
    react(),
    {
      name: 'spa-fallback',
      closeBundle() {
        copyFileSync('dist/index.html', 'dist/404.html')
        writeFileSync('dist/.nojekyll', '')
      }
    }
  ],
  server: {
    host: '0.0.0.0',
    port: 3000,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'framer-motion': ['framer-motion'],
          'tsparticles': ['@tsparticles/react', '@tsparticles/slim', 'tsparticles'],
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
        }
      }
    }
  },
  // 排除 public/gargantua 中的 import map 文件，避免 Vite 误扫描
  optimizeDeps: {
    entries: ['index.html', 'src/**/*.{js,jsx}'],
  },
})
