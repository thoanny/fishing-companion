const { app, BrowserWindow } = require('electron');
const path = require('path');

app.disableHardwareAcceleration();

if (require('electron-squirrel-startup')) {
  app.quit();
}

const createWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 330,
    height: 450,
    transparent:true,
    frame: false,
    resizable: false,
  });

  mainWindow.setAlwaysOnTop(true, 'screen');
  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  // mainWindow.webContents.openDevTools();
};

app.on('ready', createWindow);

let GW2Link = require('child_process').spawn('GW2Link.exe');

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    process.kill(GW2Link.pid, 'SIGINT');
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
