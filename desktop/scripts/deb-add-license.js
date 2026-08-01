// electron-builder afterAllArtifactBuild hook.
// Injects the project LICENSE statically into every generated .deb at
// /usr/share/doc/associago-desktop/LICENSE, updates
// md5sums and repacks. Runs under fakeroot so files stay owned by root:root.

const { execFileSync } = require('child_process')
const path = require('path')
const fs = require('fs')

exports.default = async function (context) {
  const debs = (context.artifactPaths || []).filter((p) => p.endsWith('.deb'))
  if (debs.length === 0) return

  const licenseSrc = path.resolve(__dirname, '..', '..', 'LICENSE')
  if (!fs.existsSync(licenseSrc)) {
    console.warn('[deb-add-license] LICENSE not found at', licenseSrc, '- skipping')
    return
  }

  const script = path.join(__dirname, 'deb-add-license.sh')
  for (const deb of debs) {
    console.log('[deb-add-license] injecting license into', deb)
    execFileSync('fakeroot', ['bash', script, deb, licenseSrc], { stdio: 'inherit' })
  }
}
