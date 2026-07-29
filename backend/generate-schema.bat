@echo off
echo ========================================================
echo SchemaSpy Database Documentation Generator
echo ========================================================
echo.
echo Make sure Docker Desktop is currently running on your machine!
echo.
powershell.exe -ExecutionPolicy Bypass -File "%~dp0generate-schema.ps1"
echo.
pause
