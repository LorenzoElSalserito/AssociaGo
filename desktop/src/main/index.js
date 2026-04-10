/**
 * AssociaGo Electron Main Process
 *
 * @author Lorenzo DM
 * @since 0.2.0
 * @updated 0.6.2 - Added Splash Screen & Custom Logo
 */

const { app, BrowserWindow, ipcMain, dialog, shell } = require("electron");
const path = require("path");
const fs = require("fs");
const http = require("http");
const os = require("os");
const { spawn, spawnSync } = require("child_process");
const { electronApp, optimizer, is } = require('@electron-toolkit/utils');

const APP_SYSTEM_NAME = "associago-desktop";
const APP_DISPLAY_NAME = "AssociaGo";
const APP_USER_MODEL_ID = "com.lorenzodm.associago.desktop";

const isDev = process.env.NODE_ENV === "development" || !app.isPackaged;

// Se ti ricompaiono problemi GPU/ANGLE su Linux, avvia con:
// ASSOCIAGO_DISABLE_GPU=1 npm run dev
if (process.env.ASSOCIAGO_DISABLE_GPU === "1") {
    app.disableHardwareAcceleration();
    app.commandLine.appendSwitch("disable-gpu");
}

// Disable hardware acceleration to prevent libva errors on Linux (default for now)
app.disableHardwareAcceleration();

const BACKEND_DEFAULT_PORT = 8080;

let mainWindow = null;
let splashWindow = null;
let backendPort = BACKEND_DEFAULT_PORT;
let backendProcess = null;

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
    return path.join(os.homedir(), ".associago");
}

function ensureDir(dirPath) {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
}

function getUserDataPath() {
    return path.join(app.getPath("appData"), APP_SYSTEM_NAME);
}

function getRuntimeAssetPath(...segments) {
    if (isDev) {
        return path.join(__dirname, "..", "..", ...segments);
    }

    return path.join(process.resourcesPath, ...segments);
}

function getWindowIconPath() {
    if (process.platform === "darwin") {
        return getRuntimeAssetPath("icon.icns");
    }

    if (process.platform === "win32") {
        return getRuntimeAssetPath("icon.ico");
    }

    return getRuntimeAssetPath("icon.png");
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
    if (splashWindow && !splashWindow.isDestroyed()) {
        splashWindow.webContents.executeJavaScript(
            `document.getElementById('status').textContent = ${JSON.stringify(message)};`
        ).catch(() => {});
    }
}

function waitForBackendPort(retries = 20, delay = 1000) {
    return new Promise((resolve) => {
        const portFile = getBackendPortFile();
        let attempts = 0;

        const check = () => {
            attempts++;
            sendSplashStatus(`Starting backend... (${attempts}/${retries})`);
            try {
                if (fs.existsSync(portFile)) {
                    const content = fs.readFileSync(portFile, "utf-8");
                    const port = tryParseBackendPort(content);
                    if (port) {
                        console.log(`[Main] Backend port found: ${port} (attempt ${attempts})`);
                        resolve(port);
                        return;
                    }
                }
            } catch (e) {
                console.warn(`[Main] Error reading port file: ${e.message}`);
            }

            if (attempts >= retries) {
                console.error("[Main] Timeout waiting for backend port.");
                resolve(null);
            } else {
                setTimeout(check, delay);
            }
        };

        check();
    });
}

