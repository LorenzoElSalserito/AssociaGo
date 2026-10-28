/**
 * AssociaGo Electron Main Process
 *
 * @author Lorenzo DM
 * @since 0.2.0
 * @updated 0.6.2 - Added Splash Screen & Custom Logo
 */

const { app, BrowserWindow, ipcMain, dialog, shell, Menu } = require("electron");
const path = require("path");
const fs = require("fs");
const http = require("http");
const os = require("os");
const { spawn, spawnSync } = require("child_process");
const { electronApp, optimizer, is } = require('@electron-toolkit/utils');
import { createTranslator, normalizeLanguage } from "./i18n.mjs";

const APP_SYSTEM_NAME = "associago-desktop";
const APP_DISPLAY_NAME = "AssociaGo";
const APP_USER_MODEL_ID = "com.lorenzodm.associago.desktop";

const isDev = process.env.NODE_ENV === "development" || !app.isPackaged;

// =========================================================
// File logging — su Windows il binario Electron gira con
// subsystem "windows", quindi console.log non ha terminale
// quando l'app è lanciata da shortcut. Senza file log non
// possiamo diagnosticare nulla.
// =========================================================
const LOG_DIR = path.join(getAssociaGoHome(), "logs");
let LOG_FILE_PATH = null;

(function setupFileLogging() {
    try {
        if (!fs.existsSync(LOG_DIR)) fs.mkdirSync(LOG_DIR, { recursive: true });
        const stamp = new Date().toISOString().slice(0, 10);
        LOG_FILE_PATH = path.join(LOG_DIR, `electron-main-${stamp}.log`);
        const stream = fs.createWriteStream(LOG_FILE_PATH, { flags: "a" });

        const stringify = (a) => {
            if (typeof a === "string") return a;
            if (a instanceof Error) return a.stack || a.message;
            try { return JSON.stringify(a); } catch (_) { return String(a); }
        };
        const fmt = (level, args) =>
            `[${new Date().toISOString()}] [${level}] ${args.map(stringify).join(" ")}\n`;
        const wrap = (level, original) => (...args) => {
            try { stream.write(fmt(level, args)); } catch (_) {}
            try { original.apply(console, args); } catch (_) {}
        };
        console.log = wrap("INFO", console.log);
        console.warn = wrap("WARN", console.warn);
        console.error = wrap("ERROR", console.error);

        process.on("uncaughtException", (err) => {
            try { stream.write(fmt("FATAL", ["uncaughtException:", err && (err.stack || err.message)])); } catch (_) {}
        });
        process.on("unhandledRejection", (reason) => {
            try { stream.write(fmt("FATAL", ["unhandledRejection:", reason && (reason.stack || reason.message || String(reason))])); } catch (_) {}
        });

        console.log(`[Main] File logging enabled at: ${LOG_FILE_PATH}`);
        console.log(`[Main] Platform: ${process.platform} ${process.arch}, Node ${process.versions.node}, Electron ${process.versions.electron}`);
        console.log(`[Main] resourcesPath: ${process.resourcesPath}`);
        console.log(`[Main] homedir: ${os.homedir()}`);
    } catch (e) {
        try { console.error("[Main] Failed to setup file logging:", e.message); } catch (_) {}
    }
})();

// Se ti ricompaiono problemi GPU/ANGLE su Linux, avvia con:
// ASSOCIAGO_DISABLE_GPU=1 npm run dev
if (process.env.ASSOCIAGO_DISABLE_GPU === "1") {
    app.disableHardwareAcceleration();
    app.commandLine.appendSwitch("disable-gpu");
}

// Disable hardware acceleration to prevent libva errors on Linux (default for now)
app.disableHardwareAcceleration();

// UI language for dialogs/splash: the renderer's last choice (persisted here),
// otherwise the OS locale once the app is ready.
const UI_LANGUAGE_FILE = path.join(getAssociaGoHome(), "config", "ui-language.json");
function readSavedLanguage() {
    try { return normalizeLanguage(JSON.parse(fs.readFileSync(UI_LANGUAGE_FILE, "utf-8")).language); }
    catch (_) { return null; }
}
const savedLanguage = readSavedLanguage();
const tr = createTranslator(savedLanguage);

const BACKEND_DEFAULT_PORT = 8080;

let mainWindow = null;
let splashWindow = null;
let lastSplashStatus = null;
let backendPort = BACKEND_DEFAULT_PORT;
let backendInfo = null;
let backendProcess = null;
let backendManaged = false;

// =========================================================
// Focus Broker v2.1 (Conservativo + webContents key focus)
// =========================================================
let _lastFocusReqAt = 0;
let _hardFocusCount = 0;

