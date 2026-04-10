const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const outputDir = path.join(__dirname, '../resources/jre');

const modules = [
  'java.base',
  'java.desktop',
  'java.instrument',
  'java.logging',
  'java.management',
  'java.naming',
  'java.net.http',
  'java.prefs',
  'java.rmi',
  'java.scripting',
  'java.security.jgss',
  'java.sql',
  'java.xml',
  'jdk.crypto.ec',
  'jdk.localedata',
  'jdk.unsupported'
].join(',');

function resolveJlink() {
  const javaHome = process.env.JAVA_HOME;
  if (javaHome) {
    const candidate = path.join(javaHome, 'bin', process.platform === 'win32' ? 'jlink.exe' : 'jlink');
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }

  return process.platform === 'win32' ? 'jlink.exe' : 'jlink';
}

function main() {
  if (process.env.SKIP_JRE_BUILD === '1') {
    console.log('[JRE] Build locale saltata da variabile d\'ambiente.');
    return;
  }

  const jlink = resolveJlink();
  console.log(`[JRE] Generazione runtime locale con ${jlink}...`);

  fs.rmSync(outputDir, { recursive: true, force: true });

  const result = spawnSync(
    jlink,
    [
      '--add-modules',
      modules,
      '--compress=2',
      '--no-header-files',
      '--no-man-pages',
      '--strip-debug',
      '--output',
      outputDir
    ],
    {
      stdio: 'inherit'
    }
  );

  if (result.error || result.status !== 0) {
    const reason = result.error ? result.error.message : `exit code ${result.status}`;
    console.warn(`[JRE] jlink non disponibile o fallito (${reason}). Fallback al download remoto.`);
    const fallback = spawnSync(process.execPath, [path.join(__dirname, 'download-jre.js')], {
      stdio: 'inherit',
      env: process.env
    });

    if (fallback.error || fallback.status !== 0) {
      const fallbackReason = fallback.error ? fallback.error.message : `exit code ${fallback.status}`;
      throw new Error(`Impossibile preparare il runtime Java: ${fallbackReason}`);
    }
    return;
  }

  console.log(`[JRE] Runtime locale pronta in ${outputDir}`);
}

main();
