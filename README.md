# Nazzel

A modern, full-stack Nazzel built with Next.js 15, featuring real-time progress tracking and a beautiful UI.

## 🚀 Features

- **Video & Playlist Support**: Download individual videos or entire playlists
- **Multiple Formats**: Support for MP4 (video) and MP3 (audio) formats
- **Quality Selection**: Choose from 144p to 4K quality options
- **Real-time Progress**: Live download progress with speed and ETA tracking
- **Download Management**: Pause, cancel, and restart downloads
- **History Tracking**: Complete download history with search and filtering
- **Beautiful UI**: Modern, responsive design with dark/light theme support
- **Offline Ready**: Fully local application, no external dependencies
- **Smart Queue**: Efficient download queue management

## 🛠️ Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript for type safety
- **Styling**: Tailwind CSS 4 with shadcn/ui components
- **Typography**: Manrope font family from Google Fonts
- **Database**: Drizzle ORM with SQLite for local storage
- **Real-time**: Socket.IO for live progress updates
- **Downloader**: yt-dlp integration with ffmpeg processing
- **State Management**: React Server Components and Client Components

## 📋 Prerequisites

Before running this application, ensure you have:

- **Node.js** (v18 or higher)
- **npm** or **yarn** package manager
- **yt-dlp** (Nazzel)
- **ffmpeg** (for video processing)

### Installing Dependencies

#### Windows

```powershell
# Install yt-dlp
pip install yt-dlp

# Install ffmpeg (using Chocolatey)
choco install ffmpeg

# Or download from https://ffmpeg.org/download.html
```

#### macOS

```bash
# Install yt-dlp
pip install yt-dlp

# Install ffmpeg (using Homebrew)
brew install ffmpeg
```

#### Linux (Ubuntu/Debian)

```bash
# Install yt-dlp
pip install yt-dlp

# Install ffmpeg
sudo apt update
sudo apt install ffmpeg
```

## 🚀 Getting Started

1. **Clone the repository**

   ```bash
   git clone https://github.com/KareemAdelAwwad/youtube-downloader.git
   cd youtube-downloader
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env.local
   ```

4. **Initialize the database**

   ```bash
   npm run db:generate
   npm run db:migrate
   ```

5. **Start the development server**

   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
