// Unit + end-to-end coverage for the automated release pipeline.
//
//   node --test test/release-packaging.test.mjs
//
// The .deb end-to-end test builds a synthetic FPM-shaped package, runs the real
// deb-finalize.js against it under fakeroot and inspects the result with
// dpkg-deb. It is skipped when dpkg-deb/fakeroot are unavailable.

import { test } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import zlib from 'node:zlib'
import { spawnSync, execFileSync } from 'node:child_process'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'

const require = createRequire(import.meta.url)
const meta = require('../scripts/lib/release-meta.js')
const bump = require('../scripts/version-bump.js')
const debFinalize = require('../scripts/deb-finalize.js')

const desktopDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

function has(cmd) {
  return spawnSync('sh', ['-c', `command -v ${cmd}`], { stdio: 'ignore' }).status === 0
}

// ---------------------------------------------------------------------------
// version arithmetic
// ---------------------------------------------------------------------------

test('bumpVersion advances the requested component', () => {
  assert.equal(meta.bumpVersion('0.1.2', 'patch'), '0.1.3')
  assert.equal(meta.bumpVersion('0.1.9', 'patch'), '0.1.10')
  assert.equal(meta.bumpVersion('0.1.2', 'minor'), '0.2.0')
  assert.equal(meta.bumpVersion('0.1.2', 'major'), '1.0.0')
})

test('parseVersion rejects non plain semver', () => {
  assert.throws(() => meta.parseVersion('1.2'), /not a plain/)
  assert.throws(() => meta.parseVersion('1.2.3-beta'), /not a plain/)
})

// ---------------------------------------------------------------------------
// derived references
// ---------------------------------------------------------------------------

test('updateBuildGradle only rewrites the top-level version assignment', () => {
  const gradle = [
    "plugins {",
    "    id 'org.springframework.boot' version '3.4.0'",
    '}',
    '',
    "group = 'com.associago'",
    "version = '0.1.2'",
    '',
    'dependencies {',
    "    implementation 'org.example:lib:0.1.2'",
    '}',
    ''
  ].join('\n')

  const out = bump.updateBuildGradle(gradle, '0.1.3')
  assert.match(out, /^version = '0\.1\.3'$/m)
  assert.match(out, /id 'org\.springframework\.boot' version '3\.4\.0'/)
  assert.match(out, /org\.example:lib:0\.1\.2/)
})

test('updateBuildGradle fails loudly when the assignment is missing', () => {
  assert.throws(() => bump.updateBuildGradle("group = 'x'\n", '1.0.0'), /not found/)
})

test('updatePackageJson pins the artifactName macro', () => {
  const source = JSON.stringify(
    { name: 'x', version: '0.1.2', build: { artifactName: 'associago_v0.1.2.${ext}' } },
    null,
    2
  )
  const parsed = JSON.parse(bump.updatePackageJson(source, '0.1.3'))
  assert.equal(parsed.version, '0.1.3')
  assert.equal(parsed.build.artifactName, 'associago_v${version}.${ext}')
})

test('updatePackageLock rewrites both version fields', () => {
  const source = JSON.stringify({ version: '0.1.2', packages: { '': { version: '0.1.2' } } }, null, 2)
  const parsed = JSON.parse(bump.updatePackageLock(source, '0.1.3'))
  assert.equal(parsed.version, '0.1.3')
  assert.equal(parsed.packages[''].version, '0.1.3')
})

// ---------------------------------------------------------------------------
// changelog
// ---------------------------------------------------------------------------

test('parseEntries flattens Keep a Changelog sections', () => {
  const body = [
    '',
    '### Added',
    '- Prima voce.',
    '- Seconda voce',
    '  che continua su due righe.',
    '',
    '### Fixed',
    '- Terza voce.',
    ''
  ].join('\n')

  assert.deepEqual(meta.parseEntries(body), [
    'Added: Prima voce.',
    'Added: Seconda voce che continua su due righe.',
    'Fixed: Terza voce.'
  ])
})

