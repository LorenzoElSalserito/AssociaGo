#!/usr/bin/env node
// Rebuilds a .deb produced by electron-builder/FPM into a policy-compliant one.
//
//   fakeroot node scripts/deb-finalize.js <path/to/package.deb>
//
// fakeroot is mandatory: dpkg-deb -R/-b must see root:root ownership, otherwise
// the repacked archive installs files owned by the building user.
//
// What it adds or fixes, modelled on a known-good Debian package:
//   usr/share/doc/<pkg>/changelog.gz         real changelog (was an FPM stub)
//   usr/share/doc/<pkg>/copyright            DEP-5 machine-readable
//   usr/share/pixmaps/<pkg>.png              icon lookup by name
//   etc/xdg/autostart/<pkg>.desktop          autostart entry, disabled default
//   DEBIAN/conffiles                         generated from the etc/ payload
//   DEBIAN/control                           valid Section, no bogus fields
//   DEBIAN/md5sums                           regenerated over the whole payload
//   file modes                               dirs 0755, files 0644/0755
//
// Every step is verified before repacking: the changelog must parse with
// dpkg-parsechangelog and md5sums must pass `md5sum -c`.

const fs = require('fs')
const os = require('os')
const path = require('path')
const zlib = require('zlib')
const { execFileSync, spawnSync } = require('child_process')
const meta = require('./lib/release-meta')

const PKG_NAME = 'associago-desktop'
const DOC_REL = `usr/share/doc/${PKG_NAME}`

// "office" is a FreeDesktop menu category, not a Debian archive section, and
// lintian rejects it as unknown-section. The Office menu placement comes from
// Categories=Office in the .desktop file, which is unaffected by this value.
const SECTION = 'misc'

// Debian policy: synopsis <= 80 chars, extended description wrapped at 80.
const DESCRIPTION_WIDTH = 80

// dpkg's canonical binary control field order. Unlisted fields are appended
// before Description, which must stay last so its continuation lines are safe.
const FIELD_ORDER = [
  'Package',
  'Source',
  'Version',
  'Section',
  'Priority',
  'Architecture',
  'Essential',
  'Pre-Depends',
  'Depends',
  'Recommends',
  'Suggests',
  'Enhances',
  'Breaks',
  'Conflicts',
  'Provides',
  'Replaces',
  'Installed-Size',
  'Maintainer',
  'Homepage',
  'Description'
]

// FPM emits these; they are not valid binary package control fields.
const DROP_FIELDS = new Set(['license', 'vendor'])

function log(message) {
  console.log(`[deb-finalize] ${message}`)
}

function sh(cmd, args, options = {}) {
  const result = spawnSync(cmd, args, { encoding: 'utf8', ...options })
  if (result.error) throw result.error
  if (result.status !== 0) {
    throw new Error(`${cmd} ${args.join(' ')} exited with ${result.status}\n${result.stderr || ''}`)
  }
  return result.stdout
}

function hasCommand(cmd) {
  return spawnSync('sh', ['-c', `command -v ${cmd}`], { stdio: 'ignore' }).status === 0
}

// --- control ---------------------------------------------------------------

// Parses an RFC822 control stanza, keeping continuation lines attached.
function parseControl(text) {
  const fields = new Map()
  let currentKey = null
  for (const line of text.split('\n')) {
    if (!line.trim() && !currentKey) continue
    if (/^[ \t]/.test(line) && currentKey) {
      fields.set(currentKey, `${fields.get(currentKey)}\n${line}`)
      continue
    }
    const match = /^([A-Za-z0-9][A-Za-z0-9-]*):\s?(.*)$/.exec(line)
    if (match) {
      currentKey = match[1]
      fields.set(currentKey, match[2])
    }
  }
  return fields
}

function renderControl(fields) {
  const keys = [...fields.keys()]
  const ordered = [
    ...FIELD_ORDER.filter((key) => keys.some((k) => k.toLowerCase() === key.toLowerCase())),
    ...keys.filter((key) => !FIELD_ORDER.some((k) => k.toLowerCase() === key.toLowerCase()))
  ]
  // Description last regardless of where extra fields landed.
  const withoutDescription = ordered.filter((key) => key.toLowerCase() !== 'description')
  const finalOrder = keys.some((k) => k.toLowerCase() === 'description')
    ? [...withoutDescription, 'Description']
    : withoutDescription

  const lines = []
  for (const key of finalOrder) {
    const realKey = keys.find((k) => k.toLowerCase() === key.toLowerCase())
    if (!realKey) continue
    lines.push(`${realKey}: ${fields.get(realKey)}`)
  }
  return `${lines.join('\n')}\n`
}

