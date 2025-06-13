@echo off
color 0A
echo Checking for .next folder...

if exist ".next" (
    echo Found .next folder, running npm run start...
    npm run start
) else (
    echo No .next folder found, building first...
    npm run build

    if %ERRORLEVEL% equ 0 (
        echo Build successful, starting server...
        npm run start
    ) else (
        echo Build failed, exiting...
        exit /b 1
    )
)
