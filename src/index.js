const { app, BrowserWindow } = require('electron');
const path = require('path');

const find = require('find-process');

app.disableHardwareAcceleration();

if (require('electron-squirrel-startup')) {
  app.quit();
}

const createWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 335,
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

let GW2Link = require('child_process').spawn('GW2MumbleLink.exe');

app.on('window-all-closed', () => {

  find('name', 'GW2MumbleLink.exe')
    .then(function (list) {
      list.forEach(function (p) {
        process.kill(p.pid);
      })
    }).then(function() {
    app.quit();
  });

});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
