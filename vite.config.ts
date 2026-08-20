/// <reference types="vitest" />
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [react()],
    test: {
      environment: 'node',
    },
    server: {
      proxy: {
        '/api/embed': {
          target: 'https://api.openai.com',
          changeOrigin: true,
          rewrite: () => '/v1/embeddings',
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq) => {
              proxyReq.setHeader(
                'Authorization',
                `Bearer ${env.OPENAI_API_KEY}`,
              )
            })
          },
        },
      },
    },
  }
})
