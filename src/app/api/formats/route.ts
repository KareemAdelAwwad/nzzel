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

    // Get detailed format information
    const formats = await ytDlpService.getFormats(url);
    // Filter and process formats to get the most useful ones
    const videoFormats = formats
      .filter(f => f.vcodec !== 'none' && f.height && (f.filesize || f.filesize_approx))
      .sort((a, b) => (b.height || 0) - (a.height || 0)).reduce((acc: Array<{
        format_id: string;
        height: number | null;
        ext: string;
        filesize: number | null;
        tbr: number | null;
        vcodec: string;
        acodec: string;
        format_note: string | null;
        fps: number | null;
      }>, format) => {
        const existing = acc.find(f => f.height === format.height);
        if (!existing) {
          acc.push({
            format_id: format.format_id,
            height: format.height,
            ext: format.ext,
            filesize: format.filesize || format.filesize_approx,
            tbr: format.tbr,
            vcodec: format.vcodec,
            acodec: format.acodec,
            format_note: format.format_note,
            fps: format.fps
          });
        } else {
          // Replace if current format has better quality
          const currentSize = format.filesize || format.filesize_approx || 0;
          const existingSize = existing.filesize || 0;
          if (currentSize > existingSize || (format.tbr && format.tbr > (existing.tbr || 0))) {
            const index = acc.indexOf(existing);
            acc[index] = {
              format_id: format.format_id,
              height: format.height,
              ext: format.ext,
              filesize: format.filesize || format.filesize_approx,
              tbr: format.tbr,
              vcodec: format.vcodec,
              acodec: format.acodec,
              format_note: format.format_note,
              fps: format.fps
            };
          }
        }
        return acc;
      }, []);

    return NextResponse.json({ formats: videoFormats });

  } catch (error) {
    console.error('Error getting formats:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get video formats' },
      { status: 500 }
    );
  }
}
