const { app, BrowserWindow } = require('electron');
const path = require('node:path');

const waitFor = async (window, expression, timeoutMs = 10000) => {
    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
        if (await window.webContents.executeJavaScript(expression)) return;
        await new Promise((resolve) => setTimeout(resolve, 100));
    }
    throw new Error(`Timeout waiting for: ${expression}`);
};

app.disableHardwareAcceleration();

app.whenReady().then(async () => {
    const window = new BrowserWindow({ show: false, webPreferences: { contextIsolation: true } });
    const renderer = path.join(__dirname, '..', 'out', 'renderer', 'manual-e2e.html');

    try {
        await window.loadFile(renderer);
        await waitFor(window, `document.querySelector('.markdown-body h1')?.textContent?.trim().length > 0`);

        const firstChapter = await window.webContents.executeJavaScript(
            `document.querySelector('.markdown-body h1').textContent.trim()`
        );
        if (!firstChapter.toLowerCase().includes('associago')) {
            throw new Error(`Unexpected first chapter heading: ${firstChapter}`);
        }

        await window.webContents.executeJavaScript(
            `document.querySelectorAll('.list-group-item')[1].click()`
        );
        await waitFor(window, `document.querySelector('.markdown-body h1')?.textContent?.includes('Soci')`);

        const secondChapter = await window.webContents.executeJavaScript(
            `document.querySelector('.markdown-body h1').textContent.trim()`
        );
        console.log(JSON.stringify({ firstChapter, secondChapter, result: 'PASS' }));
        app.exit(0);
    } catch (error) {
        console.error(error.stack || error.message);
        app.exit(1);
    }
});