// Debian wants: synopsis on the field line, extended description indented by
// one space, empty paragraphs written as " .", every line at most 80 columns.
function normalizeDescription(value) {
  const [rawSynopsis, ...rest] = value.split('\n')

  let synopsis = rawSynopsis.trim()
  const overflow = []
  if (synopsis.length > DESCRIPTION_WIDTH) {
    // Never silently lose text: the full sentence moves into the extended
    // description and the synopsis is cut on a word boundary.
    overflow.push(synopsis)
    const cut = synopsis.slice(0, DESCRIPTION_WIDTH)
    synopsis = cut.slice(0, cut.lastIndexOf(' ')).replace(/[ ,;:.]+$/, '')
  }

  const paragraphs = []
  for (const line of [...overflow, ...rest]) {
    const text = line.replace(/^[ \t]+/, '').replace(/\s+$/, '')
    if (text === '' || text === '.') paragraphs.push('')
    else paragraphs.push(text)
  }

  const body = []
  for (const paragraph of paragraphs) {
    if (paragraph === '') {
      if (body.length > 0 && body[body.length - 1] !== ' .') body.push(' .')
      continue
    }
    for (const wrapped of wrapText(paragraph, DESCRIPTION_WIDTH - 1)) body.push(` ${wrapped}`)
  }
  while (body.length > 0 && body[body.length - 1] === ' .') body.pop()

  return [synopsis, ...body].join('\n')
}

function wrapText(text, width) {
  const lines = []
  let line = ''
  for (const word of text.split(/\s+/)) {
    if (line === '') line = word
    else if (line.length + 1 + word.length <= width) line += ` ${word}`
    else {
      lines.push(line)
      line = word
    }
  }
  if (line !== '') lines.push(line)
  return lines
}

function fixControl(controlPath, version) {
  const fields = parseControl(fs.readFileSync(controlPath, 'utf8'))

  for (const key of [...fields.keys()]) {
    if (DROP_FIELDS.has(key.toLowerCase())) {
      fields.delete(key)
      log(`control: dropped non-standard field ${key}`)
    }
  }

  const set = (name, value) => {
    const existing = [...fields.keys()].find((k) => k.toLowerCase() === name.toLowerCase())
    fields.set(existing || name, value)
  }

  set('Section', SECTION)
  set('Priority', 'optional')
  set('Version', version)

  const descriptionKey = [...fields.keys()].find((k) => k.toLowerCase() === 'description')
  if (descriptionKey) set(descriptionKey, normalizeDescription(fields.get(descriptionKey)))

  fs.writeFileSync(controlPath, renderControl(fields))
  log(`control: Section=${SECTION}, Priority=optional, Version=${version}`)
  return fields
}

// --- generated payload files -----------------------------------------------

function detectLicense(licenseText) {
  if (/GNU AFFERO GENERAL PUBLIC LICENSE\s*\n?\s*Version 3/i.test(licenseText)) {
    return {
      id: 'AGPL-3+',
      commonFile: 'AGPL-3',
      name: 'GNU Affero General Public License',
      paragraphs: [
        'This program is free software: you can redistribute it and/or modify',
        'it under the terms of the GNU Affero General Public License as published',
        'by the Free Software Foundation, either version 3 of the License, or (at',
        'your option) any later version.',
        '',
        'This program is distributed in the hope that it will be useful, but',
        'WITHOUT ANY WARRANTY; without even the implied warranty of',
        'MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU',
        'Affero General Public License for more details.',
        '',
        'You should have received a copy of the GNU Affero General Public License',
        'along with this program. If not, see <https://www.gnu.org/licenses/>.'
      ]
    }
  }
  return null
}

