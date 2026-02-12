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
const { spawn } = require("child_process");
const { electronApp, optimizer, is } = require('@electron-toolkit/utils');

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

function waitForBackendPort(retries = 20, delay = 1000) {
    return new Promise((resolve) => {
        const portFile = getBackendPortFile();
        let attempts = 0;

        const check = () => {
            attempts++;
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

function getJavaExecutable() {
    // In dev mode, assume 'java' is in PATH
    if (isDev) return "java";

    // In production, look for bundled JRE
    const jrePath = path.join(process.resourcesPath, "jre");
    const javaBin = process.platform === "win32" ? "bin/java.exe" : "bin/java";
    const bundledJava = path.join(jrePath, javaBin);

    if (fs.existsSync(bundledJava)) {
        return bundledJava;
    }

    console.warn("[Main] Bundled JRE not found, falling back to system java");
    return "java";
}

function getBackendJar() {
    // In dev mode, we might not want to spawn the backend if we are running it separately in IntelliJ
    // But if we wanted to, we'd look in ../build/libs
    if (isDev) return null;

    // In production, look for bundled JAR
    // We configured electron-builder to put backend-libs in resources
    const libPath = path.join(process.resourcesPath, "backend-libs");

    if (!fs.existsSync(libPath)) {
        console.error("[Main] Backend libs directory not found:", libPath);
        return null;
    }

    const files = fs.readdirSync(libPath);
    const jarFile = files.find(f => f.endsWith(".jar") && !f.includes("plain")); // Avoid plain jars if any

    if (jarFile) {
        return path.join(libPath, jarFile);
    }

    console.error("[Main] No backend JAR found in:", libPath);
    return null;
}

function startBackend() {
    if (isDev) {
        console.log("[Main] Dev mode: Skipping backend spawn (assume running externally)");
        // Try to read port immediately, assuming it's already running
        return waitForBackendPort(5, 500).then(p => {
            backendPort = p || BACKEND_DEFAULT_PORT;
        });
    }

    const javaExec = getJavaExecutable();
    const jarPath = getBackendJar();

    if (!jarPath) {
        console.error("[Main] Cannot start backend: JAR not found.");
        return Promise.resolve();
    }

    console.log(`[Main] Spawning backend: ${javaExec} -jar ${jarPath}`);

    // Ensure data directory exists
    const dataPath = getAssociaGoHome();
    if (!fs.existsSync(dataPath)) {
        fs.mkdirSync(dataPath, { recursive: true });
    }

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
        stdio: 'pipe' // Capture stdout/stderr
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

    return waitForBackendPort().then(p => {
        if (p) backendPort = p;
        else console.warn("[Main] Failed to retrieve backend port after spawn.");
    });
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
        // icon: path.join(__dirname, "..", "src/assets", "icon.svg"), // Use SVG icon
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true
        }
    });

    if (isDev && process.env['ELECTRON_RENDERER_URL']) {
        splashWindow.loadFile(path.join(__dirname, '../../src/renderer/splash.html'))
    } else {
        splashWindow.loadFile(path.join(__dirname, '../renderer/splash.html'))
    }

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
        title: "AssociaGo",
        // icon: path.join(__dirname, "..", "src/assets", "Logo.svg"), // Use SVG icon
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

    if (isDev && process.env['ELECTRON_RENDERER_URL']) {
        mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL']);
        if (mainWindow.webContents.isDevToolsOpened()) {
            mainWindow.webContents.closeDevTools();
        }
        mainWindow.webContents.openDevTools({ mode: 'detach', activate: false });
    } else {
        mainWindow.loadFile(path.join(__dirname, "../renderer/index.html"));
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
    electronApp.setAppUserModelId('com.associago');

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
            version: "1.0.0",
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

console.log("[Main] IPC handlers registered");
