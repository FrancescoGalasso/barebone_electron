const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');

function loadConfig() {
  const configPath = path.join(__dirname, 'config.json');
  try {
    const raw = fs.readFileSync(configPath, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Errore caricando config.json, uso valori di default:', err);
    return {
      appUrl: 'https://example.com',
      window: {
        width: 1024,
        height: 768
      }
    };
  }
}

let mainWindow;

function createWindow() {
  const config = loadConfig();

  mainWindow = new BrowserWindow({
    width: config.window?.width || 1024,
    height: config.window?.height || 768,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  const isLinux = process.platform === 'linux'

  if (isLinux) {
    const template = [
      {
        label: 'View',
        submenu: [
          { role: 'reload' },
          { role: 'toggleDevTools' },
        ],
      },
      {
        label: 'Help',
        submenu: [
          {
            label: 'Info',
            click: () => {
              console.log('Info cliccato')
            },
          },
        ],
      },
    ]

    const menu = Menu.buildFromTemplate(template)
    Menu.setApplicationMenu(menu)
  }
  // "Ascolta" l'indirizzo specificato in config: in pratica apre quella URL
  mainWindow.loadURL(config.appUrl);

  mainWindow.webContents.on('did-fail-load', () => {
    const indexPath = path.join(__dirname, 'renderer', 'index.html');
    console.error('Caricamento URL fallito, carico fallback locale:', indexPath);
    mainWindow.loadFile(indexPath);
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  // Su macOS si chiude solo se non è mac
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // Su macOS ricrea la finestra se non ce n’è
  if (mainWindow === null) {
    createWindow();
  }
});

