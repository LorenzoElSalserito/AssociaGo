#!/usr/bin/env node
// Advances the project version and propagates it to every reference, then
// consolidates CHANGELOG.md's [Unreleased] section into the new release.
//
//   node scripts/version-bump.js                 # x.y.(z+1)
//   node scripts/version-bump.js --minor         # x.(y+1).0
//   node scripts/version-bump.js --major         # (x+1).0.0
//   node scripts/version-bump.js --set 1.2.3     # explicit
//   node scripts/version-bump.js --no-bump       # only re-sync derived refs
//   node scripts/version-bump.js --dry-run       # print, write nothing
//
// Touched files:
//   desktop/package.json        version + build.artifactName macro
//   desktop/package-lock.json   version + packages[""].version
//   build.gradle                version = 'X.Y.Z'
//   CHANGELOG.md                [Unreleased] -> [X.Y.Z] - YYYY-MM-DD
//   desktop/scripts/release-history.json     machine-readable release record
//
// Crash safety: a build that dies after the bump leaves
// scripts/.release-pending.json behind. The next run detects it and reuses the
// pending version instead of bumping again, so failed builds never burn
// version numbers. The marker is cleared by the afterAllArtifactBuild hook.
//
// Writes are staged in memory and flushed at the end; a failure mid-flush
// rolls every file back to its previous content.

const fs = require('fs')
const meta = require('./lib/release-meta')

const ARTIFACT_NAME = 'associago_v${version}.${ext}'

function parseArgs(argv) {
  const options = { level: 'patch', explicit: null, dryRun: false, bump: true, force: false }
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]
    if (arg === '--dry-run' || arg === '-n') options.dryRun = true
    else if (arg === '--major') options.level = 'major'
    else if (arg === '--minor') options.level = 'minor'
    else if (arg === '--patch') options.level = 'patch'
    else if (arg === '--no-bump') options.bump = false
    else if (arg === '--force') options.force = true
    else if (arg === '--set') options.explicit = argv[++i]
    else if (arg.startsWith('--set=')) options.explicit = arg.slice('--set='.length)
    else throw new Error(`Unknown argument "${arg}"`)
  }
  return options
}

function log(message) {
  console.log(`[version-bump] ${message}`)
}

// --- individual file transforms --------------------------------------------

function updatePackageJson(raw, version) {
  const pkg = JSON.parse(raw)
  pkg.version = version
  pkg.build = pkg.build || {}
  // Hardcoded artifact names were the main source of drift; pin the macro once
  // so electron-builder resolves it from the version at build time.
  pkg.build.artifactName = ARTIFACT_NAME
  return `${JSON.stringify(pkg, null, 2)}\n`
}

function updatePackageLock(raw, version) {
  const lock = JSON.parse(raw)
  lock.version = version
  if (lock.packages && lock.packages['']) lock.packages[''].version = version
  return `${JSON.stringify(lock, null, 2)}\n`
}

