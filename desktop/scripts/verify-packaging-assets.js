const fs = require('fs')
const path = require('path')

const desktopDir = path.resolve(__dirname, '..')

const requiredFiles = [
  'out/main/index.js',
  'out/preload/index.js',
  'out/renderer/index.html',
  'out/renderer/splash.html'
]

const missing = requiredFiles.filter((relativePath) => {
  return !fs.existsSync(path.join(desktopDir, relativePath))
})

const iconPairs = [
  ['build/icon.png', 'resources/icon.png'],
  ['build/icon.ico', 'resources/icon.ico'],
  ['build/icon.icns', 'resources/icon.icns'],
  ['build/background.png', 'resources/background.png']
]

for (const [preferredPath, fallbackPath] of iconPairs) {
  const preferredExists = fs.existsSync(path.join(desktopDir, preferredPath))
  const fallbackExists = fs.existsSync(path.join(desktopDir, fallbackPath))

  if (!preferredExists && !fallbackExists) {
    missing.push(`${preferredPath} (or ${fallbackPath})`)
  }
}

if (missing.length > 0) {
  console.error('[verify-packaging-assets] Missing required files:')
  for (const relativePath of missing) {
    console.error(`  - ${relativePath}`)
  }
  process.exit(1)
}

// Version coherence: package.json is the single source of truth. Anything that
// carries a copy of the version must agree with it, or the .deb ends up
// labelled with one version while shipping another.
const meta = require('./lib/release-meta')

const pkg = meta.readJson(meta.paths.packageJson)
const version = pkg.version
const problems = []

const lock = meta.readJson(meta.paths.packageLock)
if (lock.version !== version) {
  problems.push(`package-lock.json version is ${lock.version}, expected ${version}`)
}
if (lock.packages && lock.packages[''] && lock.packages[''].version !== version) {
  problems.push(`package-lock.json packages[""].version is ${lock.packages[''].version}, expected ${version}`)
}

const gradle = fs.readFileSync(meta.paths.buildGradle, 'utf8')
const gradleVersion = /^version\s*=\s*['"]([^'"]*)['"]\s*$/m.exec(gradle)
if (!gradleVersion) {
  problems.push("build.gradle has no top-level `version = '...'` assignment")
} else if (gradleVersion[1] !== version) {
  problems.push(`build.gradle version is ${gradleVersion[1]}, expected ${version}`)
}

const artifactName = pkg.build && pkg.build.artifactName
if (artifactName !== 'associago_v${version}.${ext}') {
  problems.push(
    `build.artifactName is "${artifactName}", expected the literal macro associago_v\${version}.\${ext}`
  )
}

const history = meta.readHistory()
if (!history.releases.some((release) => release.version === version)) {
  problems.push(`release-history.json has no entry for ${version} (run: npm run version:bump)`)
}

const changelog = meta.readChangelog()
if (!changelog.includes(`## [${version}]`)) {
  problems.push(`CHANGELOG.md has no section for ${version} (run: npm run version:bump)`)
}

if (problems.length > 0) {
  console.error('[verify-packaging-assets] Version references are inconsistent:')
  for (const problem of problems) {
    console.error(`  - ${problem}`)
  }
  process.exit(1)
}

console.log(`[verify-packaging-assets] Packaging assets look consistent (version ${version}).`)