function waitForBackendReady(port, retries = 30, delay = 1000) {
    return new Promise((resolve) => {
        let attempts = 0;

        const check = () => {
            attempts++;
            sendSplashStatus(`Waiting for backend health check... (${attempts}/${retries})`);

            const req = http.get(`http://127.0.0.1:${port}/actuator/health`, { timeout: 2000 }, (res) => {
                let body = '';
                res.on('data', chunk => body += chunk);
                res.on('end', () => {
                    if (res.statusCode === 200) {
                        console.log(`[Main] Backend health OK on port ${port} (attempt ${attempts})`);
                        sendSplashStatus('Backend ready. Loading UI...');
                        resolve(true);
                    } else {
                        retry();
                    }
                });
            });

            req.on('error', () => retry());
            req.on('timeout', () => { req.destroy(); retry(); });

            function retry() {
                if (attempts >= retries) {
                    console.error("[Main] Timeout waiting for backend health.");
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

function getJavaExecutable() {
    // In dev mode, assume 'java' is in PATH
    if (isDev) return "java";

    // 1. Preferred: bundled JRE shipped inside the package
    //    Structure: <resources>/jre/bin/java[.exe]
    const jreDir = path.join(process.resourcesPath, "jre");
    const javaRelative = process.platform === "win32" ? "bin/java.exe" : "bin/java";
    const bundledJava = path.join(jreDir, javaRelative);

    if (fs.existsSync(bundledJava)) {
        // Make sure the file is executable on POSIX (extraResources should preserve
        // permissions, but some packagers strip them).
        if (process.platform !== "win32") {
            try { fs.chmodSync(bundledJava, 0o755); } catch (_) {}
        }
        console.log("[Main] Using bundled JRE:", bundledJava);
        return bundledJava;
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
    if (isDev) return null;

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
    if (isDev) {
        console.log("[Main] Dev mode: Skipping backend spawn (assume running externally)");
        const p = await waitForBackendPort(5, 500);
        backendPort = p || BACKEND_DEFAULT_PORT;
        const ready = await waitForBackendReady(backendPort, 10, 500);
        if (!ready) console.warn("[Main] Dev backend health check failed, proceeding anyway.");
        return;
    }

    const javaExec = getJavaExecutable();
    const jarPath = getBackendJar();

    if (!javaExec) {
        const message =
            "AssociaGo non riesce a trovare una runtime Java.\n\n" +
            "Il pacchetto avrebbe dovuto includere una JRE integrata. " +
            "Come fallback prova a installare Java 21 (https://adoptium.net) " +
            "e a riavviare l'applicazione.";
        console.error("[Main] " + message);
        dialog.showErrorBox("AssociaGo - Java non trovato", message);
        app.quit();
        return;
    }

    if (!jarPath) {
        const message =
            "AssociaGo non riesce a trovare il backend (file .jar) all'interno del pacchetto.\n\n" +
            "Il pacchetto risulta incompleto. Reinstalla l'applicazione.";
        console.error("[Main] Cannot start backend: JAR not found.");
        dialog.showErrorBox("AssociaGo - Backend mancante", message);
        app.quit();
        return;
    }

    console.log(`[Main] Spawning backend: ${javaExec} -jar ${jarPath}`);
    sendSplashStatus('Starting Java backend...');

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

    backendProcess = spawn(javaExec, [
        `-Dassociago.data.path=${dataPath}`,
        "-jar",
        jarPath
    ], {
        cwd: path.dirname(jarPath),
        detached: false,
        stdio: 'pipe'
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
    sendSplashStatus('Waiting for backend port...');
    const p = await waitForBackendPort();
    if (p) {
        backendPort = p;
    } else {
        console.warn("[Main] Failed to retrieve backend port after spawn.");
        return;
    }

    // Step 2: Health check — wait for Spring Boot to be fully ready
    sendSplashStatus('Running database migrations...');
    const ready = await waitForBackendReady(backendPort);
    if (!ready) {
        console.error("[Main] Backend never became healthy.");
        dialog.showErrorBox(
            "Startup Error",
            "AssociaGo backend failed to start. Check logs for details."
        );
        app.quit();
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
            dialog.showErrorBox("Startup Error", "Failed to start AssociaGo backend service.\n" + e.message);
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
        const portFile = getBackendPortFile();
        if (fs.existsSync(portFile)) {
            const content = fs.readFileSync(portFile, "utf-8");
            const port = tryParseBackendPort(content);
            if (port) {
                backendPort = port;
                return port;
            }
        }
    } catch (e) {
        console.warn("[Main] Failed to read port file on request:", e);
    }
    return backendPort;
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
        const options = {
            hostname: "localhost",
            port: backendPort,
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
        title: "AssociaGo - Esporta dati (JSON)",
        defaultPath,
        buttonLabel: "Esporta",
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
        title: "AssociaGo - Importa dati (JSON)",
        buttonLabel: "Importa",
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
        title: "AssociaGo - Esporta Database",
        defaultPath,
        buttonLabel: "Esporta",
        filters: [{ name: "SQLite Database", extensions: ["db"] }],
    });

    if (res.canceled || !res.filePath) {
        return { ok: false, canceled: true };
    }

    try {
        // Trova il file database nella nuova posizione
        const dbPath = path.join(getAssociaGoHome(), "associago.db");

        if (!fs.existsSync(dbPath)) {
            return { ok: false, error: "Database non trovato in " + dbPath };
        }

        fs.copyFileSync(dbPath, res.filePath);
        return { ok: true, filePath: res.filePath };
    } catch (e) {
        return { ok: false, error: e.message };
    }
});

ipcMain.handle("data:importDbDialog", async () => {
    const res = await dialog.showOpenDialog({
        title: "AssociaGo - Importa Database",
        buttonLabel: "Importa",
        filters: [{ name: "SQLite Database", extensions: ["db"] }],
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
            message: "Database importato. Riavvia l'applicazione per applicare le modifiche."
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
