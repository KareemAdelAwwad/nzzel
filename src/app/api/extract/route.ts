import { NextRequest, NextResponse } from 'next/server';
import { ytDlpService } from '@/lib/services/yt-dlp';

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }

    // Check if yt-dlp is available
    const isAvailable = await ytDlpService.isAvailable();
    if (!isAvailable) {
      return NextResponse.json(
        { error: 'yt-dlp is not available. Please install it first.' },
        { status: 500 }
      );
    }

    // Determine if it's a playlist or single video
    const isPlaylist = url.includes('playlist') || url.includes('list=');

    if (isPlaylist) {
      const playlistInfo = await ytDlpService.getPlaylistInfo(url);
      return NextResponse.json({
        type: 'playlist',
        data: playlistInfo
      });
    } else {
      const videoInfo = await ytDlpService.getVideoInfo(url);
      return NextResponse.json({
        type: 'video',
        data: videoInfo
      });
    }
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error extracting video info:', error);
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to extract video information' },
      { status: 500 }
    );
  }
}