function hardFocus(win, reason = 'unknown', force = false) {
    if (!win || win.isDestroyed()) return false;

    const focusId = ++_hardFocusCount;

    try {
        if (!force && win.isFocused()) {
            console.log(`[Main] hardFocus #${focusId} SKIPPED (already focused) reason: ${reason}`);
            return true;
        }

        if (win.isMinimized()) {
            win.restore();
        }

        if (!win.isVisible()) {
            win.show();
        }

        if (process.platform === 'darwin') {
            try { app.focus({ steal: true }); } catch {}
        }

        win.setFocusable(true);
        try { win.moveTop(); } catch {}
        win.focus();

        console.log(`[Main] hardFocus #${focusId} EXECUTED reason: ${reason}`);

        setTimeout(() => {
            if (!win || win.isDestroyed()) return;
            if (win.isFocused()) return;

            console.log(`[Main] hardFocus #${focusId} FALLBACK (window still not focused)`);

            const wasAOT = win.isAlwaysOnTop();
            win.setAlwaysOnTop(true, 'screen-saver');
            win.show();
            try { win.moveTop(); } catch {}
            win.focus();

            setTimeout(() => {
                if (!win.isDestroyed()) win.setAlwaysOnTop(wasAOT);
            }, 120);
        }, 50);

        return true;
    } catch (e) {
        console.warn(`[Main] hardFocus #${focusId} FAILED:`, e);
        return false;
    }
}

function throttledHardFocus(win, reason, force = false) {
    const now = Date.now();
    if (now - _lastFocusReqAt < 300) {
        console.log(`[Main] hardFocus THROTTLED (too soon) reason: ${reason}`);
        return;
    }
    _lastFocusReqAt = now;
    hardFocus(win, reason, force);
}

// ----------------------------
// Utility Functions
// ----------------------------

function pad2(n) {
    return String(n).padStart(2, "0");
}

function nowStamp() {
    const d = new Date();
    return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}_${pad2(
        d.getHours()
    )}${pad2(d.getMinutes())}${pad2(d.getSeconds())}`;
}

// ----------------------------
// Backend Management (Spawn & Port Reading)
// ----------------------------

function getAssociaGoHome() {
    return process.env.ASSOCIAGO_DATA_PATH ? path.resolve(process.env.ASSOCIAGO_DATA_PATH) : path.join(os.homedir(), ".associago");
}

function ensureDir(dirPath) {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
}

function getUserDataPath() {
    return process.env.ASSOCIAGO_DATA_PATH ? path.join(getAssociaGoHome(), "electron") : path.join(app.getPath("appData"), APP_SYSTEM_NAME);
}

function getRuntimeAssetPath(...segments) {
    if (isDev) {
        return path.join(__dirname, "..", "..", ...segments);
    }

    return path.join(process.resourcesPath, ...segments);
}

function getWindowIconPath() {
    const packagedRuntimeAsset = (fileName) => path.join(process.resourcesPath, "runtime-assets", fileName);

    if (process.platform === "darwin") {
        return app.isPackaged ? path.join(process.resourcesPath, "icon.icns") : getRuntimeAssetPath("resources", "icon.icns");
    }

    if (process.platform === "win32") {
        return app.isPackaged ? packagedRuntimeAsset("icon.ico") : getRuntimeAssetPath("resources", "icon.ico");
    }

    return app.isPackaged ? packagedRuntimeAsset("icon.png") : getRuntimeAssetPath("resources", "icon.png");
}

function resolveRendererEntry(pageName) {
    if (isDev && process.env['ELECTRON_RENDERER_URL']) {
        const baseUrl = process.env['ELECTRON_RENDERER_URL'];
        return new URL(`${pageName}.html`, baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`).toString();
    }

    return path.join(__dirname, `../renderer/${pageName}.html`);
}

function getBackendPortFile() {
    return path.join(getAssociaGoHome(), "config", "connection.json");
}

function normalizeBackendHost(host) {
    if (!host || String(host).toLowerCase() === "localhost") return "127.0.0.1";
    return String(host);
}

function buildBackendInfo(raw = {}) {
    const port = Number(raw?.port ?? backendPort ?? BACKEND_DEFAULT_PORT);
    if (!Number.isInteger(port) || port <= 0 || port >= 65536) return null;

    const protocol = raw?.protocol || "http";
    const host = normalizeBackendHost(raw?.host || "127.0.0.1");
    const baseUrl = raw?.baseUrl && !String(raw.baseUrl).includes("localhost")
        ? raw.baseUrl
        : `${protocol}://${host}:${port}`;

    return {
        schemaVersion: Number(raw?.schemaVersion) || 1,
        protocol,
        host,
        port,
        baseUrl,
        apiBaseUrl: raw?.apiBaseUrl && !String(raw.apiBaseUrl).includes("localhost")
            ? raw.apiBaseUrl
            : `${baseUrl}/api`,
        healthUrl: raw?.healthUrl && !String(raw.healthUrl).includes("localhost")
            ? raw.healthUrl
            : `${baseUrl}/actuator/health`
    };
}

