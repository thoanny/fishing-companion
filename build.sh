#!/bin/bash
NOW=$(date +"%Y%m%d%H%M")
FILE="$NOW-Fishing-Companion.zip"
npx electron-packager . --prune=true --ignore=\.gitignore --ignore=build.sh --ignore=rebuild.sh --ignore=LICENSE.md --ignore=.github --ignore=.idea --ignore=src/img --ignore=src/js --ignore=src/sass --ignore=GW2Link.exe --ignore=webpack.config.js --ignore=yarn-error.log --icon=src/icon.ico --asar &&
scp GW2Link.exe fishing-companion-win32-x64 &&
cd fishing-companion-win32-x64 &&
7z a -r $FILE
