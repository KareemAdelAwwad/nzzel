@echo off
color 0A
echo Checking for .next folder...

if exist ".next" (
    echo Found .next folder, running npm run start...
    echo Opening browser in 1 seconds...
    timeout /t 1 /nobreak >nul
    start "" "http://localhost:3000"
    npm run start
) else (
    echo No .next folder found, building first...
    npm run build

    if %ERRORLEVEL% equ 0 (
        echo Build successful, starting server...
        echo Opening browser in 1 seconds...
        timeout /t 1 /nobreak >nul
        start "" "http://localhost:3000"
        npm run start
    ) else (
        echo Build failed, exiting...
        exit /b 1
    )
)
