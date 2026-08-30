// Shared release metadata helpers.
//
// Single source of truth for the version is desktop/package.json.
// Everything else (build.gradle, package-lock.json, artifact names, the
// Debian changelog inside the .deb) is derived from it.
//
// The human-authored input is the "## [Unreleased]" section of CHANGELOG.md.
// On bump that section is consolidated into a released section and mirrored
// into release-history.json, which is the machine-readable source used to
// render the Debian changelog. Nothing here ever shells out to git.

const fs = require('fs')
const path = require('path')

const desktopDir = path.resolve(__dirname, '..', '..')
const repoRoot = path.resolve(desktopDir, '..')

const paths = {
  desktopDir,
  repoRoot,
  packageJson: path.join(desktopDir, 'package.json'),
  packageLock: path.join(desktopDir, 'package-lock.json'),
  buildGradle: path.join(repoRoot, 'build.gradle'),
  changelogMd: path.join(repoRoot, 'CHANGELOG.md'),
  license: path.join(repoRoot, 'LICENSE'),
  releaseHistory: path.join(desktopDir, 'scripts', 'release-history.json'),
  pendingRelease: path.join(desktopDir, 'scripts', '.release-pending.json')
}

const UNRELEASED_HEADING = '## [Unreleased]'
const FALLBACK_ENTRY = 'Maintenance release.'

// ---------------------------------------------------------------------------
// version
// ---------------------------------------------------------------------------

const SEMVER_RE = /^(\d+)\.(\d+)\.(\d+)$/

function parseVersion(value) {
  const match = SEMVER_RE.exec(String(value).trim())
  if (!match) {
    throw new Error(`Version "${value}" is not a plain X.Y.Z semver`)
  }
  return { major: Number(match[1]), minor: Number(match[2]), patch: Number(match[3]) }
}

function formatVersion({ major, minor, patch }) {
  return `${major}.${minor}.${patch}`
}

function bumpVersion(current, level = 'patch') {
  const v = parseVersion(current)
  if (level === 'major') return formatVersion({ major: v.major + 1, minor: 0, patch: 0 })
  if (level === 'minor') return formatVersion({ major: v.major, minor: v.minor + 1, patch: 0 })
  if (level === 'patch') return formatVersion({ major: v.major, minor: v.minor, patch: v.patch + 1 })
  throw new Error(`Unknown bump level "${level}"`)
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'))
}

function currentVersion() {
  return readJson(paths.packageJson).version
}

// ---------------------------------------------------------------------------
// dates
// ---------------------------------------------------------------------------

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

// RFC 2822 date in local time, the format dpkg-parsechangelog expects.
function rfc2822(date = new Date()) {
  const pad = (n) => String(n).padStart(2, '0')
  const offsetMin = -date.getTimezoneOffset()
  const sign = offsetMin >= 0 ? '+' : '-'
  const abs = Math.abs(offsetMin)
  return (
    `${DAYS[date.getDay()]}, ${pad(date.getDate())} ${MONTHS[date.getMonth()]} ${date.getFullYear()} ` +
    `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())} ` +
    `${sign}${pad(Math.floor(abs / 60))}${pad(abs % 60)}`
  )
}