test('parseEntries keeps bare bullets uncategorised and ignores empty bodies', () => {
  assert.deepEqual(meta.parseEntries('- Solo una voce.\n'), ['Solo una voce.'])
  assert.deepEqual(meta.parseEntries('\n\n   \n'), [])
  assert.deepEqual(meta.parseEntries('### Added\n\n'), [])
})

test('consolidateChangelog moves Unreleased into a dated section', () => {
  const source = [
    '# Changelog',
    '',
    '## [Unreleased]',
    '',
    '### Added',
    '- Nuova feature.',
    '',
    '## [0.1.2] - 2026-08-01',
    '',
    '- Vecchia voce.',
    ''
  ].join('\n')

  const out = meta.consolidateChangelog(source, '0.1.3', '2026-08-25', ['Added: Nuova feature.'])

  assert.match(out, /## \[0\.1\.3\] - 2026-08-25/)
  assert.match(out, /- Added: Nuova feature\./)
  assert.match(out, /## \[0\.1\.2\] - 2026-08-01/)

  // Unreleased survives and is now empty.
  const unreleased = meta.extractUnreleasedBody(out)
  assert.equal(unreleased.found, true)
  assert.equal(meta.parseEntries(unreleased.body).length, 0)

  // Newest first.
  assert.ok(out.indexOf('## [0.1.3]') < out.indexOf('## [0.1.2]'))
})

test('rfc2822 renders a date dpkg understands', () => {
  const rendered = meta.rfc2822(new Date(2026, 7, 25, 18, 55, 0))
  assert.match(rendered, /^Tue, 25 Aug 2026 18:55:00 [+-]\d{4}$/)
})

test('wrapEntry folds long text into indented continuation lines', () => {
  const wrapped = meta.wrapEntry('parola '.repeat(30).trim())
  const lines = wrapped.split('\n')
  assert.ok(lines[0].startsWith('  * '))
  assert.ok(lines.length > 1)
  for (const line of lines.slice(1)) assert.ok(line.startsWith('    '))
  for (const line of lines) assert.ok(line.length <= 78, `line too long: ${line.length}`)
})

test('renderDebianChangelog output parses with dpkg-parsechangelog', { skip: !has('dpkg-parsechangelog') }, () => {
  const history = {
    releases: [
      {
        version: '0.1.3',
        date: 'Tue, 25 Aug 2026 18:55:00 +0200',
        distribution: 'unstable',
        urgency: 'medium',
        entries: ['Added: Nuova feature.', 'Fixed: Bug corretto.']
      },
      {
        version: '0.1.2',
        date: 'Sat, 01 Aug 2026 22:22:31 +0200',
        distribution: 'unstable',
        urgency: 'medium',
        entries: ['Password recovery flow.']
      }
    ]
  }

  const text = meta.renderDebianChangelog(history, 'associago-desktop', 'Lorenzo DM <x@example.com>')
  const file = path.join(os.tmpdir(), `cl-test-${process.pid}`)
  fs.writeFileSync(file, text)
  try {
    const out = execFileSync('dpkg-parsechangelog', ['-l', file], { encoding: 'utf8' })
    assert.match(out, /^Source: associago-desktop$/m)
    assert.match(out, /^Version: 0\.1\.3$/m)
    assert.match(out, /^Urgency: medium$/m)

    // The whole file must parse, not only the top entry.
    const previous = execFileSync('dpkg-parsechangelog', ['-l', file, '--offset', '1', '--count', '1'], {
      encoding: 'utf8'
    })
    assert.match(previous, /^Version: 0\.1\.2$/m)
    assert.match(previous, /Password recovery flow\./)
  } finally {
    fs.unlinkSync(file)
  }
})

test('an empty Unreleased section still yields a valid changelog entry', () => {
  assert.equal(meta.parseEntries('').length, 0)
  const text = meta.renderDebianChangelog(
    { releases: [{ version: '1.0.0', date: meta.rfc2822(), entries: [] }] },
    'associago-desktop',
    'Lorenzo DM <x@example.com>'
  )
  assert.match(text, /\* Maintenance release\./)
})

// ---------------------------------------------------------------------------
// control file
// ---------------------------------------------------------------------------

test('parseControl keeps continuation lines with their field', () => {
  const fields = debFinalize.parseControl(
    ['Package: associago-desktop', 'Description: Synopsis', ' Extended line one.', ' Extended line two.', ''].join('\n')
  )
  assert.equal(fields.get('Package'), 'associago-desktop')
  assert.equal(fields.get('Description'), 'Synopsis\n Extended line one.\n Extended line two.')
})

test('renderControl orders fields canonically and keeps Description last', () => {
  const fields = new Map([
    ['Description', 'Synopsis'],
    ['Version', '0.1.3'],
    ['Package', 'associago-desktop'],
    ['Section', 'office'],
    ['X-Custom', 'value']
  ])
  const lines = debFinalize.renderControl(fields).trim().split('\n')
  assert.equal(lines[0], 'Package: associago-desktop')
  assert.equal(lines[1], 'Version: 0.1.3')
  assert.equal(lines[2], 'Section: office')
  assert.equal(lines[lines.length - 1], 'Description: Synopsis')
  assert.ok(lines.includes('X-Custom: value'))
})

test('normalizeDescription indents the extended description by exactly one space', () => {
  const out = debFinalize.normalizeDescription('Synopsis\n  Indented too much.\n\n  Second paragraph.')
  assert.equal(out, 'Synopsis\n Indented too much.\n .\n Second paragraph.')
})

test('normalizeDescription keeps every line within 80 columns without losing text', () => {
  const longSynopsis =
    'Management software for associations, non-profit organizations, third-sector enterprises and clubs'
  const longBody = 'AssociaGo is a comprehensive management software designed for associations, non-profit organizations, and clubs.'
  const out = debFinalize.normalizeDescription(`${longSynopsis}\n ${longBody}`)
  const lines = out.split('\n')

  assert.ok(lines[0].length <= 80, `synopsis too long: ${lines[0].length}`)
  for (const line of lines) assert.ok(line.length <= 80, `line too long (${line.length}): ${line}`)

  // The truncated synopsis text is preserved in the extended description.
  const body = lines.slice(1).join(' ').replace(/\s+/g, ' ')
  assert.ok(body.includes('third-sector enterprises and clubs'), body)
  assert.ok(body.includes('comprehensive management software'), body)
})

test('changelogFileName follows the native/non-native rule', () => {
  assert.equal(debFinalize.changelogFileName('0.1.3'), 'changelog.gz')
  assert.equal(debFinalize.changelogFileName('0.1.3-1'), 'changelog.Debian.gz')
})

test('SECTION is a valid Debian archive section', () => {
  const sectionsFile = '/usr/share/lintian/data/fields/archive-sections'
  if (!fs.existsSync(sectionsFile)) return
  const sections = fs.readFileSync(sectionsFile, 'utf8').split('\n').map((s) => s.trim())
  assert.ok(sections.includes(debFinalize.SECTION), `${debFinalize.SECTION} is not a Debian section`)
})

test('normalizePermissions fixes modes and preserves setuid', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'perm-'))
  try {
    fs.mkdirSync(path.join(root, 'DEBIAN'))
    fs.writeFileSync(path.join(root, 'DEBIAN', 'postinst'), '#!/bin/sh\n', { mode: 0o664 })
    fs.writeFileSync(path.join(root, 'DEBIAN', 'control'), 'Package: x\n', { mode: 0o664 })

    const opt = path.join(root, 'opt', 'App')
    fs.mkdirSync(opt, { recursive: true })
    fs.chmodSync(path.join(root, 'opt', 'App'), 0o775)
    fs.writeFileSync(path.join(opt, 'binary'), 'x', { mode: 0o775 })
    fs.writeFileSync(path.join(opt, 'libEGL.so'), 'x', { mode: 0o775 })
    fs.writeFileSync(path.join(opt, 'libvulkan.so.1'), 'x', { mode: 0o664 })
    fs.writeFileSync(path.join(opt, 'data.pak'), 'x', { mode: 0o664 })
    fs.writeFileSync(path.join(opt, 'sandbox'), 'x', { mode: 0o755 })
    fs.chmodSync(path.join(opt, 'sandbox'), 0o4755)

    debFinalize.normalizePermissions(root)

    const mode = (p) => fs.statSync(path.join(root, p)).mode & 0o7777
    assert.equal(mode('opt/App'), 0o755)
    assert.equal(mode('opt/App/binary'), 0o755)
    assert.equal(mode('opt/App/libEGL.so'), 0o644)
    assert.equal(mode('opt/App/libvulkan.so.1'), 0o644)
    assert.equal(mode('opt/App/data.pak'), 0o644)
    assert.equal(mode('opt/App/sandbox'), 0o4755, 'setuid bit must survive')
    assert.equal(mode('DEBIAN/postinst'), 0o755)
    assert.equal(mode('DEBIAN/control'), 0o644)
  } finally {
    fs.rmSync(root, { recursive: true, force: true })
  }
})

