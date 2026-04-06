@echo off
echo.
echo  ======================================
echo   Medical Reference Tool - Local Server
echo  ======================================
echo.
echo  PC IP Address (for smartphone access):
echo.
ipconfig | findstr /C:"IPv4"
echo.
echo  Open on smartphone: http://[IP above]:8080
echo  (PC and smartphone must be on the same WiFi)
echo.
echo  Press Ctrl+C to stop the server.
echo.
cd /d "%~dp0"
py -m http.server 8080
pause