function isoDate(date = new Date()) {
  const pad = (n) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

// ---------------------------------------------------------------------------
// CHANGELOG.md
// ---------------------------------------------------------------------------

function changelogTemplate() {
  return [
    '# Changelog',
    '',
    'Tutte le modifiche rilevanti di AssociaGo sono documentate in questo file.',
    '',
    'Formato ispirato a [Keep a Changelog](https://keepachangelog.com/it/1.1.0/),',
    'versioning [Semantic Versioning](https://semver.org/lang/it/).',
    '',
    'Scrivi le modifiche in corso sotto `## [Unreleased]`: `npm run dist` le consolida',
    'automaticamente nella nuova versione e le pubblica nel changelog Debian del `.deb`.',
    '',
    UNRELEASED_HEADING,
    '',
    ''
  ].join('\n')
}

function readChangelog() {
  if (!fs.existsSync(paths.changelogMd)) return changelogTemplate()
  return fs.readFileSync(paths.changelogMd, 'utf8')
}

// Returns the raw body between "## [Unreleased]" and the next "## " heading.
function extractUnreleasedBody(markdown) {
  const lines = markdown.split('\n')
  const start = lines.findIndex((line) => line.trim() === UNRELEASED_HEADING)
  if (start === -1) return { found: false, body: '', start: -1, end: -1 }

  let end = lines.length
  for (let i = start + 1; i < lines.length; i++) {
    if (/^##\s/.test(lines[i])) {
      end = i
      break
    }
  }
  return { found: true, body: lines.slice(start + 1, end).join('\n'), start, end }
}

// Flattens a Keep a Changelog body into plain Debian bullet strings.
// "### Added" + "- foo" becomes "Added: foo"; bare "- foo" stays "foo".
// Continuation lines of a bullet are folded into the same entry.
function parseEntries(body) {
  const entries = []
  let category = null
  let current = null

  const flush = () => {
    if (current) {
      const text = current.replace(/\s+/g, ' ').trim()
      if (text) entries.push(text)
    }
    current = null
  }

  for (const rawLine of body.split('\n')) {
    const line = rawLine.replace(/\s+$/, '')
    if (!line.trim()) {
      flush()
      continue
    }

    const heading = /^#{3,6}\s+(.*)$/.exec(line.trim())
    if (heading) {
      flush()
      category = heading[1].trim().replace(/[:：]\s*$/, '')
      continue
    }

    const bullet = /^\s*[-*+]\s+(.*)$/.exec(line)
    if (bullet) {
      flush()
      const text = bullet[1].trim()
      current = category ? `${category}: ${text}` : text
      continue
    }

    if (current) {
      current += ` ${line.trim()}`
    }
  }
  flush()

  return entries
}

// Rewrites CHANGELOG.md: empties [Unreleased] and inserts the released section.
function consolidateChangelog(markdown, version, dateIso, entries) {
  const source = markdown.includes(UNRELEASED_HEADING) ? markdown : changelogTemplate()
  const lines = source.split('\n')
  const { start, end } = extractUnreleasedBody(source)

  const released = [`## [${version}] - ${dateIso}`, '']
  for (const entry of entries) released.push(`- ${entry}`)
  released.push('')

  const head = lines.slice(0, start + 1)
  const tail = lines.slice(end)

  return [...head, '', ...released, ...tail].join('\n').replace(/\n{3,}/g, '\n\n')
}

// ---------------------------------------------------------------------------
// release-history.json
// ---------------------------------------------------------------------------

function readHistory() {
  if (!fs.existsSync(paths.releaseHistory)) return { releases: [] }
  const data = readJson(paths.releaseHistory)
  if (!Array.isArray(data.releases)) return { releases: [] }
  return data
}

// Debian changelog, newest first. Rendered from release-history.json so the
// output never depends on re-parsing markdown at package time.
function renderDebianChangelog(history, pkgName, maintainer) {
  const blocks = []
  for (const release of history.releases) {
    const entries = release.entries && release.entries.length ? release.entries : [FALLBACK_ENTRY]
    const body = entries.map((entry) => wrapEntry(entry)).join('\n')
    blocks.push(
      `${pkgName} (${release.version}) ${release.distribution || 'unstable'}; ` +
        `urgency=${release.urgency || 'medium'}\n\n` +
        `${body}\n\n` +
        ` -- ${release.maintainer || maintainer}  ${release.date}\n`
    )
  }
  return blocks.join('\n')
}

// Debian changelog bullets: "  * text", continuation lines indented by 4.
function wrapEntry(text, width = 76) {
  const words = String(text).replace(/\s+/g, ' ').trim().split(' ')
  const lines = []
  let line = '  *'
  for (const word of words) {
    if (line.length + 1 + word.length > width && line !== '  *') {
      lines.push(line)
      line = '   '
    }
    line += ` ${word}`
  }
  lines.push(line)
  return lines.join('\n')
}

module.exports = {
  paths,
  UNRELEASED_HEADING,
  FALLBACK_ENTRY,
  parseVersion,
  formatVersion,
  bumpVersion,
  currentVersion,
  readJson,
  rfc2822,
  isoDate,
  changelogTemplate,
  readChangelog,
  extractUnreleasedBody,
  parseEntries,
  consolidateChangelog,
  readHistory,
  renderDebianChangelog,
  wrapEntry
}
