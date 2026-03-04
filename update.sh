#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${GREEN}========================================"
echo -e "    Nzzel - Update Tools"
echo -e "========================================${NC}"
echo

# Detect package manager
detect_pm() {
    if command -v brew &> /dev/null; then
        echo "brew"
    elif command -v apt &> /dev/null; then
        echo "apt"
    elif command -v pacman &> /dev/null; then
        echo "pacman"
    elif command -v dnf &> /dev/null; then
        echo "dnf"
    elif command -v yum &> /dev/null; then
        echo "yum"
    else
        echo "none"
    fi
}

PM=$(detect_pm)
if [ "$PM" != "none" ]; then
    echo -e "${YELLOW}[INFO] Using $PM as package manager${NC}"
else
    echo -e "${YELLOW}[WARNING] No supported package manager found${NC}"
    echo -e "${YELLOW}[WARNING] yt-dlp and ffmpeg will need to be updated manually${NC}"
fi
echo

# ---- Update yt-dlp ----
echo -e "${BLUE}[1/3] Updating yt-dlp...${NC}"

if ! command -v yt-dlp &> /dev/null; then
    echo -e "${YELLOW}[WARNING] yt-dlp is not installed - skipping update${NC}"
    echo -e "${YELLOW}[WARNING] Run setup.sh first to install yt-dlp${NC}"
else
    YT_DLP_OLD=$(yt-dlp --version)
    echo -e "${YELLOW}[INFO] Current yt-dlp version: $YT_DLP_OLD${NC}"

    # Try yt-dlp's built-in self-update first
    echo -e "${YELLOW}[INFO] Attempting yt-dlp self-update...${NC}"
    if yt-dlp --update >/dev/null 2>&1; then
        YT_DLP_NEW=$(yt-dlp --version)
        if [ "$YT_DLP_OLD" != "$YT_DLP_NEW" ]; then
            echo -e "${GREEN}[SUCCESS] yt-dlp updated: $YT_DLP_OLD -> $YT_DLP_NEW${NC}"
        else
            echo -e "${YELLOW}[INFO] yt-dlp is already up to date ($YT_DLP_OLD)${NC}"
        fi
    else
        # Fall back to pip or package manager
        UPDATED=false
        if command -v pip3 &> /dev/null; then
            echo -e "${YELLOW}[INFO] Updating yt-dlp via pip3...${NC}"
            pip3 install --user --upgrade yt-dlp >/dev/null 2>&1 && UPDATED=true
        elif command -v pip &> /dev/null; then
            echo -e "${YELLOW}[INFO] Updating yt-dlp via pip...${NC}"
            pip install --user --upgrade yt-dlp >/dev/null 2>&1 && UPDATED=true
        fi

        if [ "$UPDATED" = false ]; then
            case "$PM" in
                brew)   brew upgrade yt-dlp >/dev/null 2>&1 && UPDATED=true ;;
                apt)    sudo apt update >/dev/null 2>&1 && sudo apt install --only-upgrade -y yt-dlp >/dev/null 2>&1 && UPDATED=true ;;
                pacman) sudo pacman -Syu --noconfirm yt-dlp >/dev/null 2>&1 && UPDATED=true ;;
                dnf)    sudo dnf upgrade -y yt-dlp >/dev/null 2>&1 && UPDATED=true ;;
                yum)    sudo yum update -y yt-dlp >/dev/null 2>&1 && UPDATED=true ;;
                *)      echo -e "${YELLOW}[WARNING] Could not update yt-dlp automatically${NC}"
                        echo -e "${YELLOW}[INFO] Update manually: https://github.com/yt-dlp/yt-dlp/releases${NC}" ;;
            esac
        fi

        YT_DLP_NEW=$(yt-dlp --version)
        if [ "$YT_DLP_OLD" != "$YT_DLP_NEW" ]; then
            echo -e "${GREEN}[SUCCESS] yt-dlp updated: $YT_DLP_OLD -> $YT_DLP_NEW${NC}"
        else
            echo -e "${YELLOW}[INFO] yt-dlp is already up to date ($YT_DLP_OLD)${NC}"
        fi
    fi
fi

echo

# ---- Update ffmpeg ----
echo -e "${BLUE}[2/3] Updating ffmpeg...${NC}"

if ! command -v ffmpeg &> /dev/null; then
    echo -e "${YELLOW}[WARNING] ffmpeg is not installed - skipping update${NC}"
    echo -e "${YELLOW}[WARNING] Run setup.sh first to install ffmpeg${NC}"
else
    FFMPEG_OLD=$(ffmpeg -version 2>&1 | head -1 | awk '{print $3}')
    echo -e "${YELLOW}[INFO] Current ffmpeg version: $FFMPEG_OLD${NC}"

    case "$PM" in
        brew)   echo -e "${YELLOW}[INFO] Updating ffmpeg via brew...${NC}"
                brew upgrade ffmpeg >/dev/null 2>&1 ;;
        apt)    echo -e "${YELLOW}[INFO] Updating ffmpeg via apt...${NC}"
                sudo apt update >/dev/null 2>&1 && sudo apt install --only-upgrade -y ffmpeg >/dev/null 2>&1 ;;
        pacman) echo -e "${YELLOW}[INFO] Updating ffmpeg via pacman...${NC}"
                sudo pacman -Syu --noconfirm ffmpeg >/dev/null 2>&1 ;;
        dnf)    echo -e "${YELLOW}[INFO] Updating ffmpeg via dnf...${NC}"
                sudo dnf upgrade -y ffmpeg >/dev/null 2>&1 ;;
        yum)    echo -e "${YELLOW}[INFO] Updating ffmpeg via yum...${NC}"
                sudo yum update -y ffmpeg >/dev/null 2>&1 ;;
        *)      echo -e "${YELLOW}[WARNING] Could not update ffmpeg automatically${NC}"
                echo -e "${YELLOW}[INFO] Update manually: https://ffmpeg.org/download.html${NC}" ;;
    esac

    FFMPEG_NEW=$(ffmpeg -version 2>&1 | head -1 | awk '{print $3}')
    if [ "$FFMPEG_OLD" != "$FFMPEG_NEW" ]; then
        echo -e "${GREEN}[SUCCESS] ffmpeg updated: $FFMPEG_OLD -> $FFMPEG_NEW${NC}"
    else
        echo -e "${YELLOW}[INFO] ffmpeg is already up to date ($FFMPEG_OLD)${NC}"
    fi
fi

echo

# ---- Update npm packages ----
echo -e "${BLUE}[3/3] Updating npm packages...${NC}"
if npm update; then
    echo -e "${GREEN}[SUCCESS] npm packages updated${NC}"
else
    echo -e "${YELLOW}[WARNING] npm update encountered issues${NC}"
fi

echo
echo -e "${GREEN}========================================"
echo -e "    All tools updated! 🚀"
echo -e "========================================${NC}"
echo
