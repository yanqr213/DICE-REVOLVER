const { app, BrowserWindow, screen } = require('electron');
const path = require('path');

// Note: To integrate Steam Achievements later, you will install 'steamworks.js'
// const steamworks = require('steamworks.js');

let mainWindow;

function createWindow() {
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width, height } = primaryDisplay.workAreaSize;

  mainWindow = new BrowserWindow({
    width: 1280,
    height: 720,
    minWidth: 1024,
    minHeight: 576,
    icon: path.join(__dirname, '../public/icon.ico'), // Ensure you add an icon
    title: "Dice Revolver: Neon Noir",
    backgroundColor: '#020202',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
      sandbox: false // Required for some heavy WebGL or Steamworks operations often
    },
    // frame: false, // Uncomment if you want to build a custom title bar in React
    // fullscreen: true // Uncomment for production build default
  });

  // STEAMWORKS INITIALIZATION (Placeholder)
  // try {
  //   const client = steamworks.init(480); // Replace 480 with your Steam App ID
  //   console.log('Steamworks initialized:', client.localplayer.getName());
  // } catch (e) {
  //   console.log('Steamworks failed to init (expected in dev without steam running):', e);
  // }

  // Development: Load Vite Server
  // Production: Load built index.html
  const isDev = !app.isPackaged;
  
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    // mainWindow.webContents.openDevTools(); // Optional: Open DevTools
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  // Optimize visual loading
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});