function readBackendInfoFromDisk() {
    const portFile = getBackendPortFile();
    try {
        if (!fs.existsSync(portFile)) return null;

        const content = fs.readFileSync(portFile, "utf-8").trim();
        if (!content) return null;

        if (content.startsWith("{")) {
            const info = buildBackendInfo(JSON.parse(content));
            if (info) return info;
        }

        const port = Number(content);
        if (Number.isInteger(port) && port > 0 && port < 65536) {
            return buildBackendInfo({ port });
        }
    } catch (e) {
        console.warn(`[Main] Error reading backend info: ${e.message}`);
    }

    return null;
}

function tryParseBackendPort(content) {
    const s = (content ?? "").trim();
    if (!s) return null;

    if (s.startsWith("{")) {
        try {
            const obj = JSON.parse(s);
            const p = Number(obj?.port);
            if (Number.isInteger(p) && p > 0 && p < 65536) return p;
        } catch (_) {
            // ignore
        }
    }

    const p = Number(s);
    if (Number.isInteger(p) && p > 0 && p < 65536) return p;

    return null;
}

function sendSplashStatus(message) {
    lastSplashStatus = message;
    if (splashWindow && !splashWindow.isDestroyed()) {
        splashWindow.webContents.executeJavaScript(
            `document.getElementById('status').textContent = ${JSON.stringify(message)};`
        ).catch(() => {});
    }
}

// 30 minuti: su Windows con Defender/antivirus aggressivo l'estrazione del
// fat-JAR e l'inizializzazione di Flyway/SQLite possono essere molto lente.
// Tipicamente Linux/Mac escono in ~10s, Windows "sano" in ~50s.
function waitForBackendInfo(retries = 1800, delay = 1000) {
    return new Promise((resolve) => {
        let attempts = 0;

        const check = () => {
            attempts++;
            const elapsed = attempts;
            sendSplashStatus(tr('splash.startingBackendElapsed', { seconds: elapsed }));

            // Early-abort: se il processo Java è già morto, inutile aspettare.
            if (backendManaged && backendProcess === null) {
                console.error("[Main] Backend process exited before writing port file. Aborting wait.");
                resolve(null);
                return;
            }

            try {
                const info = readBackendInfoFromDisk();
                if (info) {
                    backendInfo = info;
                    backendPort = info.port;
                    console.log(`[Main] Backend info found: ${info.baseUrl} (attempt ${attempts})`);
                    resolve(info);
                    return;
                }
            } catch (e) {
                console.warn(`[Main] Error reading port file: ${e.message}`);
            }

            if (attempts >= retries) {
                console.error(`[Main] Timeout waiting for backend port after ${retries}s.`);
                resolve(null);
            } else {
                setTimeout(check, delay);
            }
        };

        check();
    });
}

function waitForBackendPort(retries = 1800, delay = 1000) {
    return waitForBackendInfo(retries, delay).then((info) => info?.port || null);
}

function waitForBackendReady(infoOrPort, retries = 1800, delay = 1000) {
    return new Promise((resolve) => {
        let attempts = 0;
        const info = typeof infoOrPort === "object"
            ? infoOrPort
            : buildBackendInfo({ port: infoOrPort });
        const healthUrl = info?.healthUrl || `http://127.0.0.1:${backendPort}/actuator/health`;

        const check = () => {
            attempts++;
            sendSplashStatus(tr('splash.healthCheck', { seconds: attempts }));

            // Early-abort: se il processo Java è già morto, inutile aspettare.
            if (backendManaged && backendProcess === null) {
                console.error("[Main] Backend process exited before health check passed. Aborting wait.");
                resolve(false);
                return;
            }

            const req = http.get(healthUrl, { timeout: 2000 }, (res) => {
                let body = '';
                res.on('data', chunk => body += chunk);
                res.on('end', () => {
                    if (res.statusCode === 200) {
                        console.log(`[Main] Backend health OK at ${healthUrl} (attempt ${attempts})`);
                        sendSplashStatus(tr('splash.ready'));
                        resolve(true);
                    } else {
                        retry();
                    }
                });
            });

            req.on('error', () => retry());
            req.on('timeout', () => req.destroy(new Error('Backend health timeout')));

            function retry() {
                if (attempts >= retries) {
                    console.error(`[Main] Timeout waiting for backend health after ${retries}s.`);
                    resolve(false);
                } else {
                    setTimeout(check, delay);
                }
            }
        };

        check();
    });
}

function isExecutable(binPath) {
    try {
        const result = spawnSync(binPath, ["-version"], { stdio: "ignore" });
        return !result.error && (result.status === 0 || result.status === 1);
    } catch (_) {
        return false;
    }
}

