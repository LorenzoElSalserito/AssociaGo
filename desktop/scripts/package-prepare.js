// Cross-platform replacement for the previous shell pipeline:
//   cd .. && ./gradlew bootJar && cd desktop && npm run build:jre && npm run build
// Pure-shell chains break on Windows because npm runs scripts via cmd.exe,
// where "./gradlew" and "&&" cd-hopping don't behave like in bash.
const path = require('path');
const { spawnSync } = require('child_process');
const fs = require('fs');

const isWin = process.platform === 'win32';
const repoRoot = path.resolve(__dirname, '..', '..');
const desktopDir = path.resolve(__dirname, '..');

function run(label, cmd, args, cwd) {
    console.log(`\n[package-prepare] ${label}`);
    console.log(`  cwd: ${cwd}`);
    console.log(`  cmd: ${cmd} ${args.join(' ')}`);
    const result = spawnSync(cmd, args, { stdio: 'inherit', cwd, shell: isWin });
    if (result.error) {
        console.error(`[package-prepare] ${label} failed to start:`, result.error);
        process.exit(1);
    }
    if (result.status !== 0) {
        console.error(`[package-prepare] ${label} exited with code ${result.status}`);
        process.exit(result.status || 1);
    }
}

function copyIcons() {
    console.log(`\n[package-prepare] Copying icons to build directory`);
    const buildDir = path.join(desktopDir, 'build');
    const resourcesDir = path.join(desktopDir, 'resources');

    if (!fs.existsSync(buildDir)) {
        fs.mkdirSync(buildDir, { recursive: true });
    }

    // background.png è il background del DMG macOS. Va piazzato esplicitamente in
    // build/ così dmg-builder non cade sul TIFF default vendored: su macos-latest
    // di GitHub Actions (Apple Silicon, Python 3 di sistema) la chiamata
    // mac_alias.osx.statfs sul background di default fallisce con FileNotFoundError
    // a `.background/background.tiff` durante la creazione dell'alias.
    const buildAssets = ['icon.ico', 'icon.png', 'icon.icns', 'background.png'];
    for (const asset of buildAssets) {
        const src = path.join(resourcesDir, asset);
        const dest = path.join(buildDir, asset);
        if (fs.existsSync(src)) {
            fs.copyFileSync(src, dest);
            console.log(`  Copied ${asset}`);
        } else {
            console.log(`  Warning: ${src} not found`);
        }
    }
}

// build/libs accumulates one JAR per past release and extraResources copies
// them all into resources/backend. The main process picks the first *.jar it
// finds there, so a stale JAR can shadow the current backend. Keep only the
// JAR matching the version being packaged.
function pruneStaleBackendJars() {
    const version = JSON.parse(fs.readFileSync(path.join(desktopDir, 'package.json'), 'utf8')).version;
    const libsDir = path.join(repoRoot, 'build', 'libs');
    if (!fs.existsSync(libsDir)) {
        console.error(`[package-prepare] ${libsDir} not found after bootJar`);
        process.exit(1);
    }

    const jars = fs.readdirSync(libsDir).filter((name) => name.endsWith('.jar'));
    const current = jars.filter((name) => name.includes(`-${version}.jar`) || name.includes(`-${version}-plain.jar`));
    if (current.length === 0) {
        console.error(`[package-prepare] No backend JAR for version ${version} in ${libsDir}`);
        console.error(`[package-prepare] Found: ${jars.join(', ') || '(none)'}`);
        console.error('[package-prepare] build.gradle version is out of sync with package.json');
        process.exit(1);
    }

    console.log(`\n[package-prepare] Pruning stale backend JARs (keeping version ${version})`);
    for (const name of jars) {
        if (current.includes(name)) continue;
        fs.rmSync(path.join(libsDir, name));
        console.log(`  Removed stale ${name}`);
    }
}

const gradleCmd = isWin ? 'gradlew.bat' : './gradlew';
const npmCmd = isWin ? 'npm.cmd' : 'npm';

run('Building backend JAR (gradle bootJar)', gradleCmd, ['bootJar'], repoRoot);
pruneStaleBackendJars();
run('Building bundled JRE (build:jre)', npmCmd, ['run', 'build:jre'], desktopDir);
run('Building renderer/main bundle (build)', npmCmd, ['run', 'build'], desktopDir);

copyIcons();
run('Verifying packaging assets', npmCmd, ['run', 'verify:packaging'], desktopDir);

console.log('\n[package-prepare] All steps completed successfully.');
