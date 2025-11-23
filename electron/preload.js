const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Example: Allow the game to ask for app version
  getAppVersion: () => process.env.npm_package_version,
  
  // Example: If you implement Steam Achievements
  unlockAchievement: (id) => ipcRenderer.send('unlock-achievement', id),
  
  // Example: Quit Game
  quitGame: () => ipcRenderer.send('quit-game')
});