function dumpDir(label, dir, depth = 1) {
    try {
        if (!fs.existsSync(dir)) {
            console.log(`[Main] ${label}: ${dir} (does not exist)`);
            return;
        }
        const entries = fs.readdirSync(dir);
        console.log(`[Main] ${label}: ${dir} (${entries.length} entries) -> ${entries.slice(0, 30).join(", ")}${entries.length > 30 ? " ..." : ""}`);
        if (depth > 0) {
            for (const e of entries.slice(0, 10)) {
                const p = path.join(dir, e);
                try {
                    if (fs.statSync(p).isDirectory()) dumpDir(`${label}/${e}`, p, depth - 1);
                } catch (_) {}
            }
        }
    } catch (e) {
        console.warn(`[Main] dumpDir(${label}) failed: ${e.message}`);
    }
}

function getJavaExecutable() {
    // In dev mode, assume 'java' is in PATH
    if (isDev) return "java";

    // 1. Preferred: bundled JRE shipped inside the package
    //    Structure: <resources>/jre/bin/java[.exe]
    const jreDir = path.join(process.resourcesPath, "jre");
    const javaRelative = process.platform === "win32" ? "bin/java.exe" : "bin/java";
    const bundledJava = path.join(jreDir, javaRelative);

    console.log(`[Main] Java probe: looking for bundled JRE at ${bundledJava}`);
    dumpDir("jreDir", jreDir, 1);

    if (fs.existsSync(bundledJava)) {
        try {
            const st = fs.statSync(bundledJava);
            console.log(`[Main] Bundled java: size=${st.size}, mode=${(st.mode & 0o777).toString(8)}`);
        } catch (_) {}
        // Make sure the file is executable on POSIX (extraResources should preserve
        // permissions, but some packagers strip them).
        if (process.platform !== "win32") {
            try { fs.chmodSync(bundledJava, 0o755); } catch (_) {}
        }
        console.log("[Main] Using bundled JRE:", bundledJava);
        return bundledJava;
    }

    // Cross-build trap: on Windows, if jre/bin/java exists (no .exe), it means
    // the JRE was built on Linux/macOS and shipped to Windows by mistake.
    if (process.platform === "win32") {
        const wrongPlatform = path.join(jreDir, "bin", "java");
        if (fs.existsSync(wrongPlatform)) {
            console.error(`[Main] CROSS-BUILD ERROR: bundled JRE contains POSIX 'java' (no .exe) — wrong platform image. Expected ${bundledJava}.`);
        }
    }

    console.warn("[Main] Bundled JRE not found at", bundledJava);

    // 2. Fallback: system java on PATH
    const systemJava = process.platform === "win32" ? "java.exe" : "java";
    if (isExecutable(systemJava)) {
        console.warn("[Main] Falling back to system java on PATH");
        return systemJava;
    }

    // 3. Last resort: JAVA_HOME
    if (process.env.JAVA_HOME) {
        const fromJavaHome = path.join(process.env.JAVA_HOME, javaRelative);
        if (fs.existsSync(fromJavaHome) && isExecutable(fromJavaHome)) {
            console.warn("[Main] Falling back to JAVA_HOME:", fromJavaHome);
            return fromJavaHome;
        }
    }

    // 4. Nothing available — return null so the caller can show a clear error.
    console.error("[Main] No usable Java runtime found (bundled, PATH, or JAVA_HOME).");
    return null;
}

function getBackendJar() {
    if (isDev) {
        const dir = path.resolve(__dirname, '../../../build/libs');
        if (!fs.existsSync(dir)) return null;
        const jars = fs.readdirSync(dir).filter(file => file.endsWith('.jar') && !file.endsWith('-plain.jar'));
        jars.sort((a, b) => fs.statSync(path.join(dir, b)).mtimeMs - fs.statSync(path.join(dir, a)).mtimeMs);
        return jars[0] ? path.join(dir, jars[0]) : null;
    }

    // In production, look for the bundled backend in the known resource locations.
    const fixedJarPath = path.join(process.resourcesPath, "backend", "backend.jar");
    if (fs.existsSync(fixedJarPath)) {
        console.log("[Main] Found backend JAR:", fixedJarPath);
        return fixedJarPath;
    }

    const candidateDirs = [
        path.join(process.resourcesPath, "backend"),
        path.join(process.resourcesPath, "backend-libs")
    ];

    for (const dir of candidateDirs) {
        if (!fs.existsSync(dir)) continue;

        const jarFile = fs.readdirSync(dir)
            .find((file) => file.endsWith(".jar") && !file.endsWith("-plain.jar"));

        if (jarFile) {
            const resolved = path.join(dir, jarFile);
            console.log("[Main] Found backend JAR:", resolved);
            return resolved;
        }
    }

    console.error("[Main] Backend JAR not found in packaged resources.");
    return null;
}

