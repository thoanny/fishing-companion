python -m PyInstaller --onefile GW2MumbleLink.py --clean --name "GW2MumbleLink" --strip --noconsole &&
scp dist/GW2MumbleLink.exe ..
