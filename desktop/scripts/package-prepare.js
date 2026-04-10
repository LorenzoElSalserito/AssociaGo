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

    const icons = ['icon.ico', 'icon.png', 'icon.icns'];
    for (const icon of icons) {
        const src = path.join(resourcesDir, icon);
        const dest = path.join(buildDir, icon);
        if (fs.existsSync(src)) {
            fs.copyFileSync(src, dest);
            console.log(`  Copied ${icon}`);
        } else {
            console.log(`  Warning: Icon ${src} not found`);
        }
    }
}

const gradleCmd = isWin ? 'gradlew.bat' : './gradlew';
const npmCmd = isWin ? 'npm.cmd' : 'npm';

run('Building backend JAR (gradle bootJar)', gradleCmd, ['bootJar'], repoRoot);
run('Building bundled JRE (build:jre)', npmCmd, ['run', 'build:jre'], desktopDir);
run('Building renderer/main bundle (build)', npmCmd, ['run', 'build'], desktopDir);

copyIcons();
run('Verifying packaging assets', npmCmd, ['run', 'verify:packaging'], desktopDir);

console.log('\n[package-prepare] All steps completed successfully.');