async function startBackend() {
    if (isDev && process.env.ASSOCIAGO_MANAGED_BACKEND !== '1') {
        // Reuse an external development backend only after a successful health check.
        backendInfo = readBackendInfoFromDisk() || buildBackendInfo({ port: BACKEND_DEFAULT_PORT });
        backendPort = backendInfo.port;
        if (await waitForBackendReady(backendInfo, 2, 250)) {
            console.log('[Main] Using healthy external development backend');
            return;
        }
        console.log('[Main] Development backend unavailable; starting local JAR.');
    }

    const javaExec = getJavaExecutable();
    const jarPath = getBackendJar();

    if (!javaExec) {
        const message = tr('javaMissing.message', { log: LOG_FILE_PATH || LOG_DIR });
        console.error("[Main] " + message);
        dialog.showErrorBox(tr('javaMissing.title'), message);
        throw new Error(message);
    }

    if (!jarPath) {
        const message = tr('backendMissing.message', {
            hint: tr(isDev ? 'backendMissing.devHint' : 'backendMissing.packageHint'),
            log: LOG_FILE_PATH || LOG_DIR
        });
        console.error("[Main] Cannot start backend: JAR not found.");
        dialog.showErrorBox(tr('backendMissing.title'), message);
        throw new Error(message);
    }

    // Diagnostic: capture java -version output (Java prints version on stderr)
    try {
        const v = spawnSync(javaExec, ["-version"], { encoding: "utf-8" });
        console.log(`[Main] java -version exit=${v.status}, error=${v.error ? v.error.message : "none"}`);
        if (v.stdout) console.log(`[Main] java -version stdout: ${v.stdout.trim()}`);
        if (v.stderr) console.log(`[Main] java -version stderr: ${v.stderr.trim()}`);
    } catch (e) {
        console.error("[Main] java -version probe failed:", e.message);
    }

    console.log(`[Main] Spawning backend: ${javaExec} -jar ${jarPath}`);
    sendSplashStatus(tr('splash.startingJava'));

    // Ensure data directory exists
    const dataPath = getAssociaGoHome();
    ensureDir(dataPath);
    ensureDir(path.join(dataPath, "config"));
    ensureDir(path.join(dataPath, "logs"));
    ensureDir(path.join(dataPath, "logs", "archived"));
    ensureDir(path.join(dataPath, "assets"));

    // Delete old port file to ensure we read the new one
    const portFile = getBackendPortFile();
    if (fs.existsSync(portFile)) {
        try { fs.unlinkSync(portFile); } catch(e) {}
    }

    try {
        backendManaged = true;
        backendProcess = spawn(javaExec, [
            `-Dassociago.data.path=${dataPath}`,
            "-Dspring.profiles.active=desktop",
            "-Dserver.address=127.0.0.1",
            "-Dfile.encoding=UTF-8",
            "-jar",
            jarPath
        ], {
            cwd: path.dirname(jarPath),
            detached: false,
            stdio: 'pipe'
        });
    } catch (e) {
        console.error(`[Main] spawn() threw: ${e.code || ""} ${e.message}`);
        dialog.showErrorBox(
            tr('spawnFailed.title'),
            tr('spawnFailed.message', { error: e.message, log: LOG_FILE_PATH || LOG_DIR })
        );
        throw e;
    }

    backendProcess.on('error', (err) => {
        console.error(`[Main] Backend spawn error: code=${err.code || ""} msg=${err.message}`);
    });

    backendProcess.stdout.on('data', (data) => {
        console.log(`[Backend] ${data}`);
    });

    backendProcess.stderr.on('data', (data) => {
        console.error(`[Backend] ${data}`);
    });

    backendProcess.on('close', (code) => {
        console.log(`[Backend] Process exited with code ${code}`);
        backendProcess = null;
    });

    // Step 1: Wait for port file
    sendSplashStatus(tr('splash.startingBackend'));
    const info = await waitForBackendInfo();
    if (!info) {
        console.error("[Main] Failed to retrieve backend port after spawn — backend never wrote connection.json.");
        if (backendProcess) { try { backendProcess.kill(); } catch (_) {} }
        dialog.showErrorBox(
            tr('backendTimeout.title'),
            tr('backendTimeout.message', { log: LOG_FILE_PATH || LOG_DIR })
        );
        // app.exit() è sincrono e termina subito: evita che createWindow venga
        // comunque chiamato dopo il return.
        app.exit(1);
        return;
    }
    backendInfo = info;
    backendPort = info.port;

    // Step 2: Health check — wait for Spring Boot to be fully ready
    sendSplashStatus(tr('splash.checkingBackend'));
    const ready = await waitForBackendReady(backendInfo);
    if (!ready) {
        console.error("[Main] Backend never became healthy.");
        if (backendProcess) { try { backendProcess.kill(); } catch (_) {} }
        throw new Error(tr('backendUnhealthy.message', { log: LOG_FILE_PATH || LOG_DIR }));
    }
}

function stopBackend() {
    if (backendProcess) {
        console.log("[Main] Stopping backend process...");
        backendProcess.kill();
        backendProcess = null;
    }
}

// ----------------------------
// Window
// ----------------------------

