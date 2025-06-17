# Nzzel

A modern, full-stack YouTube Downloader built with Next.js 15, featuring real-time progress tracking and a beautiful UI.

## Features

- Download individual videos or entire playlists
- Support for MP4 (video) and MP3 (audio) formats
- Quality selection from 144p to 4K
- Real-time download progress tracking
- Download history with search and filtering
- Dark/light theme support
- Fully offline local application

## Tech Stack

- Next.js 15 with App Router and TypeScript
- Tailwind CSS 4 with shadcn/ui components
- SQLite with Drizzle ORM
- Socket.IO for real-time updates
- yt-dlp + ffmpeg integration

## Prerequisites

- Node.js (v18 or higher)
- yt-dlp
- ffmpeg

### Installation

**Windows:**

```powershell
winget install yt-dlp.yt-dlp
winget install Gyan.FFmpeg
```

**macOS:**

```bash
brew install yt-dlp ffmpeg
```

**Linux:**

```bash
pip install yt-dlp
sudo apt install ffmpeg
```

## Getting Started

1. Clone the repository:

   ```bash
   git clone https://github.com/KareemAdelAwwad/nzzel.git
   cd nzzel
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up the database:

   ```bash
   npm run db:generate
   npm run db:migrate
   ```

4. Start the development server:

   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

1. Enter a YouTube video or playlist URL
2. Select your preferred quality and format (MP4/MP3)
3. Click "Start Download"
4. Monitor progress in real-time
5. View download history and re-download previous videos

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run db:generate` - Generate database migrations
- `npm run db:migrate` - Apply database migrations

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Legal Notice

This tool is for educational and personal use only. Please respect YouTube's Terms of Service and copyright laws.
