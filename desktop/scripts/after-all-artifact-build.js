// electron-builder afterAllArtifactBuild hook.
//
// Two jobs:
//   1. run scripts/deb-finalize.js under fakeroot on every produced .deb
//   2. clear scripts/.release-pending.json, marking the bumped version as
//      actually released so the next build bumps again
//
// The marker is only cleared once the artifacts exist, so a build that fails
// earlier keeps its pending version and gets reused instead of skipping a
// number on the next attempt.

const fs = require('fs')
const path = require('path')
const { spawnSync } = require('child_process')
const meta = require('./lib/release-meta')

function log(message) {
  console.log(`[after-build] ${message}`)
}

function hasCommand(cmd) {
  return spawnSync('sh', ['-c', `command -v ${cmd}`], { stdio: 'ignore' }).status === 0
}

function clearPendingMarker() {
  if (!fs.existsSync(meta.paths.pendingRelease)) return
  fs.unlinkSync(meta.paths.pendingRelease)
  log(`release ${meta.currentVersion()} completed, pending marker cleared`)
}

exports.default = async function (context) {
  const debs = (context.artifactPaths || []).filter((artifact) => artifact.endsWith('.deb'))

  if (debs.length > 0) {
    if (!hasCommand('fakeroot')) {
      // Without fakeroot the repacked archive would install files owned by the
      // building user, so refuse rather than ship a broken package.
      throw new Error(
        'fakeroot is required to finalize .deb packages (apt install fakeroot). ' +
          `Artifacts left unfinalized: ${debs.join(', ')}`
      )
    }

    const script = path.join(__dirname, 'deb-finalize.js')
    for (const deb of debs) {
      log(`finalizing ${deb}`)
      const result = spawnSync('fakeroot', [process.execPath, script, deb], { stdio: 'inherit' })
      if (result.error) throw result.error
      if (result.status !== 0) {
        throw new Error(`deb-finalize failed for ${deb} (exit ${result.status})`)
      }
    }
  } else {
    log('no .deb artifacts in this build')
  }

  clearPendingMarker()
}