function createSplashWindow() {
    splashWindow = new BrowserWindow({
        width: 400,
        height: 400,
        frame: false,
        transparent: false,
        alwaysOnTop: true,
        resizable: false,
        icon: getWindowIconPath(),
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true
        }
    });

    const splashEntry = resolveRendererEntry("splash");
    if (splashEntry.startsWith("http")) splashWindow.loadURL(splashEntry);
    else splashWindow.loadFile(splashEntry);

    splashWindow.webContents.once('did-finish-load', () => sendSplashStatus(lastSplashStatus || tr('splash.loading')));
    splashWindow.center();

    splashWindow.on('closed', () => {
        splashWindow = null;
    });
}

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1400,
        height: 900,
        minWidth: 800,
        minHeight: 600,
        title: APP_DISPLAY_NAME,
        icon: getWindowIconPath(),
        show: false, // Hidden initially, shown when ready
        autoHideMenuBar: true,
        webPreferences: {
            preload: path.join(__dirname, "../preload/index.js"),
            nodeIntegration: false,
            contextIsolation: true,
            sandbox: false
        }
    });

    // Debug focus
    mainWindow.webContents.on('focus', () => console.log('[Main] webContents FOCUS'));
    mainWindow.webContents.on('blur', () => console.log('[Main] webContents BLUR'));

    // Notifica renderer + hook per recupero focus
    mainWindow.on('focus', () => {
        console.log('[Main] window FOCUS');
        try { mainWindow.webContents.send('app:focus'); } catch {}
    });
    mainWindow.on('blur', () => {
        console.log('[Main] window BLUR');
        try { mainWindow.webContents.send('app:blur'); } catch {}
    });

    mainWindow.webContents.on("did-fail-load", (_event, errorCode, errorDescription, validatedURL) => {
        console.error("[Main] did-fail-load", { errorCode, errorDescription, validatedURL });
    });

    const mainEntry = resolveRendererEntry("index");
    if (mainEntry.startsWith("http")) {
        mainWindow.loadURL(mainEntry);
        if (mainWindow.webContents.isDevToolsOpened()) {
            mainWindow.webContents.closeDevTools();
        }
        mainWindow.webContents.openDevTools({ mode: 'detach', activate: false });
    } else {
        mainWindow.loadFile(mainEntry);
    }

    mainWindow.once('ready-to-show', () => {
        // Close splash screen and show main window
        if (splashWindow) {
            splashWindow.close();
        }
        mainWindow.show();
        hardFocus(mainWindow, 'ready-to-show', true);
    });

    mainWindow.on('restore', () => hardFocus(mainWindow, 'restore'));

    mainWindow.on("closed", () => {
        mainWindow = null;
    });

    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
        shell.openExternal(url);
        return { action: "deny" };
    });
    mainWindow.webContents.on("did-fail-load", (_e, code, desc, url) => {
        console.error("[Main] did-fail-load", { code, desc, url });
    });

    mainWindow.webContents.on("render-process-gone", (_e, details) => {
        console.error("[Main] render-process-gone", details);
    });

    mainWindow.webContents.on("console-message", (_e, level, message, line, sourceId) => {
        console.log(`[Renderer][L${level}] ${message} (${sourceId}:${line})`);
    });

    let didFinishLoadCalled = false;
    mainWindow.webContents.on("did-finish-load", () => {
        console.log("[Main] did-finish-load URL =", mainWindow.webContents.getURL());
        if (!didFinishLoadCalled) {
            didFinishLoadCalled = true;
            hardFocus(mainWindow, 'did-finish-load', true);
        }
    });
}

// ----------------------------
// App lifecycle
// ----------------------------

app.whenReady().then(async () => {
    app.setName(APP_SYSTEM_NAME);
    app.setPath("userData", getUserDataPath());
    electronApp.setAppUserModelId(APP_USER_MODEL_ID);
    Menu.setApplicationMenu(null);
    if (!savedLanguage) tr.setLanguage(app.getLocale());

    app.on('browser-window-created', (_, window) => {
        optimizer.watchWindowShortcuts(window);
    });

    console.log("[Main] AssociaGo starting...");
    console.log("[Main] isDev:", isDev);
    console.log("[Main] cwd:", process.cwd());
    console.log("[Main] userData:", app.getPath("userData"));
    console.log("[Main] Data path:", getAssociaGoHome());

    // 1. Show Splash Screen immediately
    createSplashWindow();

    // 2. Start Backend (heavy lifting)
    // We use a small delay to ensure splash is rendered
    setTimeout(async () => {
        try {
            await startBackend();
            console.log("[Main] Backend port:", backendPort);

            // 3. Create Main Window (this will close splash when ready-to-show)
            createWindow();
        } catch (e) {
            console.error("[Main] Failed to start backend:", e);
            dialog.showErrorBox(tr('startupError.title'), tr('startupError.message', { error: e.message }));
            app.quit();
        }
    }, 500);

    app.on("activate", () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
        else hardFocus(mainWindow, 'app-activate');
    });
});

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        stopBackend();
        app.quit();
    }
});