function buildCopyright(pkg) {
  const licenseText = fs.existsSync(meta.paths.license)
    ? fs.readFileSync(meta.paths.license, 'utf8')
    : ''
  const license = detectLicense(licenseText)
  const holder = `${pkg.author.name} <${pkg.author.email}>`
  const year = new Date().getFullYear()

  const lines = [
    'Format: https://www.debian.org/doc/packaging-manuals/copyright-format/1.0/',
    `Upstream-Name: ${PKG_NAME}`,
    `Upstream-Contact: ${holder}`,
    `Source: ${pkg.homepage}`,
    '',
    'Files: *',
    `Copyright: ${year} ${holder}`,
    `License: ${license ? license.id : 'unknown'}`,
    ''
  ]

  if (license) {
    lines.push(`License: ${license.id}`)
    for (const paragraph of license.paragraphs) {
      lines.push(paragraph === '' ? ' .' : ` ${paragraph}`)
    }
    lines.push(' .')
    lines.push(
      ` On Debian systems, the complete text of the ${license.name} version 3 can be`
    )
    lines.push(` found in "/usr/share/common-licenses/${license.commonFile}".`)
  } else {
    // No recognised SPDX identifier: embed the licence verbatim so the package
    // still ships its full terms.
    lines.push('License: unknown')
    for (const line of licenseText.split('\n')) {
      lines.push(line.trim() === '' ? ' .' : ` ${line.replace(/\s+$/, '')}`)
    }
  }

  return `${lines.join('\n')}\n`
}

function buildAutostartEntry(pkg) {
  // Shipped disabled: the package must provide the autostart slot without
  // changing how the application behaves after a plain install.
  return [
    '[Desktop Entry]',
    'Type=Application',
    `Name=${pkg.build.productName}`,
    `Comment=${pkg.build.linux.synopsis}`,
    `Exec=/opt/${pkg.build.productName}/${pkg.build.executableName} %U`,
    `Icon=${PKG_NAME}`,
    'Terminal=false',
    `StartupWMClass=${pkg.build.executableName}`,
    'Categories=Office;',
    'Hidden=true',
    'NoDisplay=true',
    'X-GNOME-Autostart-enabled=false',
    ''
  ].join('\n')
}

function gzipDeterministic(text) {
  // level 9 and mtime 0: same input always yields the same bytes, matching
  // `gzip -9 -n` so md5sums stay reproducible across builds.
  return zlib.gzipSync(Buffer.from(text, 'utf8'), { level: 9, mtime: 0 })
}

// --- payload helpers -------------------------------------------------------

function walkFiles(root, base = root, out = []) {
  for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
    const full = path.join(root, entry.name)
    if (entry.isDirectory()) walkFiles(full, base, out)
    else if (entry.isFile() || entry.isSymbolicLink()) out.push(path.relative(base, full))
  }
  return out
}

function regenerateMd5sums(workDir) {
  const files = walkFiles(workDir)
    .filter((rel) => !rel.split(path.sep).includes('DEBIAN'))
    .filter((rel) => fs.lstatSync(path.join(workDir, rel)).isFile())
    .sort()

  const crypto = require('crypto')
  const lines = files.map((rel) => {
    const hash = crypto.createHash('md5').update(fs.readFileSync(path.join(workDir, rel))).digest('hex')
    return `${hash}  ${rel.split(path.sep).join('/')}`
  })
  fs.writeFileSync(path.join(workDir, 'DEBIAN', 'md5sums'), `${lines.join('\n')}\n`)
  fs.chmodSync(path.join(workDir, 'DEBIAN', 'md5sums'), 0o644)
  log(`md5sums: regenerated over ${lines.length} files`)
  return files.length
}

function writeConffiles(workDir) {
  const etcDir = path.join(workDir, 'etc')
  const conffilesPath = path.join(workDir, 'DEBIAN', 'conffiles')
  if (!fs.existsSync(etcDir)) {
    // An empty conffiles file is a policy violation, so omit it entirely.
    if (fs.existsSync(conffilesPath)) fs.unlinkSync(conffilesPath)
    log('conffiles: no etc/ payload, file omitted')
    return []
  }
  const entries = walkFiles(etcDir, workDir)
    .map((rel) => `/${rel.split(path.sep).join('/')}`)
    .sort()
  fs.writeFileSync(conffilesPath, `${entries.join('\n')}\n`)
  fs.chmodSync(conffilesPath, 0o644)
  log(`conffiles: ${entries.length} entr${entries.length === 1 ? 'y' : 'ies'}`)
  return entries
}

function changelogFileName(version) {
  // dpkg calls a package "native" when its version carries no Debian revision.
  return version.includes('-') ? 'changelog.Debian.gz' : 'changelog.gz'
}

const SHARED_LIB_RE = /\.so(\.\d+)*$/

const MAINTAINER_SCRIPTS = ['preinst', 'postinst', 'prerm', 'postrm', 'config']