// ---------------------------------------------------------------------------
// generated payload
// ---------------------------------------------------------------------------

test('detectLicense recognises the project AGPL-3 licence', () => {
  const license = fs.readFileSync(meta.paths.license, 'utf8')
  const detected = debFinalize.detectLicense(license)
  assert.ok(detected, 'AGPL-3 not detected in LICENSE')
  assert.equal(detected.id, 'AGPL-3+')
  assert.equal(detected.commonFile, 'AGPL-3')
})

test('buildCopyright emits a DEP-5 stanza', () => {
  const pkg = meta.readJson(meta.paths.packageJson)
  const copyright = debFinalize.buildCopyright(pkg)
  assert.match(copyright, /^Format: https:\/\/www\.debian\.org\/doc\/packaging-manuals\/copyright-format\/1\.0\/$/m)
  assert.match(copyright, /^Upstream-Name: associago-desktop$/m)
  assert.match(copyright, /^Files: \*$/m)
  assert.match(copyright, /^Copyright: \d{4} /m)
  assert.match(copyright, /^License: AGPL-3\+$/m)
  assert.match(copyright, /\/usr\/share\/common-licenses\/AGPL-3/)
  // No unindented text outside field lines.
  for (const line of copyright.split('\n')) {
    if (line === '' || line.startsWith(' ')) continue
    assert.match(line, /^[A-Za-z0-9][A-Za-z0-9-]*: /, `stray line: ${line}`)
  }
})

