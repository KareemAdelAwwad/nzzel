@echo off
color 0A
echo ========================================
echo    Nzzel - Update Tools
echo ========================================
echo.

REM Detect package manager
set "PACKAGE_MANAGER="

winget --version >nul 2>&1
if %errorlevel% equ 0 (
    set "PACKAGE_MANAGER=winget"
    goto :pm_found
)

choco --version >nul 2>&1
if %errorlevel% equ 0 (
    set "PACKAGE_MANAGER=choco"
    goto :pm_found
)

echo [WARNING] Neither winget nor chocolatey found
echo [WARNING] yt-dlp and ffmpeg will need to be updated manually
set "PACKAGE_MANAGER=none"

:pm_found
if not "%PACKAGE_MANAGER%"=="none" (
    echo [INFO] Using %PACKAGE_MANAGER% as package manager
)
echo.

REM ---- Update yt-dlp ----
echo [1/3] Updating yt-dlp...

yt-dlp --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [WARNING] yt-dlp is not installed - skipping update
    echo [WARNING] Run setup.bat first to install yt-dlp
    goto :update_ffmpeg
)

for /f "tokens=*" %%i in ('yt-dlp --version') do set YT_DLP_OLD=%%i
echo [INFO] Current yt-dlp version: %YT_DLP_OLD%

REM Try yt-dlp's built-in self-update first
echo [INFO] Attempting yt-dlp self-update...
yt-dlp --update >nul 2>&1
if %errorlevel% equ 0 (
    for /f "tokens=*" %%i in ('yt-dlp --version') do set YT_DLP_NEW=%%i
    if not "%YT_DLP_OLD%"=="!YT_DLP_NEW!" (
        echo [SUCCESS] yt-dlp updated to !YT_DLP_NEW!
    ) else (
        echo [INFO] yt-dlp is already up to date (%YT_DLP_OLD%^)
    )
    goto :update_ffmpeg
)

REM Fall back to package manager
if "%PACKAGE_MANAGER%"=="winget" (
    echo [INFO] Updating yt-dlp via winget...
    winget upgrade yt-dlp.yt-dlp --silent --accept-package-agreements --accept-source-agreements >nul 2>&1
) else if "%PACKAGE_MANAGER%"=="choco" (
    echo [INFO] Updating yt-dlp via chocolatey...
    choco upgrade yt-dlp -y >nul 2>&1
) else (
    echo [WARNING] Could not update yt-dlp automatically
    echo [INFO] Update manually: https://github.com/yt-dlp/yt-dlp/releases
)

for /f "tokens=*" %%i in ('yt-dlp --version') do set YT_DLP_NEW=%%i
if not "%YT_DLP_OLD%"=="%YT_DLP_NEW%" (
    echo [SUCCESS] yt-dlp updated: %YT_DLP_OLD% -^> %YT_DLP_NEW%
) else (
    echo [INFO] yt-dlp is already up to date (%YT_DLP_OLD%^)
)

:update_ffmpeg
echo.

REM ---- Update ffmpeg ----
echo [2/3] Updating ffmpeg...

ffmpeg -version >nul 2>&1
if %errorlevel% neq 0 (
    echo [WARNING] ffmpeg is not installed - skipping update
    echo [WARNING] Run setup.bat first to install ffmpeg
    goto :update_npm
)

for /f "tokens=3" %%i in ('ffmpeg -version 2^>^&1 ^| findstr /i "ffmpeg version"') do set FFMPEG_OLD=%%i
echo [INFO] Current ffmpeg version: %FFMPEG_OLD%

if "%PACKAGE_MANAGER%"=="winget" (
    echo [INFO] Updating ffmpeg via winget...
    winget upgrade Gyan.FFmpeg --silent --accept-package-agreements --accept-source-agreements >nul 2>&1
) else if "%PACKAGE_MANAGER%"=="choco" (
    echo [INFO] Updating ffmpeg via chocolatey...
    choco upgrade ffmpeg -y >nul 2>&1
) else (
    echo [WARNING] Could not update ffmpeg automatically
    echo [INFO] Update manually: https://ffmpeg.org/download.html
    goto :update_npm
)

for /f "tokens=3" %%i in ('ffmpeg -version 2^>^&1 ^| findstr /i "ffmpeg version"') do set FFMPEG_NEW=%%i
if not "%FFMPEG_OLD%"=="%FFMPEG_NEW%" (
    echo [SUCCESS] ffmpeg updated: %FFMPEG_OLD% -^> %FFMPEG_NEW%
) else (
    echo [INFO] ffmpeg is already up to date (%FFMPEG_OLD%^)
)

:update_npm
echo.

REM ---- Update npm packages ----
echo [3/3] Updating npm packages...
call npm update
if %errorlevel% neq 0 (
    echo [WARNING] npm update encountered issues
) else (
    echo [SUCCESS] npm packages updated
)

echo.
echo ========================================
echo    All tools updated!
echo ========================================
echo.
pause