youtube-downloader/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── api/               # API routes
│   │   ├── downloads/         # Downloads management page
│   │   ├── history/           # Download history page
│   │   └── options/           # Video/playlist options pages
│   ├── components/            # React components
│   │   ├── ui/               # shadcn/ui components
│   │   └── ...               # Custom components
│   └── lib/                   # Utilities and services
│       ├── db/               # Database schema and connection
│       ├── services/         # Business logic services
│       └── types/            # TypeScript type definitions
├── data/                      # SQLite database storage
├── drizzle/                   # Database migrations
└── public/                    # Static assets
```

- 🎥 **Video & Playlist Downloads** - Download individual videos or entire playlists
- 🎵 **Audio Extraction** - Extract audio-only tracks as MP3
- 📊 **Real-time Progress** - Live download progress with speed and ETA
- 🎨 **Modern UI** - Beautiful, responsive interface with dark/light themes
- 📱 **Multiple Formats** - Support for various video qualities and formats
- 📂 **Download History** - Complete history with search and filtering
- 🔄 **Re-download Support** - Easily re-download previous videos
- 💾 **Local Storage** - All data stored locally with SQLite

## Tech Stack

- **Frontend**: Next.js 15, React Server Components, TypeScript
- **Styling**: Tailwind CSS 4, shadcn/ui components
- **Database**: SQLite with Drizzle ORM
- **Real-time**: Socket.IO for progress updates
- **Download Engine**: yt-dlp + ffmpeg integration
- **Theme**: Dark/Light mode with next-themes

## Prerequisites

Before running this application, ensure you have the following installed:

1. **Node.js** (v18 or higher)
2. **yt-dlp** - Nazzel

   ```bash
   # Windows (using winget)
   winget install yt-dlp.yt-dlp

   # macOS (using Homebrew)
   brew install yt-dlp

   # Linux (using pip)
   pip install yt-dlp
   ```

3. **ffmpeg** - Video processing

   ```bash
   # Windows (using winget)
   winget install Gyan.FFmpeg

   # macOS (using Homebrew)
   brew install ffmpeg

   # Linux (apt)
   sudo apt install ffmpeg
   ```

## Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd youtube-downloader
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up the database**

   ```bash
   npm run db:generate
   npm run db:migrate
   ```

4. **Start the development server**

   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Usage

### Basic Download

1. Enter a YouTube video or playlist URL
2. Choose your preferred quality and format
3. Select download location (optional)
4. Click "Start Download"
5. Monitor progress in real-time

### Audio Extraction

1. Enter a YouTube video URL
2. Toggle "Audio Only" option
3. Downloads will be saved as MP3 files

### Playlist Downloads

1. Enter a YouTube playlist URL
2. Select which videos to download
3. Choose bulk download settings
4. Monitor individual progress for each video

## Project Structure

```
youtube-downloader/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── api/               # API routes
│   │   ├── downloads/         # Downloads page
│   │   ├── history/           # History page
│   │   └── options/           # Video/playlist options
│   ├── components/            # React components
│   │   ├── ui/               # shadcn/ui components
│   │   └── ...               # Custom components
│   └── lib/                   # Utilities and services
│       ├── db/               # Database schema and connection
│       └── services/         # yt-dlp and WebSocket services
├── drizzle/                   # Database migrations
├── public/                    # Static assets
└── data/                      # SQLite database storage
```

## API Endpoints

- `POST /api/extract` - Extract video/playlist information
- `POST /api/download` - Start a download

## 📖 Usage Guide

### 🎥 Video Downloads

1. **Enter URL**: Paste a YouTube video URL in the input field
2. **Select Quality**: Choose from available quality options (144p to 4K)
3. **Choose Format**: Select MP4 for video or MP3 for audio-only
4. **Start Download**: Click the download button and monitor progress

### 📋 Playlist Downloads

1. **Enter Playlist URL**: Paste a YouTube playlist URL
2. **Select Videos**: Choose which videos to download from the playlist
3. **Bulk Settings**: Apply the same quality/format settings to all selected videos
4. **Monitor Progress**: Track individual progress for each video

### 📊 Download Management

- **Real-time Progress**: See download speed, progress percentage, and ETA
- **Pause/Resume**: Control your downloads (pause/resume functionality)
- **Cancel Downloads**: Stop downloads at any time
- **Download Queue**: Manage multiple simultaneous downloads

### 📚 History & Re-downloads

- **Complete History**: View all your previous downloads
- **Search & Filter**: Find specific downloads quickly
- **One-click Re-download**: Easily re-download any previous video
- **Storage Management**: Clear history or remove specific entries

## 🔧 Available Scripts

| Command               | Description                              |
| --------------------- | ---------------------------------------- |
| `npm run dev`         | Start development server with hot reload |
| `npm run build`       | Build optimized production version       |
| `npm run start`       | Start production server                  |
| `npm run lint`        | Run ESLint code quality checks           |
| `npm run db:generate` | Generate new database migrations         |
| `npm run db:migrate`  | Apply pending database migrations        |
| `npm run db:studio`   | Open Drizzle Studio (database GUI)       |

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file in the root directory:

```env
NODE_ENV=development
DATABASE_URL=file:./data/youtube-downloader.db
```

### Custom Download Directory

By default, downloads are saved to your system's Downloads folder. You can customize this in the application settings.

## 🏗️ Architecture

### Backend Services

- **YT-DLP Service**: Handles video extraction and downloading
- **WebSocket Service**: Provides real-time progress updates
- **Database Service**: Manages download history and metadata

### Frontend Components

- **Server Components**: For static content and SEO optimization
- **Client Components**: For interactive features and real-time updates
- **API Routes**: RESTful endpoints for backend communication

## 🐛 Troubleshooting

### Common Issues

**yt-dlp not found**

```bash
# Ensure yt-dlp is installed and in PATH
yt-dlp --version
```

**ffmpeg not found**

```bash
# Ensure ffmpeg is installed and in PATH
ffmpeg -version
```

**Database migration errors**

```bash
# Reset database
rm -rf data/youtube-downloader.db
npm run db:migrate
```

**Port already in use**

```bash
# Kill process using port 3000
npx kill-port 3000
```

## 🤝 Contributing

We welcome contributions! Here's how to get started:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/your-feature`
3. **Make your changes** and add tests if applicable
4. **Run the test suite**: `npm test`
5. **Commit your changes**: `git commit -m 'Add some feature'`
6. **Push to the branch**: `git push origin feature/your-feature`
7. **Submit a pull request**

### Development Guidelines

- Follow the existing code style and conventions
- Add TypeScript types for all new code
- Test your changes thoroughly
- Update documentation as needed
- Follow the commit message conventions

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## ⚠️ Legal Notice

This tool is for educational and personal use only. Please respect YouTube's Terms of Service and copyright laws in your jurisdiction. The developers are not responsible for any misuse of this software.

## 🙏 Acknowledgments

- [yt-dlp](https://github.com/yt-dlp/yt-dlp) - Powerful Nazzel
- [Next.js](https://nextjs.org/) - React framework for production
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [shadcn/ui](https://ui.shadcn.com/) - Beautiful UI components
- [Drizzle ORM](https://orm.drizzle.team/) - TypeScript ORM

## 📞 Support

If you encounter any issues or have questions:

1. **Check the [Troubleshooting](#-troubleshooting) section**
2. **Search existing [GitHub Issues](https://github.com/KareemAdelAwwad/youtube-downloader/issues)**
3. **Create a new issue** if your problem isn't covered

---

<div align="center">
  <strong>⭐ Star this repository if you find it helpful!</strong>
</div>
