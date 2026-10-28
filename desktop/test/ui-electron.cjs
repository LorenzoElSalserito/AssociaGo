const { app, BrowserWindow, ipcMain } = require('electron');
ipcMain.handle('ui:set-zoom', (event, percent) => event.sender.setZoomFactor(percent / 100));
const path = require('node:path');
app.disableHardwareAcceleration();
app.setPath('userData', process.env.ASSOCIAGO_E2E_USER_DATA);
app.whenReady().then(async () => {
  const window = new BrowserWindow({ width: 1440, height: 1000, show: true, webPreferences: { preload: path.join(__dirname, 'ui-preload.cjs'), contextIsolation: true } });
  window.webContents.session.on('will-download', (_event, item) => {
    const destination=path.join(process.env.ASSOCIAGO_E2E_USER_DATA,item.getFilename());
    item.setSavePath(destination);
    item.once('done', (_event,state) => {globalThis.lastDownload={destination,state};});
  });
  window.webContents.setWindowOpenHandler(({ url }) => {
    globalThis.lastExternalUrl = url;
    return { action: 'deny' };
  });
  await window.loadFile(path.join(__dirname, '../out/renderer/index.html'));
});
app.on('window-all-closed', () => app.quit());