test('autostart entry ships disabled', () => {
  const pkg = meta.readJson(meta.paths.packageJson)
  const entry = debFinalize.buildAutostartEntry(pkg)
  assert.match(entry, /^\[Desktop Entry\]$/m)
  assert.match(entry, /^Hidden=true$/m)
  assert.match(entry, /^X-GNOME-Autostart-enabled=false$/m)
  assert.match(entry, /^Type=Application$/m)
})

test('gzipDeterministic is byte-stable and decodes back', () => {
  const a = debFinalize.gzipDeterministic('hello\n')
  const b = debFinalize.gzipDeterministic('hello\n')
  assert.deepEqual(a, b)
  assert.equal(zlib.gunzipSync(a).toString('utf8'), 'hello\n')
})

// ---------------------------------------------------------------------------
// repository invariants
// ---------------------------------------------------------------------------

test('repository version references agree', () => {
  const result = spawnSync(process.execPath, ['scripts/verify-packaging-assets.js'], {
    cwd: desktopDir,
    encoding: 'utf8',
    env: { ...process.env }
  })
  // Missing out/ bundles are a build-state problem, not a version problem.
  const output = `${result.stdout}${result.stderr}`
  assert.ok(
    !output.includes('Version references are inconsistent'),
    `verify-packaging-assets reported drift:\n${output}`
  )
})