// Lists the staging tree with the modes dpkg-deb will actually record.
//
// Under fakeroot the on-disk mode and the mode dpkg-deb sees are two different
// things: fakeroot keeps its own ownership/permission database and wraps
// stat/lstat, but not the statx syscall Node uses, so fs.statSync reports the
// real mode while dpkg-deb reads fakeroot's. Shelling out to find, which is
// wrapped, is the only way to read the modes that will end up in the archive.
function listTree(workDir) {
  const out = sh('find', [workDir, '-mindepth', '0', '-printf', '%m %y %p\\n'])
  const entries = []
  for (const line of out.split('\n')) {
    if (!line) continue
    // "0644 f /path/with spaces": only the first two fields are fixed width.
    const match = /^(\d+) (.) (.*)$/.exec(line)
    if (!match) throw new Error(`unparsable find output: ${line}`)
    entries.push({ mode: parseInt(match[1], 8), type: match[2], path: match[3] })
  }
  return entries
}

// electron-builder stages files with the builder's umask, so group-writable
// bits, executable shared libraries and read-only JRE files leak into the
// archive. Rewrite the tree to the modes Debian expects, keeping setuid,
// setgid and sticky bits untouched.
function normalizePermissions(workDir) {
  const debianDir = path.join(workDir, 'DEBIAN')
  let changed = 0

  for (const entry of listTree(workDir)) {
    if (entry.type === 'l') continue

    const name = path.basename(entry.path)
    const inControlArchive = entry.path === debianDir || entry.path.startsWith(`${debianDir}${path.sep}`)

    let target
    if (entry.type === 'd') {
      target = 0o755
    } else if (entry.type !== 'f') {
      continue
    } else if (inControlArchive) {
      // Maintainer scripts must stay executable, the rest of DEBIAN must not.
      target = MAINTAINER_SCRIPTS.includes(name) ? 0o755 : 0o644
    } else if (SHARED_LIB_RE.test(name)) {
      // Shared objects are dlopened, never executed: 0644 silences
      // shared-library-is-executable without affecting loading.
      target = 0o644
    } else {
      target = (entry.mode & 0o111) !== 0 ? 0o755 : 0o644
    }

    const next = (entry.mode & 0o7000) | target
    if ((entry.mode & 0o7777) === next) continue
    // Always chmod rather than trusting a previous read: chmod is wrapped by
    // fakeroot, so this is what actually updates the recorded mode.
    fs.chmodSync(entry.path, next)
    changed++
  }

  log(`permissions: normalised ${changed} path${changed === 1 ? '' : 's'} (dirs 0755, files 0644/0755, *.so 0644)`)
  return changed
}

function installFile(workDir, relPath, content, mode = 0o644) {
  const target = path.join(workDir, relPath)
  fs.mkdirSync(path.dirname(target), { recursive: true, mode: 0o755 })
  fs.writeFileSync(target, content)
  fs.chmodSync(target, mode)
  // mkdirSync honours umask, so force 0755 on every directory we created.
  let dir = path.dirname(target)
  while (dir.length > workDir.length) {
    fs.chmodSync(dir, 0o755)
    dir = path.dirname(dir)
  }
}

// --- main ------------------------------------------------------------------

