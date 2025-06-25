#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${GREEN}========================================"
echo -e "    Nzzel - Startup Script"
echo -e "========================================${NC}"
echo

echo -e "${BLUE}[1/4] Checking for git updates...${NC}"

# Check if we're in a git repository
if ! git status >/dev/null 2>&1; then
    echo -e "${YELLOW}[INFO] Not a git repository - skipping update check${NC}"
    CHANGES_DETECTED=0
else
    # Check if remote origin exists
    if ! git remote get-url origin >/dev/null 2>&1; then
        echo -e "${YELLOW}[INFO] No remote origin configured - skipping update check${NC}"
        CHANGES_DETECTED=0
    else
        # Fetch latest changes
        if ! git fetch origin >/dev/null 2>&1; then
            echo -e "${YELLOW}[WARNING] Failed to fetch from remote - skipping update check${NC}"
            CHANGES_DETECTED=0
        else
            # Get current branch name
            CURRENT_BRANCH=$(git branch --show-current)
            
            # Check if remote branch exists
            if ! git rev-parse origin/$CURRENT_BRANCH >/dev/null 2>&1; then
                echo -e "${YELLOW}[INFO] No remote tracking branch found - skipping update check${NC}"
                CHANGES_DETECTED=0
            else
                # Check if there are changes by comparing local and remote commits
                LOCAL_COMMIT=$(git rev-parse HEAD)
                REMOTE_COMMIT=$(git rev-parse origin/$CURRENT_BRANCH)
                
                CHANGES_DETECTED=0
                if [ "$LOCAL_COMMIT" != "$REMOTE_COMMIT" ]; then
                    CHANGES_DETECTED=1
                    echo -e "${YELLOW}[INFO] Changes detected in remote repository${NC}"
                    echo -e "${YELLOW}[INFO] Pulling latest changes...${NC}"
                    if git pull origin $CURRENT_BRANCH; then
                        echo -e "${GREEN}[SUCCESS] Successfully pulled latest changes${NC}"
                    else
                        echo -e "${RED}[ERROR] Failed to pull changes from git${NC}"
                        echo -e "${YELLOW}[WARNING] Continuing with current version...${NC}"
                        CHANGES_DETECTED=0
                    fi
                else
                    echo -e "${YELLOW}[INFO] No updates available - repository is up to date${NC}"
                fi
            fi
        fi
    fi
fi

echo
echo -e "${BLUE}[2/4] Checking build status...${NC}"

if [ -d ".next" ]; then
    if [ $CHANGES_DETECTED -eq 1 ]; then
        echo -e "${YELLOW}[INFO] Changes detected - rebuilding application...${NC}"
        echo -e "${YELLOW}[INFO] Cleaning previous build...${NC}"
        rm -rf ".next" >/dev/null 2>&1
    else
        echo -e "${YELLOW}[INFO] No changes detected - using existing build${NC}"
        # Skip to start section
        echo
        echo -e "${BLUE}[4/4] Starting application...${NC}"
        echo -e "${YELLOW}[INFO] Opening browser in 3 seconds...${NC}"
        echo -e "${YELLOW}[INFO] Server will start at http://localhost:3000${NC}"
        
        sleep 3
        
        # Try to open browser (different commands for different systems)
        if command -v xdg-open > /dev/null; then
            xdg-open "http://localhost:3000" >/dev/null 2>&1 &
        elif command -v open > /dev/null; then
            open "http://localhost:3000" >/dev/null 2>&1 &
        elif command -v sensible-browser > /dev/null; then
            sensible-browser "http://localhost:3000" >/dev/null 2>&1 &
        fi
        
        echo -e "${YELLOW}[INFO] Starting development server...${NC}"
        echo -e "${YELLOW}[INFO] Press Ctrl+C to stop the server${NC}"
        echo
        npm run dev
        exit 0
    fi
else
    echo -e "${YELLOW}[INFO] No previous build found${NC}"
fi

echo -e "${BLUE}[3/4] Building application...${NC}"
npm run build

if [ $? -eq 0 ]; then
    echo -e "${GREEN}[SUCCESS] Build completed successfully${NC}"
else
    echo -e "${RED}[ERROR] Build failed${NC}"
    echo -e "${RED}[ERROR] Please check the output above for details${NC}"
    read -p "Press any key to continue..."
    exit 1
fi

echo
echo -e "${BLUE}[4/4] Starting application...${NC}"
echo -e "${YELLOW}[INFO] Opening browser in 3 seconds...${NC}"
echo -e "${YELLOW}[INFO] Server will start at http://localhost:3000${NC}"

sleep 3

# Try to open browser (different commands for different systems)
if command -v xdg-open > /dev/null; then
    xdg-open "http://localhost:3000" >/dev/null 2>&1 &
elif command -v open > /dev/null; then
    open "http://localhost:3000" >/dev/null 2>&1 &
elif command -v sensible-browser > /dev/null; then
    sensible-browser "http://localhost:3000" >/dev/null 2>&1 &
fi

echo -e "${YELLOW}[INFO] Starting development server...${NC}"
echo -e "${YELLOW}[INFO] Press Ctrl+C to stop the server${NC}"
echo
npm run dev
