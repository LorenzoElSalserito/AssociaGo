const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const os = require('os');
const axios = require('axios');

// Configurazione
const JAVA_VERSION = '21';
const JRE_OUTPUT_DIR = path.join(__dirname, '../resources/jre');

// Mappa architettura Node -> Adoptium API
const ARCH_MAP = {
    'x64': 'x64',
    'arm64': 'aarch64'
};

// Mappa piattaforma Node -> Adoptium API
const PLATFORM_MAP = {
    'win32': 'windows',
    'linux': 'linux',
    'darwin': 'mac'
};

// Usa variabili d'ambiente se presenti (per la cross-compilazione), altrimenti usa le info del sistema operativo
const platform = process.env.TARGET_PLATFORM || PLATFORM_MAP[os.platform()];
const arch = process.env.TARGET_ARCH || ARCH_MAP[os.arch()];

if (!platform || !arch) {
    console.error(`Piattaforma non supportata: platform=${platform} arch=${arch}`);
    process.exit(1);
}

async function downloadFile(url, dest) {
    const writer = fs.createWriteStream(dest);

    try {
        const response = await axios({
            url,
            method: 'GET',
            responseType: 'stream',
            maxRedirects: 5
        });

        response.data.pipe(writer);

        return new Promise((resolve, reject) => {
            writer.on('finish', resolve);
            writer.on('error', reject);
        });
    } catch (error) {
        writer.close();
        if (fs.existsSync(dest)) fs.unlinkSync(dest);
        throw new Error(`Errore download: ${error.message}`);
    }
}

function findJavaBin(startDir) {
    const binName = platform === 'windows' ? 'java.exe' : 'java';

    // Check current dir
    if (fs.existsSync(path.join(startDir, 'bin', binName))) {
        return path.join(startDir, 'bin', binName);
    }

    // Check subdirectories (depth 1-3)
    const queue = [startDir];
    let depth = 0;

    while (queue.length > 0 && depth < 4) {
        const current = queue.shift();
        try {
            const items = fs.readdirSync(current);
            for (const item of items) {
                const fullPath = path.join(current, item);
                if (fs.statSync(fullPath).isDirectory()) {
                    // Check if this is the Home directory (macOS style) or just a root folder
                    if (fs.existsSync(path.join(fullPath, 'bin', binName))) {
                        return path.join(fullPath, 'bin', binName);
                    }
                    queue.push(fullPath);
                }
            }
        } catch (e) {}
        depth++;
    }
    return null;
}

function normalizeJreStructure(rootDir) {
    // Find where 'bin/java' actually is
    const javaBinPath = findJavaBin(rootDir);

    if (!javaBinPath) {
        throw new Error('Binario Java non trovato nella struttura estratta.');
    }

    // The "real" root is the parent of 'bin'
    const realRoot = path.dirname(path.dirname(javaBinPath));

    if (path.normalize(realRoot) === path.normalize(rootDir)) {
        console.log('[JRE] Struttura già corretta.');
        return;
    }

    console.log(`[JRE] Normalizzazione struttura da: ${realRoot}`);

    // Move contents of realRoot to a temp dir, then to rootDir
    const tempDir = path.join(rootDir, '_temp_move');
    fs.renameSync(realRoot, tempDir);

    // Clean rootDir (except tempDir)
    const items = fs.readdirSync(rootDir);
    for (const item of items) {
        if (item !== '_temp_move') {
            fs.rmSync(path.join(rootDir, item), { recursive: true, force: true });
        }
    }

    // Move everything back from tempDir to rootDir
    const tempItems = fs.readdirSync(tempDir);
    for (const item of tempItems) {
        fs.renameSync(path.join(tempDir, item), path.join(rootDir, item));
    }

    fs.rmdirSync(tempDir);
}

