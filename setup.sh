#!/bin/bash

# Nzzel Setup Script
echo "🎥 Setting up Nzzel..."

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Check yt-dlp
if ! command -v yt-dlp &> /dev/null; then
    echo "❌ yt-dlp is not installed. Please install yt-dlp first."
    echo "   Windows: winget install yt-dlp.yt-dlp"
    echo "   macOS:   brew install yt-dlp"
    echo "   Linux:   pip install yt-dlp"
    exit 1
fi

echo "✅ yt-dlp $(yt-dlp --version) detected"

# Check ffmpeg
if ! command -v ffmpeg &> /dev/null; then
    echo "❌ ffmpeg is not installed. Please install ffmpeg first."
    echo "   Windows: winget install Gyan.FFmpeg"
    echo "   macOS:   brew install ffmpeg"
    echo "   Linux:   sudo apt install ffmpeg"
    exit 1
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
echo "To start the development server:"
echo "  npm run dev"
echo ""
echo "To build for production:"
echo "  npm run build"
echo "  npm start"
echo ""
echo "Happy downloading! 🚀"