app.on("will-quit", () => {
    stopBackend();
});

// ----------------------------
// IPC - Core
// ----------------------------

ipcMain.on('jl:force-focus', (event, payload) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    const reason = payload?.reason || 'async';
    console.log('[Main] jl:force-focus RECEIVED reason:', reason);
    if (!win) return;
    throttledHardFocus(win, `ipc:${reason}`, false);
});

ipcMain.on('jl:force-focus-sync', (event, payload) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    const reason = payload?.reason || 'sync';
    if (win && !win.isFocused()) {
        throttledHardFocus(win, `ipc-sync:${reason}`, false);
    } else {
        console.log(`[Main] jl:force-focus-sync SKIPPED (already focused) reason: ${reason}`);
    }
    event.returnValue = true;
});

ipcMain.on('jl:ensure-webcontent-focus', (event, payload) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    const reason = payload?.reason || 'ensure';

    if (!win || win.isDestroyed()) {
        event.returnValue = false;
        return;
    }

    console.log(`[Main] jl:ensure-webcontent-focus reason: ${reason}`);

    if (!win.isVisible()) win.show();
    if (!win.isFocused()) win.focus();

    try {
        win.webContents.focus();
        console.log('[Main] webContents.focus() called');
    } catch (e) {
        console.warn('[Main] webContents.focus() failed:', e);
    }

    event.returnValue = true;
});

ipcMain.handle("associago:focus-window", () => {
    const win = BrowserWindow.getFocusedWindow() || mainWindow;
    if (!win) return false;
    if (win.isFocused()) {
        console.log('[Main] associago:focus-window SKIPPED (already focused)');
        return true;
    }
    throttledHardFocus(win, "ipc:associago:focus-window", false);
    return true;
});

ipcMain.handle("get-backend-port", () => {
    try {
        const info = readBackendInfoFromDisk();
        if (info) {
            backendInfo = info;
            backendPort = info.port;
            return info.port;
        }
    } catch (e) {
        console.warn("[Main] Failed to read port file on request:", e);
    }
    return backendPort;
});

ipcMain.handle("get-backend-info", () => {
    const info = readBackendInfoFromDisk();
    if (info) {
        backendInfo = info;
        backendPort = info.port;
        return info;
    }

    if (backendInfo) return backendInfo;
    return buildBackendInfo({ port: backendPort });
});

ipcMain.handle('ui:set-zoom', (event, percent) => {
    if (!Number.isInteger(percent) || percent < 50 || percent > 200 || percent % 25 !== 0) {
        throw new Error('Zoom must be between 50 and 200 in steps of 25');
    }
    event.sender.setZoomFactor(percent / 100);
    return percent;
});

ipcMain.handle('ui:set-language', (_event, language) => {
    const next = normalizeLanguage(language);
    if (!next) return tr.getLanguage();
    tr.setLanguage(next);
    try {
        fs.mkdirSync(path.dirname(UI_LANGUAGE_FILE), { recursive: true });
        fs.writeFileSync(UI_LANGUAGE_FILE, JSON.stringify({ language: next }), "utf-8");
    } catch (e) {
        console.warn("[Main] Cannot persist UI language:", e.message);
    }
    return next;
});

ipcMain.handle("backend:refreshPort", () => {
    // In standalone mode, we rely on the port we found at startup
    // But we can re-check the file if needed
    return backendPort;
});

ipcMain.handle("app:getPath", (_, name) => {
    try {
        return app.getPath(name);
    } catch (e) {
        return null;
    }
});

ipcMain.handle("data:getLocalDataPath", () => getAssociaGoHome());

ipcMain.handle("app:getLogPath", () => LOG_FILE_PATH || LOG_DIR);
ipcMain.handle("app:openLogsFolder", async () => {
    try {
        if (!fs.existsSync(LOG_DIR)) fs.mkdirSync(LOG_DIR, { recursive: true });
        return await shell.openPath(LOG_DIR);
    } catch (e) {
        console.error("[Main] openLogsFolder failed:", e.message);
        return e.message;
    }
});

ipcMain.handle("shell:openPath", async (_, filePath) => shell.openPath(filePath));
ipcMain.handle("shell:showItemInFolder", (_, filePath) => shell.showItemInFolder(filePath));
ipcMain.handle("shell:openExternal", async (_, url) => shell.openExternal(url));

ipcMain.on("window:minimize", () => mainWindow?.minimize());
ipcMain.on("window:maximize", () => {
    if (mainWindow?.isMaximized()) mainWindow.unmaximize();
    else mainWindow?.maximize();
});
ipcMain.on("window:close", () => mainWindow?.close());

ipcMain.on("renderer:log", (_, level, ...args) => {
    const prefix = "[Renderer]";
    if (level === "warn") console.warn(prefix, ...args);
    else if (level === "error") console.error(prefix, ...args);
    else console.log(prefix, ...args);
});

