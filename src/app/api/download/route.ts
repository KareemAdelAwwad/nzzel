import { NextRequest, NextResponse } from 'next/server';
import { ytDlpService } from '@/lib/services/yt-dlp';
import { db } from '@/lib/db';
import { downloads } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

// Store active downloads for cancel/pause functionality
const activeDownloads = new Map<number, string>();

export async function POST(request: NextRequest) {
  try {
    const {
      url,
      videoId,
      title,
      format,
      quality,
      audioOnly,
      outputPath,
      thumbnailUrl,
      duration
    } = await request.json();

    if (!url || !videoId || !title) {
      return NextResponse.json(
        { error: 'URL, videoId, and title are required' },
        { status: 400 }
      );
    }

    // Insert download record into database
    const [downloadRecord] = await db.insert(downloads).values({
      videoId,
      title,
      url,
      quality: quality || 'best',
      format: format || (audioOnly ? 'mp3' : 'mkv'),
      filename: `${title}.${audioOnly ? 'mp3' : 'mkv'}`,
      filePath: outputPath || '',
      thumbnailUrl,
      duration,
      status: 'pending'
    }).returning();

    // Generate unique download ID for yt-dlp tracking
    const downloadId = `download_${downloadRecord.id}_${Date.now()}`;
    activeDownloads.set(downloadRecord.id, downloadId);

    // Start download in background
    setImmediate(async () => {
      try {
        // Update status to downloading
        await db.update(downloads)
          .set({ status: 'downloading' })
          .where(eq(downloads.id, downloadRecord.id));        // Set up progress tracking
        const progressHandler = async (data: { downloadId: string; percentage?: number; speed?: number; eta?: number }) => {
          if (data.downloadId === downloadId) {
            await db.update(downloads)
              .set({
                progress: Math.round(data.percentage || 0),
                downloadSpeed: data.speed || 0,
                eta: data.eta || 0
              })
              .where(eq(downloads.id, downloadRecord.id));
          }
        }; const completedHandler = async (data: { downloadId: string; filename?: string }) => {
          if (data.downloadId === downloadId) {
            await db.update(downloads)
              .set({
                status: 'completed',
                filename: data.filename,
                filePath: data.filename,
                progress: 100
              })
              .where(eq(downloads.id, downloadRecord.id));

            // Clean up
            activeDownloads.delete(downloadRecord.id);
            ytDlpService.off('progress', progressHandler);
            ytDlpService.off('completed', completedHandler);
            ytDlpService.off('cancelled', cancelledHandler);
            ytDlpService.off('error', errorHandler);
          }
        };

        const cancelledHandler = async (data: { downloadId: string; filename?: string }) => {
          if (data.downloadId === downloadId) {
            // Don't change status if already set to cancelled by DELETE endpoint
            // Clean up
            activeDownloads.delete(downloadRecord.id);
            ytDlpService.off('progress', progressHandler);
            ytDlpService.off('completed', completedHandler);
            ytDlpService.off('cancelled', cancelledHandler);
            ytDlpService.off('error', errorHandler);
          }
        };

        const errorHandler = async (data: { downloadId: string; message?: string }) => {
          if (data.downloadId === downloadId) {
            // Check if download was cancelled - don't override cancelled status
            const currentDownload = await db.select().from(downloads).where(eq(downloads.id, downloadRecord.id)).limit(1);
            if (currentDownload[0]?.status !== 'cancelled') {
              await db.update(downloads)
                .set({
                  status: 'failed',
                  errorMessage: data.message || 'Download failed'
                })
                .where(eq(downloads.id, downloadRecord.id));
            }

            // Clean up
            activeDownloads.delete(downloadRecord.id);
            ytDlpService.off('progress', progressHandler);
            ytDlpService.off('completed', completedHandler);
            ytDlpService.off('cancelled', cancelledHandler);
            ytDlpService.off('error', errorHandler);
          }
        }; ytDlpService.on('progress', progressHandler);
        ytDlpService.on('completed', completedHandler);
        ytDlpService.on('cancelled', cancelledHandler);
        ytDlpService.on('error', errorHandler); await ytDlpService.downloadVideo(url, {
          format,
          outputPath,
          audioOnly,
          quality
        }, downloadId);

      } catch (error) {
        console.error('Download failed:', error);
        // Update database with failed status
        await db.update(downloads)
          .set({
            status: 'failed',
            errorMessage: error instanceof Error ? error.message : 'Unknown error'
          })
          .where(eq(downloads.id, downloadRecord.id));

        activeDownloads.delete(downloadRecord.id);
      }
    });

    return NextResponse.json({
      downloadId: downloadRecord.id,
      message: 'Download started'
    });

  } catch (error) {
    console.error('Error starting download:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to start download' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const allDownloads = await db.select().from(downloads).orderBy(downloads.downloadedAt);
    return NextResponse.json(allDownloads);
  } catch (error) {
    console.error('Error fetching downloads:', error);
    return NextResponse.json(
      { error: 'Failed to fetch downloads' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { downloadId, action } = await request.json();

    if (!downloadId) {
      return NextResponse.json(
        { error: 'Download ID is required' },
        { status: 400 }
      );
    }

    console.log(`Attempting to ${action || 'cancel'} download ${downloadId}`);

    // If action is 'remove', delete from database completely
    if (action === 'remove') {
      await db.delete(downloads).where(eq(downloads.id, downloadId));
      console.log(`Download ${downloadId} removed from database`);
      return NextResponse.json({ message: 'Download removed from history' });
    }

    // Otherwise, cancel the active download (default behavior)
    const ytDlpDownloadId = activeDownloads.get(downloadId);
    if (ytDlpDownloadId) {
      console.log(`Found active yt-dlp download: ${ytDlpDownloadId}`);
      const cancelled = ytDlpService.cancelDownload(ytDlpDownloadId);
      console.log(`Cancel result: ${cancelled}`);

      if (cancelled) {
        activeDownloads.delete(downloadId);
      }
    } else {
      console.log(`No active yt-dlp download found for ID: ${downloadId}`);
    }

    // Update database status
    await db.update(downloads)
      .set({ status: 'cancelled' })
      .where(eq(downloads.id, downloadId));

    console.log(`Database updated for download ${downloadId}`);

    return NextResponse.json({ message: 'Download cancelled' });

  } catch (error) {
    console.error('Error cancelling download:', error);
    return NextResponse.json(
      { error: 'Failed to cancel download' },
      { status: 500 }
    );
  }
}
