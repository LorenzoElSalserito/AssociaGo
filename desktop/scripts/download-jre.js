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

const platform = PLATFORM_MAP[os.platform()];
const arch = ARCH_MAP[os.arch()];

if (!platform || !arch) {
    console.error(`Piattaforma non supportata: ${os.platform()} ${os.arch()}`);
    process.exit(1);
}

async function downloadFile(url, dest) {
    const writer = fs.createWriteStream(dest);

    try {
        const response = await axios({
            url,
            method: 'GET',
            responseType: 'stream',
            maxRedirects: 5 // Axios segue i redirect automaticamente
        });

        response.data.pipe(writer);

        return new Promise((resolve, reject) => {
            writer.on('finish', resolve);
            writer.on('error', reject);
        });
    } catch (error) {
        writer.close();
        fs.unlinkSync(dest); // Pulisci file parziale
        throw new Error(`Errore download: ${error.message}`);
    }
}

async function main() {
    console.log(`[JRE] Preparazione JRE per ${platform}-${arch}...`);

    if (fs.existsSync(JRE_OUTPUT_DIR)) {
        console.log('[JRE] Cartella JRE esistente. Pulizia...');
        fs.rmSync(JRE_OUTPUT_DIR, { recursive: true, force: true });
    }
    fs.mkdirSync(JRE_OUTPUT_DIR, { recursive: true });

    // URL API Adoptium per scaricare JRE
    const apiUrl = `https://api.adoptium.net/v3/binary/latest/${JAVA_VERSION}/ga/${platform}/${arch}/jre/hotspot/normal/eclipse`;

    console.log(`[JRE] Scaricamento da: ${apiUrl}`);
    const archiveName = `jre.${platform === 'windows' ? 'zip' : 'tar.gz'}`;
    const archivePath = path.join(__dirname, archiveName);

    try {
        // 1. Ottieni URL diretto (opzionale, axios lo fa, ma per debug è utile)
        // In realtà axios segue i redirect, quindi usiamo direttamente apiUrl
        await downloadFile(apiUrl, archivePath);
        console.log('[JRE] Download completato. Estrazione...');

        // Verifica integrità minima (dimensione > 0)
        const stats = fs.statSync(archivePath);
        if (stats.size < 1000000) { // Meno di 1MB è sospetto per un JRE
            throw new Error(`File scaricato troppo piccolo (${stats.size} bytes). Probabile errore di download.`);
        }

        if (platform === 'windows') {
            try {
                execSync(`tar -xf "${archivePath}" -C "${JRE_OUTPUT_DIR}" --strip-components=1`);
            } catch (e) {
                // Fallback powershell
                execSync(`powershell -command "Expand-Archive -Path '${archivePath}' -DestinationPath '${JRE_OUTPUT_DIR}'"`);
                // Move content up if nested
                const items = fs.readdirSync(JRE_OUTPUT_DIR);
                if (items.length === 1 && fs.lstatSync(path.join(JRE_OUTPUT_DIR, items[0])).isDirectory()) {
                    const rootDir = path.join(JRE_OUTPUT_DIR, items[0]);
                    const files = fs.readdirSync(rootDir);
                    files.forEach(f => fs.renameSync(path.join(rootDir, f), path.join(JRE_OUTPUT_DIR, f)));
                    fs.rmdirSync(rootDir);
                }
            }
        } else {
            execSync(`tar -xzf "${archivePath}" -C "${JRE_OUTPUT_DIR}" --strip-components=1`);
        }

        console.log('[JRE] Estrazione completata.');
        fs.unlinkSync(archivePath); // Rimuovi archivio

        // Verifica
        const javaBin = path.join(JRE_OUTPUT_DIR, platform === 'windows' ? 'bin/java.exe' : 'bin/java');
        if (fs.existsSync(javaBin)) {
            console.log(`[JRE] Successo! Java binary: ${javaBin}`);
            if (platform !== 'windows') execSync(`chmod +x "${javaBin}"`);
        } else {
            console.error('[JRE] Errore: binario java non trovato dopo estrazione.');
            process.exit(1);
        }

    } catch (error) {
        console.error('[JRE] Errore:', error.message);
        if (fs.existsSync(archivePath)) fs.unlinkSync(archivePath);
        process.exit(1);
    }
}

main();