// ----------------------------
// Proxy IPC -> Backend HTTP
// ----------------------------

async function callBackend(method, apiPath, body = null, extraHeaders = {}) {
    return new Promise((resolve, reject) => {
        const info = backendInfo || readBackendInfoFromDisk() || buildBackendInfo({ port: backendPort });
        const options = {
            hostname: info.host,
            port: info.port,
            path: `/api${apiPath}`,
            method,
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                ...extraHeaders
            }
        };

        const req = http.request(options, (res) => {
            let data = "";
            res.on("data", (chunk) => (data += chunk));
            res.on("end", () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    try {
                        resolve(data ? JSON.parse(data) : null);
                    } catch (e) {
                        reject(e);
                    }
                } else {
                    reject(new Error(`HTTP ${res.statusCode}: ${data}`));
                }
            });
        });

        req.on("error", reject);
        req.setTimeout(10000, () => {
            req.destroy();
            reject(new Error("Request timeout"));
        });

        if (body) req.write(JSON.stringify(body));
        req.end();
    });
}

// ----------------------------
// IPC - Export/Import Data
// ----------------------------

ipcMain.handle("data:exportJsonDialog", async () => {
    const defaultPath = path.join(
        app.getPath("documents"),
        `AssociaGo-export-${nowStamp()}.json`
    );

    const res = await dialog.showSaveDialog({
        title: tr('dialog.exportJson'),
        defaultPath,
        buttonLabel: tr('dialog.export'),
        filters: [{ name: "JSON", extensions: ["json"] }],
    });

    if (res.canceled || !res.filePath) {
        return { ok: false, canceled: true };
    }

    try {
        // TODO: Implement backend export endpoint
        // const data = await callBackend("GET", "/export");
        const exportData = {
            version: app.getVersion(),
            exportedAt: new Date().toISOString(),
            data: {},
        };

        fs.writeFileSync(res.filePath, JSON.stringify(exportData, null, 2), "utf-8");
        return { ok: true, filePath: res.filePath };
    } catch (e) {
        return { ok: false, error: e.message };
    }
});

ipcMain.handle("data:importJsonDialog", async () => {
    const res = await dialog.showOpenDialog({
        title: tr('dialog.importJson'),
        buttonLabel: tr('dialog.import'),
        filters: [{ name: "JSON", extensions: ["json"] }],
        properties: ["openFile"],
    });

    if (res.canceled || !res.filePaths || res.filePaths.length === 0) {
        return { ok: false, canceled: true };
    }

    const importPath = res.filePaths[0];

    try {
        const raw = fs.readFileSync(importPath, "utf-8");
        const data = JSON.parse(raw);
        return { ok: true, importPath, data };
    } catch (e) {
        return { ok: false, error: e.message };
    }
});

ipcMain.handle("data:exportDbDialog", async () => {
    const defaultPath = path.join(
        app.getPath("documents"),
        `AssociaGo-db-${nowStamp()}.db`
    );

    const res = await dialog.showSaveDialog({
        title: tr('dialog.exportDb'),
        defaultPath,
        buttonLabel: tr('dialog.export'),
        filters: [{ name: tr('dialog.sqliteFilter'), extensions: ["db"] }],
    });

    if (res.canceled || !res.filePath) {
        return { ok: false, canceled: true };
    }

    try {
        // Trova il file database nella nuova posizione
        const dbPath = path.join(getAssociaGoHome(), "associago.db");

        if (!fs.existsSync(dbPath)) {
            return { ok: false, error: tr('dialog.dbNotFound', { path: dbPath }) };
        }

        fs.copyFileSync(dbPath, res.filePath);
        return { ok: true, filePath: res.filePath };
    } catch (e) {
        return { ok: false, error: e.message };
    }
});

ipcMain.handle("data:importDbDialog", async () => {
    const res = await dialog.showOpenDialog({
        title: tr('dialog.importDb'),
        buttonLabel: tr('dialog.import'),
        filters: [{ name: tr('dialog.sqliteFilter'), extensions: ["db"] }],
        properties: ["openFile"],
    });

    if (res.canceled || !res.filePaths || res.filePaths.length === 0) {
        return { ok: false, canceled: true };
    }

    const importPath = res.filePaths[0];

    try {
        const destDb = path.join(getAssociaGoHome(), "associago.db");

        // Backup del database esistente
        if (fs.existsSync(destDb)) {
            const backupPath = destDb.replace(".db", `.backup-${nowStamp()}.db`);
            fs.copyFileSync(destDb, backupPath);
        }

        // Copia il nuovo database
        fs.copyFileSync(importPath, destDb);

        return {
            ok: true,
            importPath,
            destPath: destDb,
            message: tr('dialog.dbImported')
        };
    } catch (e) {
        return { ok: false, error: e.message };
    }
});

// Add getAppVersion handler
ipcMain.handle("getAppVersion", () => {
    return app.getVersion();
});

console.log("[Main] IPC handlers registered");
