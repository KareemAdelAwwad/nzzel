#!/bin/bash

#!/bin/bash

# Nzzel Setup Script
echo "🎥 Setting up Nzzel..."

# Function to detect package manager and install packages
install_package() {
    local package_name="$1"
    local brew_name="$2"
    local apt_name="$3"
    local pacman_name="$4"
    local dnf_name="$5"
    
    echo "📦 Installing $package_name..."
    
    # macOS - Homebrew
    if command -v brew &> /dev/null; then
        echo "Using Homebrew..."
        brew install "$brew_name"
        return $?
    fi
    
    # Ubuntu/Debian - apt
    if command -v apt &> /dev/null; then
        echo "Using apt..."
        sudo apt update && sudo apt install -y "$apt_name"
        return $?
    fi
    
    # Arch Linux - pacman
    if command -v pacman &> /dev/null; then
        echo "Using pacman..."
        sudo pacman -S --noconfirm "$pacman_name"
        return $?
    fi
    
    # Fedora/RHEL - dnf
    if command -v dnf &> /dev/null; then
        echo "Using dnf..."
        sudo dnf install -y "$dnf_name"
        return $?
    fi
    
    # CentOS/RHEL - yum
    if command -v yum &> /dev/null; then
        echo "Using yum..."
        sudo yum install -y "$dnf_name"
        return $?
    fi
    
    echo "❌ No supported package manager found. Please install $package_name manually."
    return 1
}

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Installing Node.js..."
    
    # Try to install Node.js
    if install_package "Node.js" "node" "nodejs" "nodejs" "nodejs npm"; then
        echo "✅ Node.js installed successfully"
    else
        echo "❌ Failed to install Node.js. Please install Node.js 18+ manually."
        exit 1
    fi
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    echo "Please update Node.js manually."
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Check yt-dlp
if ! command -v yt-dlp &> /dev/null; then
    echo "❌ yt-dlp is not installed. Installing yt-dlp..."
    
    # Try pip first (most universal)
    if command -v pip3 &> /dev/null; then
        echo "Installing yt-dlp via pip3..."
        pip3 install --user yt-dlp
    elif command -v pip &> /dev/null; then
        echo "Installing yt-dlp via pip..."
        pip install --user yt-dlp
    else
        # Try package managers
        if install_package "yt-dlp" "yt-dlp" "yt-dlp" "yt-dlp" "yt-dlp"; then
            echo "✅ yt-dlp installed successfully"
        else
            echo "❌ Failed to install yt-dlp. Please install it manually:"
            echo "   pip install yt-dlp"
            exit 1
        fi
    fi
    
    # Add user bin to PATH if needed
    if [[ ":$PATH:" != *":$HOME/.local/bin:"* ]]; then
        export PATH="$HOME/.local/bin:$PATH"
    fi
    
    # Check again
    if ! command -v yt-dlp &> /dev/null; then
        echo "❌ yt-dlp installation failed. Please install it manually and restart the terminal."
        exit 1
    fi
fi

echo "✅ yt-dlp $(yt-dlp --version) detected"

# Check ffmpeg
if ! command -v ffmpeg &> /dev/null; then
    echo "❌ ffmpeg is not installed. Installing ffmpeg..."
    
    if install_package "ffmpeg" "ffmpeg" "ffmpeg" "ffmpeg" "ffmpeg"; then
        echo "✅ ffmpeg installed successfully"
    else
        echo "❌ Failed to install ffmpeg. Please install it manually."
        exit 1
    fi
    
    # Check again
    if ! command -v ffmpeg &> /dev/null; then
        echo "❌ ffmpeg installation failed. Please install it manually and restart the terminal."
        exit 1
    fi
fi

echo "✅ ffmpeg detected"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Setup database
echo "🗄️  Setting up database..."
npm run db:generate
npm run db:migrate

# Create data directory
mkdir -p data

echo ""
echo "🎉 Setup complete!"
echo ""
echo "If any packages failed to install, please restart your terminal and run the setup script again."
echo ""
echo "To start the development server:"
echo "  npm run dev"
echo ""
echo "To build for production:"
echo "  npm run build"
echo "  npm start"
echo ""
echo "Happy downloading! 🚀"
