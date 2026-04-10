const fs = require('fs')
const path = require('path')

const desktopDir = path.resolve(__dirname, '..')

const requiredFiles = [
  'out/main/index.js',
  'out/preload/index.js',
  'out/renderer/index.html',
  'out/renderer/splash.html',
  'build/icon.png',
  'build/icon.ico',
  'build/icon.icns'
]

const missing = requiredFiles.filter((relativePath) => {
  return !fs.existsSync(path.join(desktopDir, relativePath))
})

if (missing.length > 0) {
  console.error('[verify-packaging-assets] Missing required files:')
  for (const relativePath of missing) {
    console.error(`  - ${relativePath}`)
  }
  process.exit(1)
}

console.log('[verify-packaging-assets] Packaging assets look consistent.')
