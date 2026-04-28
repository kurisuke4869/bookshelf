@echo off
cd /d "%~dp0"
npm run build
start "" "http://localhost:4173"
npx vite preview --host