// Only the top-level `version = '...'` assignment; dependency coordinates and
// plugin versions carry their own quoting and are never at column 0.
function updateBuildGradle(raw, version) {
  const re = /^version\s*=\s*(['"])([^'"]*)\1\s*$/m
  if (!re.test(raw)) {
    throw new Error("build.gradle: top-level `version = '...'` assignment not found")
  }
  return raw.replace(re, `version = '${version}'`)
}

// --- history ---------------------------------------------------------------

function upsertRelease(history, release) {
  const releases = history.releases.filter((r) => r.version !== release.version)
  releases.unshift(release)
  return { releases }
}

// --- main ------------------------------------------------------------------

function run(argv) {
  const options = parseArgs(argv)
  const paths = meta.paths

  const packageRaw = fs.readFileSync(paths.packageJson, 'utf8')
  const lockRaw = fs.readFileSync(paths.packageLock, 'utf8')
  const gradleRaw = fs.readFileSync(paths.buildGradle, 'utf8')
  const changelogRaw = meta.readChangelog()

  const fromVersion = JSON.parse(packageRaw).version
  meta.parseVersion(fromVersion)

  // Resolve the target version.
  let version
  let bumping = true

  const pending = fs.existsSync(paths.pendingRelease) ? meta.readJson(paths.pendingRelease) : null
  const ciSkip = Boolean(process.env.CI) || process.env.ASSOCIAGO_NO_BUMP === '1'

  if (!options.bump) {
    version = fromVersion
    bumping = false
    log(`--no-bump: keeping ${version}, re-syncing derived references`)
  } else if (options.explicit) {
    version = meta.formatVersion(meta.parseVersion(options.explicit))
  } else if (ciSkip && !options.force) {
    // Every matrix runner executes `npm run dist`; bumping on each would fork
    // the version across platforms for the same release.
    version = fromVersion
    bumping = false
    log(`CI detected (CI/ASSOCIAGO_NO_BUMP): keeping ${version}, no bump`)
  } else if (pending && pending.version === fromVersion && !options.force) {
    version = fromVersion
    bumping = false
    log(`pending release ${version} from an unfinished build: reusing it, no bump`)
  } else {
    version = meta.bumpVersion(fromVersion, options.level)
  }

  const now = new Date()
  const history = meta.readHistory()
  const alreadyRecorded = history.releases.some((r) => r.version === version)

  // Consolidate the changelog when we mint a version, or when the current one
  // has no history record yet (first adoption / CI reusing an unrecorded one).
  const needsChangelog = bumping || !alreadyRecorded

  let entries = []
  let nextChangelog = changelogRaw
  let nextHistory = history

  if (needsChangelog) {
    const unreleased = meta.extractUnreleasedBody(changelogRaw)
    entries = meta.parseEntries(unreleased.body)
    if (entries.length === 0) {
      entries = [meta.FALLBACK_ENTRY]
      log(`[Unreleased] is empty: falling back to "${meta.FALLBACK_ENTRY}"`)
    }
    nextChangelog = meta.consolidateChangelog(changelogRaw, version, meta.isoDate(now), entries)

    const pkg = JSON.parse(packageRaw)
    const maintainer = `${pkg.author.name} <${pkg.author.email}>`
    nextHistory = upsertRelease(history, {
      version,
      date: meta.rfc2822(now),
      distribution: 'unstable',
      urgency: 'medium',
      maintainer,
      entries
    })
  } else {
    log(`release ${version} already recorded in release-history.json`)
  }

  const writes = [
    { file: paths.packageJson, content: updatePackageJson(packageRaw, version) },
    { file: paths.packageLock, content: updatePackageLock(lockRaw, version) },
    { file: paths.buildGradle, content: updateBuildGradle(gradleRaw, version) },
    { file: paths.changelogMd, content: nextChangelog },
    { file: paths.releaseHistory, content: `${JSON.stringify(nextHistory, null, 2)}\n` }
  ]

  // Only a freshly minted version is "pending". Writing the marker when the
  // version is unchanged would make the next real build reuse it and skip its
  // own bump.
  if (bumping) {
    writes.push({
      file: paths.pendingRelease,
      content: `${JSON.stringify({ version, startedAt: now.toISOString() }, null, 2)}\n`
    })
  }

  log(`${fromVersion} -> ${version}${bumping ? '' : ' (unchanged)'}`)
  for (const entry of entries) log(`  * ${entry}`)

  if (options.dryRun) {
    log('--dry-run: no file written')
    for (const write of writes) log(`  would write ${write.file}`)
    return { version, fromVersion, entries, written: false }
  }

  flush(writes)
  for (const write of writes) log(`  wrote ${write.file}`)
  return { version, fromVersion, entries, written: true }
}

// All-or-nothing write: restore previous content if any file fails.
function flush(writes) {
  const backups = []
  try {
    for (const write of writes) {
      const existed = fs.existsSync(write.file)
      backups.push({ file: write.file, existed, content: existed ? fs.readFileSync(write.file) : null })
      fs.writeFileSync(write.file, write.content)
    }
  } catch (error) {
    for (const backup of backups.reverse()) {
      if (backup.existed) fs.writeFileSync(backup.file, backup.content)
      else if (fs.existsSync(backup.file)) fs.unlinkSync(backup.file)
    }
    throw error
  }
}

if (require.main === module) {
  try {
    run(process.argv.slice(2))
  } catch (error) {
    console.error(`[version-bump] ${error.message}`)
    process.exit(1)
  }
}

module.exports = { run, parseArgs, updatePackageJson, updatePackageLock, updateBuildGradle, ARTIFACT_NAME }
