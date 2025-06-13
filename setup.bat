@echo off
echo 🎥 Setting up YouTube Downloader...

REM Check Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js 18+ first.
    pause
    exit /b 1
)

echo ✅ Node.js detected

REM Check yt-dlp
yt-dlp --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ yt-dlp is not installed. Please install yt-dlp first.
    echo    Windows: winget install yt-dlp.yt-dlp
    pause
    exit /b 1
)

echo ✅ yt-dlp detected

REM Check ffmpeg
ffmpeg -version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ ffmpeg is not installed. Please install ffmpeg first.
    echo    Windows: winget install Gyan.FFmpeg
    pause
    exit /b 1
)

echo ✅ ffmpeg detected

REM Install dependencies
echo 📦 Installing dependencies...
call npm install

REM Setup database
echo 🗄️ Setting up database...
call npm run db:generate
call npm run db:migrate

REM Create data directory
if not exist "data" mkdir data

echo.
echo 🎉 Setup complete!
echo.
echo To start the development server:
echo   npm run dev
echo.
echo To build for production:
echo   npm run build
echo   npm start
echo.
echo Happy downloading! 🚀
pause
