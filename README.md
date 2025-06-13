# YouTube Downloader

A modern, full-stack YouTube downloader built with Next.js 15, featuring real-time progress tracking and a beautiful UI.

## Recent Fixes

✅ **Fixed Theme System**

- Enhanced theme provider with proper hydration handling
- Theme persistence now works correctly across page reloads
- Fixed theme toggle component functionality

✅ **Fixed Format Display Issues**

- Format notes now show meaningful information instead of "Unknown"
- Added fallback logic for format descriptions
- File sizes are properly displayed for all quality options

✅ **Enhanced Download Management**

- Added download pause and cancel functionality
- Fixed download progress tracking (no longer stuck at 0%)
- Improved progress parsing from yt-dlp output
- Added proper download ID management

✅ **UI/UX Improvements**

- Video thumbnails are displayed in playlist options
- File sizes are shown for each quality option
- Enhanced download status indicators
- Better error handling and user feedback

✅ **Build Issues Resolved**

- All TypeScript compilation errors fixed
- Proper module imports and exports
- Lint warnings addressed
- Database schema updated with cancelled status

## Available Scripts

- `npm run dev` - Start development server (also available as `npm run run`)
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:generate` - Generate database migrations
- `npm run db:migrate` - Apply database migrations
- `npm run db:studio` - Open Drizzle Studio

## Features

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
2. **yt-dlp** - YouTube downloader

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
- `GET /api/download` - Get download history

## Database Schema

The application uses SQLite with three main tables:

- `downloads` - Individual download records
- `playlists` - Playlist metadata
- `playlist_videos` - Relationship between playlists and videos

## Configuration

### Environment Variables

Create a `.env.local` file for custom configurations:

```env
# Optional: Custom download directory
DEFAULT_DOWNLOAD_PATH=/path/to/downloads

# Optional: Database location
DATABASE_URL=./data/youtube-downloader.db
```

## Development

### Database Management

```bash
# Generate new migration
npm run db:generate

# Apply migrations
npm run db:migrate

# Open database studio
npm run db:studio
```

### Building for Production

```bash
npm run build
npm start
```

## Troubleshooting

### yt-dlp Issues

- Ensure yt-dlp is installed and accessible in PATH
- Update yt-dlp regularly: `yt-dlp --update` or `pip install --upgrade yt-dlp`

### ffmpeg Issues

- Verify ffmpeg installation: `ffmpeg -version`
- Ensure ffmpeg is in your system PATH

### Download Failures

- Check if the video is available and not geo-restricted
- Verify the YouTube URL format is correct
- Check the error message in the failed downloads section

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is for educational purposes only. Please respect YouTube's Terms of Service and copyright laws when downloading content.

## Acknowledgments

- [yt-dlp](https://github.com/yt-dlp/yt-dlp) - The powerful YouTube downloader
- [Next.js](https://nextjs.org/) - The React framework
- [shadcn/ui](https://ui.shadcn.com/) - Beautiful UI components
- [Drizzle ORM](https://drizzle.team/) - Type-safe database toolkit
