#!/bin/bash
FILE="fishing-companion.zip"
npx electron-packager . --prune=true --ignore=\.gitignore --ignore=build.sh --ignore=rebuild.sh --ignore=LICENSE.md --ignore=.github --ignore=.idea --ignore=src/img --ignore=src/js --ignore=src/sass --ignore=GW2Link.exe --ignore=webpack.config.js --ignore=yarn-error.log --ignore=daily.txt --ignore=src/script.min.js.LICENSE.txt --asar --icon=src/icon.ico
scp GW2MumbleLink.exe fishing-companion-win32-x64 &&
cd fishing-companion-win32-x64 &&
7z a -r $FILE
