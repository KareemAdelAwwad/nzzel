@echo off
echo Setting up Nzzel...

REM Function to check if winget is available
:check_winget
winget --version >nul 2>&1
if %errorlevel% equ 0 (
    set "PACKAGE_MANAGER=winget"
    goto :check_chocolatey_done
)

REM Function to check if chocolatey is available, install if not
:check_chocolatey
choco --version >nul 2>&1
if %errorlevel% equ 0 (
    set "PACKAGE_MANAGER=choco"
    goto :check_chocolatey_done
)

echo Neither winget nor chocolatey found. Installing chocolatey...
powershell -Command "Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))"
if %errorlevel% neq 0 (
    echo Failed to install chocolatey. Please install it manually or install packages manually.
    pause
    exit /b 1
)
set "PACKAGE_MANAGER=choco"

:check_chocolatey_done

REM Function to install package
:install_package
set "package_name=%~1"
set "winget_id=%~2"
set "choco_id=%~3"

if "%PACKAGE_MANAGER%"=="winget" (
    echo Installing %package_name% using winget...
    winget install %winget_id% --silent --accept-package-agreements --accept-source-agreements
) else (
    echo Installing %package_name% using chocolatey...
    choco install %choco_id% -y
)
goto :eof

REM Check Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Node.js is not installed. Installing Node.js...
    call :install_package "Node.js" "OpenJS.NodeJS" "nodejs"
    
    REM Refresh environment variables
    call refreshenv >nul 2>&1
    
    REM Check again
    node --version >nul 2>&1
    if %errorlevel% neq 0 (
        echo Failed to install Node.js. Please restart your terminal and run setup again.
        pause
        exit /b 1
    )
)

echo Node.js detected

REM Check yt-dlp
yt-dlp --version >nul 2>&1
if %errorlevel% neq 0 (
    echo yt-dlp is not installed. Installing yt-dlp...
    call :install_package "yt-dlp" "yt-dlp.yt-dlp" "yt-dlp"
    
    REM Refresh environment variables
    call refreshenv >nul 2>&1
    
    REM Check again
    yt-dlp --version >nul 2>&1
    if %errorlevel% neq 0 (
        echo Failed to install yt-dlp. Please restart your terminal and run setup again.
        pause
        exit /b 1
    )
)

echo yt-dlp detected

REM Check ffmpeg
ffmpeg -version >nul 2>&1
if %errorlevel% neq 0 (
    echo ffmpeg is not installed. Installing ffmpeg...
    call :install_package "ffmpeg" "Gyan.FFmpeg" "ffmpeg"
    
    REM Refresh environment variables
    call refreshenv >nul 2>&1
    
    REM Check again
    ffmpeg -version >nul 2>&1
    if %errorlevel% neq 0 (
        echo Failed to install ffmpeg. Please restart your terminal and run setup again.
        pause
        exit /b 1
    )
)

echo ffmpeg detected

REM Install dependencies
echo Installing dependencies...
call npm install

REM Setup database
echo Setting up database...
call npm run db:generate
call npm run db:migrate

REM Create data directory
if not exist "data" mkdir data

echo.
echo Setup complete!
echo.
echo If any packages failed to install, please restart your terminal and run setup.bat again.
echo.
echo To start the development server:
echo   npm run dev
echo.
echo To build for production:
echo   npm run build
echo   npm start
echo.
echo Happy downloading! 🚀
echo To start the development server:
echo   npm run dev
echo.
echo To build for production:
echo   npm run build
echo   npm start
echo.
echo Happy downloading!
pause