async function main() {
    console.log(`[JRE] Preparazione JRE per ${platform}-${arch}...`);

    const skipDownload = process.env.SKIP_JRE_DOWNLOAD === '1' || process.env.ASSOCIAGO_SKIP_JRE_DOWNLOAD === '1';
    const existingJava = findJavaBin(JRE_OUTPUT_DIR);

    if (skipDownload) {
        console.log('[JRE] Download saltato da variabile d\'ambiente.');
        if (existingJava) {
            console.log(`[JRE] Riutilizzo runtime esistente: ${existingJava}`);
        } else {
            console.log('[JRE] Nessun runtime locale presente. La build del renderer puo continuare, il packaging completo richiedera un JRE disponibile.');
        }
        return;
    }

    if (existingJava) {
        console.log(`[JRE] Runtime esistente rilevato: ${existingJava}`);
        console.log('[JRE] Nessun download necessario.');
        return;
    }

    if (fs.existsSync(JRE_OUTPUT_DIR)) {
        console.log('[JRE] Cartella JRE esistente ma incompleta. Pulizia...');
        fs.rmSync(JRE_OUTPUT_DIR, { recursive: true, force: true });
    }
    fs.mkdirSync(JRE_OUTPUT_DIR, { recursive: true });

    const apiUrl = `https://api.adoptium.net/v3/binary/latest/${JAVA_VERSION}/ga/${platform}/${arch}/jre/hotspot/normal/eclipse`;

    console.log(`[JRE] Scaricamento da: ${apiUrl}`);
    const archiveName = `jre.${platform === 'windows' ? 'zip' : 'tar.gz'}`;
    const archivePath = path.join(__dirname, archiveName);

    try {
        await downloadFile(apiUrl, archivePath);
        console.log('[JRE] Download completato. Estrazione...');

        const stats = fs.statSync(archivePath);
        if (stats.size < 1000000) {
            throw new Error(`File scaricato troppo piccolo (${stats.size} bytes).`);
        }

        if (platform === 'windows') {
            try {
                // Primo tentativo: unzip di linux (se disponibile)
                execSync(`unzip -q "${archivePath}" -d "${JRE_OUTPUT_DIR}"`);
            } catch (e) {
                try {
                    // Secondo tentativo: tar (a volte disponibile su windows/alcuni ambienti)
                    execSync(`tar -xf "${archivePath}" -C "${JRE_OUTPUT_DIR}"`);
                } catch (e2) {
                    try {
                        // Terzo tentativo: powershell (solo se siamo fisicamente su Windows)
                        execSync(`powershell -command "Expand-Archive -Path '${archivePath}' -DestinationPath '${JRE_OUTPUT_DIR}'"`);
                    } catch (e3) {
                        console.log("[JRE] ERRORE: Nessun comando disponibile per estrarre il file .zip.");
                        console.log("[JRE] Se sei su Linux e compili per Windows, installa 'unzip' (es: sudo apt install unzip).");
                        throw e3;
                    }
                }
            }
        } else {
            execSync(`tar -xzf "${archivePath}" -C "${JRE_OUTPUT_DIR}"`);
        }

        console.log('[JRE] Estrazione completata. Verifica struttura...');

        // Normalize structure (handle macOS Contents/Home or nested folders)
        normalizeJreStructure(JRE_OUTPUT_DIR);

        if (fs.existsSync(archivePath)) fs.unlinkSync(archivePath);

        // Final check
        const javaBin = path.join(JRE_OUTPUT_DIR, platform === 'windows' ? 'bin/java.exe' : 'bin/java');
        if (fs.existsSync(javaBin)) {
            console.log(`[JRE] Successo! Java binary: ${javaBin}`);
            if (platform !== 'windows') execSync(`chmod +x "${javaBin}"`);
        } else {
            throw new Error('Binario java non trovato dopo normalizzazione.');
        }

    } catch (error) {
        console.error('[JRE] Errore:', error.message);
        if (fs.existsSync(archivePath)) fs.unlinkSync(archivePath);
        process.exit(1);
    }
}

main();
