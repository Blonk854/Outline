const { app, BrowserWindow, net, protocol } = require('electron');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

protocol.registerSchemesAsPrivileged([
  { scheme: 'outline', privileges: { standard: true, secure: true, supportFetchAPI: true } },
]);

function createWindow() {
  const window = new BrowserWindow({
    width: 1160,
    height: 800,
    minWidth: 600,
    minHeight: 560,
    backgroundColor: '#f4f5ed',
    title: 'Outline | BigSoy Studios',
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
    },
  });

  window.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
  window.webContents.on('will-navigate', (event, url) => {
    if (!url.startsWith('outline://app/')) event.preventDefault();
  });
  window.loadURL('outline://app/index.html');
}

app.whenReady().then(() => {
  const dist = path.resolve(__dirname, '../dist');
  protocol.handle('outline', (request) => {
    const url = new URL(request.url);
    const relative = decodeURIComponent(url.pathname).slice(1);
    if (url.host !== 'app' || !/^(index\.html|assets\/[\w.-]+)$/.test(relative)) {
      return new Response('Not found', { status: 404 });
    }
    return net.fetch(pathToFileURL(path.join(dist, relative)).toString());
  });

  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});