test('version-bump --dry-run writes nothing', () => {
  const before = ['packageJson', 'packageLock', 'buildGradle', 'changelogMd', 'releaseHistory'].map((key) =>
    fs.readFileSync(meta.paths[key], 'utf8')
  )
  const pendingBefore = fs.existsSync(meta.paths.pendingRelease)

  const result = spawnSync(process.execPath, ['scripts/version-bump.js', '--dry-run'], {
    cwd: desktopDir,
    encoding: 'utf8',
    env: { ...process.env, CI: '', ASSOCIAGO_NO_BUMP: '' }
  })
  assert.equal(result.status, 0, result.stderr)
  assert.match(result.stdout, /no file written/)

  const after = ['packageJson', 'packageLock', 'buildGradle', 'changelogMd', 'releaseHistory'].map((key) =>
    fs.readFileSync(meta.paths[key], 'utf8')
  )
  assert.deepEqual(after, before)
  assert.equal(fs.existsSync(meta.paths.pendingRelease), pendingBefore)
})

// ---------------------------------------------------------------------------
// .deb end to end
// ---------------------------------------------------------------------------

const debToolsAvailable = has('dpkg-deb') && has('fakeroot') && has('md5sum')

test('deb-finalize produces a policy-shaped package', { skip: !debToolsAvailable }, () => {
  const version = meta.readJson(meta.paths.packageJson).version
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'deb-e2e-'))
  const stage = path.join(root, 'stage')

  try {
    // Reproduce what electron-builder/FPM hands us: bogus control fields, an
    // FPM changelog stub and a raw LICENSE under usr/share/doc.
    fs.mkdirSync(path.join(stage, 'DEBIAN'), { recursive: true })
    fs.writeFileSync(
      path.join(stage, 'DEBIAN', 'control'),
      [
        'Package: associago-desktop',
        `Version: ${version}`,
        'License: unknown',
        'Vendor: Lorenzo DM <commercial.lorenzodm@gmail.com>',
        'Architecture: amd64',
        'Maintainer: Lorenzo DM <commercial.lorenzodm@gmail.com>',
        'Installed-Size: 10',
        'Depends: libgtk-3-0',
        'Section: default',
        'Priority: extra',
        'Homepage: https://github.com/lorenzodm/AssociaGo',
        'Description: Management software for associations',
        '   AssociaGo is a comprehensive management software.',
        ''
      ].join('\n')
    )

    const docDir = path.join(stage, 'usr', 'share', 'doc', 'associago-desktop')
    fs.mkdirSync(docDir, { recursive: true })
    fs.writeFileSync(path.join(docDir, 'changelog.gz'), zlib.gzipSync('stub (0.0.0) whatever; urgency=low\n'))
    fs.writeFileSync(path.join(docDir, 'LICENSE'), 'raw license text\n')

    const optDir = path.join(stage, 'opt', 'AssociaGo')
    fs.mkdirSync(optDir, { recursive: true })
    fs.writeFileSync(path.join(optDir, 'associago-desktop'), '#!/bin/sh\nexit 0\n', { mode: 0o755 })
    // Modes electron-builder actually leaks into the archive: group-writable
    // dirs and binaries, executable shared objects, read-only JRE payload.
    fs.chmodSync(optDir, 0o775)
    fs.writeFileSync(path.join(optDir, 'libEGL.so'), 'x', { mode: 0o775 })
    fs.writeFileSync(path.join(optDir, 'data.pak'), 'x', { mode: 0o664 })
    const legalDir = path.join(optDir, 'legal')
    fs.mkdirSync(legalDir)
    fs.writeFileSync(path.join(legalDir, 'LICENSE'), 'x')
    fs.chmodSync(path.join(legalDir, 'LICENSE'), 0o444)

    const debPath = path.join(root, `associago_v${version}.deb`)
    execFileSync('fakeroot', ['dpkg-deb', '--build', stage, debPath], { stdio: ['ignore', 'ignore', 'inherit'] })

    // Run the real hook payload, exactly as the build does.
    execFileSync('fakeroot', [process.execPath, path.join(desktopDir, 'scripts', 'deb-finalize.js'), debPath], {
      stdio: ['ignore', 'pipe', 'inherit'],
      cwd: desktopDir
    })

    // --- control ---
    const info = execFileSync('dpkg-deb', ['-f', debPath], { encoding: 'utf8' })
    assert.match(info, new RegExp(`^Section: ${debFinalize.SECTION}$`, 'm'))
    assert.match(info, /^Priority: optional$/m)
    assert.match(info, new RegExp(`^Version: ${version.replace(/\./g, '\\.')}$`, 'm'))
    assert.doesNotMatch(info, /^License:/m)
    assert.doesNotMatch(info, /^Vendor:/m)
    // Description must be the last field, one-space indented.
    const controlLines = info.trimEnd().split('\n')
    const descIndex = controlLines.findIndex((line) => line.startsWith('Description:'))
    assert.ok(descIndex >= 0)
    for (const line of controlLines.slice(descIndex + 1)) {
      assert.ok(line.startsWith(' ') && !line.startsWith('  '), `bad description line: "${line}"`)
    }

    // --- payload ---
    const contents = execFileSync('dpkg-deb', ['-c', debPath], { encoding: 'utf8' })
    assert.match(contents, /usr\/share\/doc\/associago-desktop\/changelog\.gz/)
    assert.match(contents, /usr\/share\/doc\/associago-desktop\/copyright/)
    assert.match(contents, /usr\/share\/pixmaps\/associago-desktop\.png/)
    assert.match(contents, /etc\/xdg\/autostart\/associago-desktop\.desktop/)
    // Native package: no changelog.Debian.gz, and no raw LICENSE next to it.
    assert.doesNotMatch(contents, /usr\/share\/doc\/associago-desktop\/changelog\.Debian\.gz/)
    assert.doesNotMatch(contents, /usr\/share\/doc\/associago-desktop\/LICENSE/)

    // Permissions were normalised. dpkg-deb -c reports the modes fakeroot
    // recorded, which is what actually lands on the installed system.
    for (const line of contents.trim().split('\n')) {
      const mode = line.slice(0, 10)
      if (mode.startsWith('l')) continue
      if (mode.startsWith('d')) {
        assert.equal(mode, 'drwxr-xr-x', `unexpected dir mode: ${line}`)
        continue
      }
      assert.ok(
        mode === '-rw-r--r--' || mode === '-rwxr-xr-x',
        `unexpected file mode "${mode}": ${line}`
      )
    }

    // Everything must be owned by root:root, otherwise fakeroot was bypassed.
    for (const line of contents.trim().split('\n')) {
      assert.match(line, /\sroot\/root\s/, `not root-owned: ${line}`)
    }

    // --- control archive ---
    const controlList = execFileSync('dpkg-deb', ['--ctrl-tarfile', debPath], { encoding: 'buffer' })
    const ctrlDir = path.join(root, 'ctrl')
    fs.mkdirSync(ctrlDir)
    fs.writeFileSync(path.join(root, 'ctrl.tar'), controlList)
    execFileSync('tar', ['-xf', path.join(root, 'ctrl.tar'), '-C', ctrlDir])

    const conffiles = fs.readFileSync(path.join(ctrlDir, 'conffiles'), 'utf8')
    assert.equal(conffiles.trim(), '/etc/xdg/autostart/associago-desktop.desktop')

    // --- changelog ---
    const extractDir = path.join(root, 'extract')
    execFileSync('dpkg-deb', ['-x', debPath, extractDir])
    const changelog = zlib
      .gunzipSync(fs.readFileSync(path.join(extractDir, 'usr/share/doc/associago-desktop/changelog.gz')))
      .toString('utf8')
    assert.match(changelog, new RegExp(`^associago-desktop \\(${version.replace(/\./g, '\\.')}\\) `, 'm'))
    assert.doesNotMatch(changelog, /Package created with FPM/)

    if (has('dpkg-parsechangelog')) {
      const clFile = path.join(root, 'changelog')
      fs.writeFileSync(clFile, changelog)
      const parsed = execFileSync('dpkg-parsechangelog', ['-l', clFile], { encoding: 'utf8' })
      assert.match(parsed, new RegExp(`^Version: ${version.replace(/\./g, '\\.')}$`, 'm'))
    }

    // --- md5sums cover the final payload and verify ---
    const md5sums = fs.readFileSync(path.join(ctrlDir, 'md5sums'), 'utf8').trim().split('\n')
    const listed = md5sums.map((line) => line.split(/\s+/)[1]).sort()
    assert.deepEqual(
      listed,
      [
        'etc/xdg/autostart/associago-desktop.desktop',
        'opt/AssociaGo/associago-desktop',
        'opt/AssociaGo/data.pak',
        'opt/AssociaGo/legal/LICENSE',
        'opt/AssociaGo/libEGL.so',
        'usr/share/doc/associago-desktop/changelog.gz',
        'usr/share/doc/associago-desktop/copyright',
        'usr/share/pixmaps/associago-desktop.png'
      ].sort()
    )
    const check = spawnSync('md5sum', ['-c', '--quiet', path.join(ctrlDir, 'md5sums')], {
      cwd: extractDir,
      encoding: 'utf8'
    })
    assert.equal(check.status, 0, `${check.stdout}${check.stderr}`)

    // --- rerunning must be idempotent ---
    const firstChangelog = changelog
    execFileSync('fakeroot', [process.execPath, path.join(desktopDir, 'scripts', 'deb-finalize.js'), debPath], {
      stdio: ['ignore', 'pipe', 'inherit'],
      cwd: desktopDir
    })
    const secondExtract = path.join(root, 'extract2')
    execFileSync('dpkg-deb', ['-x', debPath, secondExtract])
    const secondChangelog = zlib
      .gunzipSync(fs.readFileSync(path.join(secondExtract, 'usr/share/doc/associago-desktop/changelog.gz')))
      .toString('utf8')
    assert.equal(secondChangelog, firstChangelog)
  } finally {
    fs.rmSync(root, { recursive: true, force: true })
  }
})

