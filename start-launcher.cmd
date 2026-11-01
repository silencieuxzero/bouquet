@echo off
setlocal
rem Start the blog launcher for this machine. Double-click friendly.
rem Code lives next to this script; the repository it edits defaults to a sibling
rem 'fuwari' checkout. Override with the first argument or LAUNCHER_ROOT.

set "CODE_DIR=%~dp0"
if "%CODE_DIR:~-1%"=="\" set "CODE_DIR=%CODE_DIR:~0,-1%"

set "TARGET=%LAUNCHER_ROOT%"
if "%TARGET%"=="" if not "%~1"=="" set "TARGET=%~1"
if "%TARGET%"=="" for %%I in ("%CODE_DIR%\..\fuwari") do if exist "%%~fI\package.json" set "TARGET=%%~fI"
if "%TARGET%"=="" set "TARGET=%CODE_DIR%"

if not exist "%TARGET%\package.json" (
  echo [start-launcher] target repository not found: "%TARGET%"
  echo usage: start-launcher.cmd [path-to-checkout]
  pause
  exit /b 1
)

echo [start-launcher] code:   %CODE_DIR%
echo [start-launcher] target: %TARGET%

set "LAUNCHER_ROOT=%TARGET%"
node "%CODE_DIR%\launcher\server.mjs"
if errorlevel 1 pause
