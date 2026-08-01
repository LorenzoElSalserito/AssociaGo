import { resolve } from 'path'
import { defineConfig } from 'electron-vite'
import react from '@vitejs/plugin-react'

const rendererInputs = {
  index: resolve('src/renderer/index.html'),
  splash: resolve('src/renderer/splash.html')
}

if (process.env.ASSOCIAGO_MANUAL_E2E === '1') {
  rendererInputs.manualE2e = resolve('src/renderer/manual-e2e.html')
}

export default defineConfig({
  main: {},
  preload: {},
  renderer: {
    build: {
      rollupOptions: {
        input: {
          ...rendererInputs
        }
      }
    },
    resolve: {
      alias: {
        '@renderer': resolve('src/renderer/src')
      }
    },
    plugins: [react()]
  }
})