test('deb-finalize refuses a version missing from release-history.json', { skip: !debToolsAvailable }, () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'deb-guard-'))
  try {
    const stage = path.join(root, 'stage')
    fs.mkdirSync(path.join(stage, 'DEBIAN'), { recursive: true })
    fs.writeFileSync(
      path.join(stage, 'DEBIAN', 'control'),
      ['Package: associago-desktop', 'Version: 9.9.9', 'Architecture: amd64', 'Maintainer: x <x@example.com>', 'Description: x', ''].join('\n')
    )
    fs.mkdirSync(path.join(stage, 'opt'), { recursive: true })
    fs.writeFileSync(path.join(stage, 'opt', 'file'), 'x\n')

    const debPath = path.join(root, 'bad.deb')
    execFileSync('fakeroot', ['dpkg-deb', '--build', stage, debPath], { stdio: ['ignore', 'ignore', 'inherit'] })

    const original = fs.readFileSync(meta.paths.releaseHistory, 'utf8')
    fs.writeFileSync(meta.paths.releaseHistory, JSON.stringify({ releases: [] }, null, 2))
    try {
      const result = spawnSync(process.execPath, [path.join(desktopDir, 'scripts', 'deb-finalize.js'), debPath], {
        encoding: 'utf8',
        cwd: desktopDir
      })
      assert.equal(result.status, 1)
      assert.match(result.stderr, /release-history\.json has no entry/)
    } finally {
      fs.writeFileSync(meta.paths.releaseHistory, original)
    }
  } finally {
    fs.rmSync(root, { recursive: true, force: true })
  }
})
