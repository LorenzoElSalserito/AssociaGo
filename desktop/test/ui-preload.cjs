const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('api', {
  setZoom: percent => ipcRenderer.invoke('ui:set-zoom', percent),
  getBackendInfo: async () => ({ apiBaseUrl: process.env.ASSOCIAGO_E2E_API }),
  getAppVersion: async () => '0.1.6-e2e'
});
