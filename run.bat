@echo off
color 0A
echo ========================================
echo    Nazzel - Startup Script
echo ========================================
echo.

echo [1/4] Checking for git updates...

rem Check if we're in a git repository
git status >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [INFO] Not a git repository - skipping update check
    set CHANGES_DETECTED=0
    goto BUILD_CHECK
)

rem Check if remote origin exists
git remote get-url origin >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [INFO] No remote origin configured - skipping update check
    set CHANGES_DETECTED=0
    goto BUILD_CHECK
)

rem Fetch latest changes
git fetch origin >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [WARNING] Failed to fetch from remote - skipping update check
    set CHANGES_DETECTED=0
    goto BUILD_CHECK
)

rem Get current branch name
for /f "tokens=*" %%i in ('git branch --show-current') do set CURRENT_BRANCH=%%i

rem Check if remote branch exists
git rev-parse origin/%CURRENT_BRANCH% >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [INFO] No remote tracking branch found - skipping update check
    set CHANGES_DETECTED=0
    goto BUILD_CHECK
)

rem Check if there are changes by comparing local and remote commits
for /f %%i in ('git rev-parse HEAD') do set LOCAL_COMMIT=%%i
for /f %%i in ('git rev-parse origin/%CURRENT_BRANCH%') do set REMOTE_COMMIT=%%i

set CHANGES_DETECTED=0
if not "%LOCAL_COMMIT%"=="%REMOTE_COMMIT%" (
    set CHANGES_DETECTED=1
    echo [INFO] Changes detected in remote repository
    echo [INFO] Pulling latest changes...
    git pull origin %CURRENT_BRANCH%
    if %ERRORLEVEL% neq 0 (
        echo [ERROR] Failed to pull changes from git
        echo [WARNING] Continuing with current version...
        set CHANGES_DETECTED=0
    ) else (
        echo [SUCCESS] Successfully pulled latest changes
    )
) else (
    echo [INFO] No updates available - repository is up to date
)

:BUILD_CHECK

echo.
echo [2/4] Checking build status...

if exist ".next" (
    if %CHANGES_DETECTED%==1 (
        echo [INFO] Changes detected - rebuilding application...
        echo [INFO] Cleaning previous build...
        rmdir /s /q ".next" >nul 2>&1
        goto BUILD
    ) else (
        echo [INFO] No changes detected - using existing build
        goto START
    )
) else (
    echo [INFO] No previous build found
    goto BUILD
)

:BUILD
echo [3/4] Building application...
npm run build

if %ERRORLEVEL% equ 0 (
    echo [SUCCESS] Build completed successfully
    goto START
) else (
    echo [ERROR] Build failed
    echo [ERROR] Please check the output above for details
    pause
    exit /b 1
)

:START
echo [4/4] Starting application...
echo [INFO] Opening browser in 1 seconds...
echo [INFO] Server will start at http://localhost:3000

timeout /t 1 /nobreak >nul
start "" "http://localhost:3000"

echo [INFO] Starting development server...
echo [INFO] Press Ctrl+C to stop the server
echo.
npm run start