function finalize(debPath) {
  if (!fs.existsSync(debPath)) throw new Error(`no such .deb: ${debPath}`)
  for (const tool of ['dpkg-deb', 'md5sum', 'find']) {
    if (!hasCommand(tool)) throw new Error(`required tool not found in PATH: ${tool}`)
  }

  const pkg = meta.readJson(meta.paths.packageJson)
  const maintainer = `${pkg.author.name} <${pkg.author.email}>`
  const history = meta.readHistory()
  if (!history.releases.some((r) => r.version === pkg.version)) {
    throw new Error(
      `release-history.json has no entry for ${pkg.version}; run "npm run version:bump" first`
    )
  }

  const workDir = fs.mkdtempSync(path.join(os.tmpdir(), 'deb-finalize-'))
  try {
    log(`unpacking ${debPath}`)
    sh('dpkg-deb', ['-R', debPath, workDir], { stdio: ['ignore', 'ignore', 'inherit'] })

    // 1. documentation: real changelog + DEP-5 copyright, FPM leftovers out.
    // A native package (no Debian revision in the version) must ship
    // changelog.gz; changelog.Debian.gz is only correct for non-native ones.
    const changelogName = changelogFileName(pkg.version)
    for (const stale of ['changelog.gz', 'changelog.Debian.gz', 'LICENSE']) {
      const target = path.join(workDir, DOC_REL, stale)
      if (fs.existsSync(target)) {
        fs.unlinkSync(target)
        log(`removed stale ${DOC_REL}/${stale}`)
      }
    }

    const changelogText = meta.renderDebianChangelog(history, PKG_NAME, maintainer)
    verifyChangelog(changelogText, pkg.version)
    installFile(workDir, `${DOC_REL}/${changelogName}`, gzipDeterministic(changelogText))
    installFile(workDir, `${DOC_REL}/copyright`, buildCopyright(pkg))
    log(`docs: ${changelogName} (${history.releases.length} releases) + copyright`)

    // 2. icon reachable by name from any .desktop file.
    const iconSrc = path.join(meta.paths.desktopDir, 'resources', 'icon.png')
    if (fs.existsSync(iconSrc)) {
      installFile(workDir, `usr/share/pixmaps/${PKG_NAME}.png`, fs.readFileSync(iconSrc))
      log(`pixmaps: ${PKG_NAME}.png`)
    } else {
      log(`pixmaps: skipped, ${iconSrc} not found`)
    }

    // 3. autostart slot, shipped disabled.
    installFile(workDir, `etc/xdg/autostart/${PKG_NAME}.desktop`, buildAutostartEntry(pkg))
    log(`autostart: etc/xdg/autostart/${PKG_NAME}.desktop (Hidden=true)`)

    // 4. normalise permissions across the whole payload, then rewrite the
    //    control metadata, conffiles and md5sums over the final tree.
    normalizePermissions(workDir)
    fixControl(path.join(workDir, 'DEBIAN', 'control'), pkg.version)
    writeConffiles(workDir)
    regenerateMd5sums(workDir)

    verifyMd5sums(workDir)

    log('repacking')
    sh('dpkg-deb', ['--build', workDir, debPath], { stdio: ['ignore', 'ignore', 'inherit'] })

    runLintian(debPath)
    log(`done: ${debPath}`)
  } finally {
    fs.rmSync(workDir, { recursive: true, force: true })
  }
}

function verifyChangelog(text, expectedVersion) {
  if (!hasCommand('dpkg-parsechangelog')) {
    log('dpkg-parsechangelog not available, skipping changelog validation')
    return
  }
  const tmp = path.join(os.tmpdir(), `changelog-${process.pid}`)
  fs.writeFileSync(tmp, text)
  try {
    const out = sh('dpkg-parsechangelog', ['-l', tmp])
    const version = /^Version:\s*(.+)$/m.exec(out)
    if (!version || version[1].trim() !== expectedVersion) {
      throw new Error(`changelog top entry is ${version ? version[1] : 'missing'}, expected ${expectedVersion}`)
    }
    log(`changelog: validated by dpkg-parsechangelog (${expectedVersion})`)
  } finally {
    fs.unlinkSync(tmp)
  }
}

function verifyMd5sums(workDir) {
  const result = spawnSync('md5sum', ['-c', '--quiet', path.join(workDir, 'DEBIAN', 'md5sums')], {
    cwd: workDir,
    encoding: 'utf8'
  })
  if (result.status !== 0) {
    throw new Error(`md5sums verification failed:\n${result.stdout}${result.stderr}`)
  }
  log('md5sums: verified with md5sum -c')
}

function runLintian(debPath) {
  if (!hasCommand('lintian')) {
    log('lintian not available, skipping static check')
    return
  }
  const result = spawnSync('lintian', ['--no-tag-display-limit', '--suppress-tags-from-file', '/dev/null', debPath], {
    encoding: 'utf8'
  })
  const output = `${result.stdout || ''}${result.stderr || ''}`.trim()
  // Advisory only: lintian flags plenty of things that are inherent to an
  // Electron bundle and must never break a release build.
  log(output ? `lintian report:\n${output}` : 'lintian: clean')
}

if (require.main === module) {
  const target = process.argv[2]
  try {
    if (!target) throw new Error('usage: fakeroot node scripts/deb-finalize.js <package.deb>')
    finalize(target)
  } catch (error) {
    console.error(`[deb-finalize] ${error.message}`)
    process.exit(1)
  }
}

module.exports = {
  finalize,
  parseControl,
  renderControl,
  normalizeDescription,
  normalizePermissions,
  changelogFileName,
  SECTION,
  buildCopyright,
  buildAutostartEntry,
  detectLicense,
  gzipDeterministic,
  PKG_NAME
}
