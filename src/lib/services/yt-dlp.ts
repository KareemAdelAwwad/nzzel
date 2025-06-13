import { spawn, ChildProcess } from 'child_process';
import { EventEmitter } from 'events';
import path from 'path';
import fs from 'fs';
import os from 'os';
import type { VideoFormat, VideoInfo, PlaylistInfo } from '@/lib/types/yt-dlp';

export class YtDlpService extends EventEmitter {
  private activeProcesses: Map<string, ChildProcess> = new Map();
  private cancelledDownloads: Set<string> = new Set();

  constructor() {
    super();
  }

  /**
   * Get video information without downloading
   */
  async getVideoInfo(url: string): Promise<VideoInfo> {
    return new Promise((resolve, reject) => {
      const args = [
        '--dump-json',
        '--no-warnings',
        '--no-check-certificate',
        url
      ];

      const process = spawn('yt-dlp', args, {
        stdio: ['ignore', 'pipe', 'pipe']
      });

      let stdout = '';
      let stderr = '';

      process.stdout?.on('data', (data) => {
        stdout += data.toString();
      });

      process.stderr?.on('data', (data) => {
        stderr += data.toString();
      });

      process.on('close', (code) => {
        if (code === 0) {
          try {
            const videoInfo = JSON.parse(stdout.trim()) as VideoInfo;
            resolve(videoInfo);
          } catch (error) {
            reject(new Error(`Failed to parse video info: ${error}`));
          }
        } else {
          reject(new Error(`yt-dlp failed: ${stderr}`));
        }
      });

      process.on('error', (error) => {
        reject(new Error(`Failed to start yt-dlp: ${error.message}`));
      });
    });
  }

  /**
   * Get playlist information
   */
  async getPlaylistInfo(url: string): Promise<PlaylistInfo> {
    return new Promise((resolve, reject) => {
      const args = [
        '--dump-json',
        '--flat-playlist',
        '--no-warnings',
        '--no-check-certificate',
        url
      ];

      const process = spawn('yt-dlp', args, {
        stdio: ['ignore', 'pipe', 'pipe']
      });

      let stdout = '';
      let stderr = '';

      process.stdout?.on('data', (data) => {
        stdout += data.toString();
      });

      process.stderr?.on('data', (data) => {
        stderr += data.toString();
      });

      process.on('close', (code) => {
        if (code === 0) {
          try {
            const lines = stdout.trim().split('\n').filter(line => line.trim());
            const entries = lines.map(line => JSON.parse(line)) as VideoInfo[];

            // Get playlist metadata from first entry or construct it
            const playlistInfo: PlaylistInfo = {
              id: entries[0]?.playlist_id || 'unknown',
              title: entries[0]?.playlist_title || 'Unknown Playlist',
              uploader: entries[0]?.uploader || 'Unknown',
              description: '',
              webpage_url: url,
              entries
            };

            resolve(playlistInfo);
          } catch (error) {
            reject(new Error(`Failed to parse playlist info: ${error}`));
          }
        } else {
          reject(new Error(`yt-dlp failed: ${stderr}`));
        }
      });

      process.on('error', (error) => {
        reject(new Error(`Failed to start yt-dlp: ${error.message}`));
      });
    });
  }

  /**
   * Get available formats for a video
   */
  async getFormats(url: string): Promise<VideoFormat[]> {
    const info = await this.getVideoInfo(url);
    return info.formats || [];
  }
  /**
   * Download a video with progress tracking
   */  async downloadVideo(
    url: string,
    options: {
      format?: string;
      outputPath?: string;
      audioOnly?: boolean;
      quality?: string;
    } = {},
    customDownloadId?: string
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const downloadId = customDownloadId || Math.random().toString(36).substring(7);
      const outputPath = options.outputPath || path.join(os.homedir(), 'Downloads');

      // Ensure output directory exists
      if (!fs.existsSync(outputPath)) {
        fs.mkdirSync(outputPath, { recursive: true });
      } const args = [
        '--newline',
        '--no-colors',
        '--output', path.join(outputPath, '%(title)s.%(ext)s'),
      ];

      // Add format selection
      if (options.audioOnly) {
        args.push('-f', 'bestaudio/best');
        args.push('--extract-audio');
        args.push('--audio-format', 'mp3');
      } else if (options.format) {
        args.push('-f', options.format);
      } else if (options.quality) {
        switch (options.quality) {
          case 'best':
            args.push('-f', 'bestvideo+bestaudio/best');
            break;
          case 'worst':
            args.push('-f', 'worstvideo+worstaudio/worst');
            break;
          default:
            args.push('-f', `bestvideo[height<=${options.quality}]+bestaudio/best[height<=${options.quality}]`);
        }
      } else {
        args.push('-f', 'bestvideo+bestaudio/best');
      }

      // Add merge output format if not audio only
      if (!options.audioOnly) {
        args.push('--merge-output-format', 'mkv');
      }

      args.push(url);

      const process = spawn('yt-dlp', args, {
        stdio: ['ignore', 'pipe', 'pipe']
      });

      this.activeProcesses.set(downloadId, process);

      let finalFilename = ''; process.stdout?.on('data', (data) => {
        const lines = data.toString().split('\n'); for (const line of lines) {
          if (line.trim()) {
            // Temporary debug: log lines that contain progress info
            if (line.includes('%') || line.includes('download')) {
              console.log('YT-DLP OUTPUT:', line);
            }

            try {// Check for various progress patterns
              if (line.includes('%') && (line.includes('ETA') || line.includes('at') || line.includes('~'))) {
                // Try multiple patterns for progress
                let progressMatch;

                // Pattern 1: [download] 45.2% of 123.4MiB at 1.2MiB/s ETA 00:34
                progressMatch = line.match(/\[download\]\s+(\d+(?:\.\d+)?)%\s+of\s+[\d.]+[A-Za-z]+\s+at\s+([\d.]+[A-Za-z\/]+)\s+ETA\s+([\d:]+)/);
                if (!progressMatch) {
                  // Pattern 2: download:[download] 45.2% of 123.4MiB at 1.2MiB/s ETA 00:34
                  progressMatch = line.match(/download:\[download\]\s+(\d+(?:\.\d+)?)%\s+of\s+[\d.]+[A-Za-z]+\s+at\s+([\d.]+[A-Za-z\/]+)\s+ETA\s+([\d:]+)/);
                }
                if (!progressMatch) {
                  // Pattern 3: Simple percentage with speed
                  progressMatch = line.match(/(\d+(?:\.\d+)?)%.*?at\s+([\d.]+[A-Za-z\/]+)(?:\s+ETA\s+([\d:]+))?/);
                }
                if (!progressMatch) {
                  // Pattern 4: Alternative format with ~ sign
                  progressMatch = line.match(/(\d+(?:\.\d+)?)%.*?~\s*([\d.]+[A-Za-z\/]+)(?:\s+ETA\s+([\d:]+))?/);
                }
                if (!progressMatch) {
                  // Pattern 5: Just percentage and speed without "at"
                  progressMatch = line.match(/(\d+(?:\.\d+)?)%.*?([\d.]+[A-Za-z\/]+s)(?:\s+ETA\s+([\d:]+))?/);
                } if (progressMatch) {
                  const percentage = parseFloat(progressMatch[1]);
                  const speedStr = progressMatch[2] || '';
                  const etaStr = progressMatch[3] || '0:00';

                  // Parse speed more robustly
                  let speedBps = 0;
                  const speedMatch = speedStr.match(/([\d.]+)\s*([A-Za-z\/]+)/);
                  if (speedMatch) {
                    const speedValue = parseFloat(speedMatch[1]);
                    const speedUnit = speedMatch[2].toLowerCase().replace(/\//g, '');

                    // Handle different speed units
                    if (speedUnit.includes('kib') || speedUnit === 'kbs') {
                      speedBps = speedValue * 1024;
                    } else if (speedUnit.includes('mib') || speedUnit === 'mbs') {
                      speedBps = speedValue * 1024 * 1024;
                    } else if (speedUnit.includes('gib') || speedUnit === 'gbs') {
                      speedBps = speedValue * 1024 * 1024 * 1024;
                    } else if (speedUnit.includes('kb')) {
                      speedBps = speedValue * 1000;
                    } else if (speedUnit.includes('mb')) {
                      speedBps = speedValue * 1000 * 1000;
                    } else if (speedUnit.includes('gb')) {
                      speedBps = speedValue * 1000 * 1000 * 1000;
                    } else if (speedUnit.includes('b')) {
                      speedBps = speedValue;
                    }
                  }

                  // Parse ETA
                  let etaSeconds = 0;
                  if (etaStr && etaStr.includes(':')) {
                    const timeParts = etaStr.split(':').map((part: string) => parseInt(part.trim()));
                    if (timeParts.length === 2) {
                      etaSeconds = timeParts[0] * 60 + timeParts[1];
                    } else if (timeParts.length === 3) {
                      etaSeconds = timeParts[0] * 3600 + timeParts[1] * 60 + timeParts[2];
                    }
                  }

                  console.log(`PROGRESS PARSED: ${percentage}% | Speed: ${speedBps} B/s | ETA: ${etaSeconds}s | From line: ${line.trim()}`);

                  this.emit('progress', {
                    downloadId,
                    percentage,
                    speed: speedBps,
                    eta: etaSeconds,
                    downloaded: 0,
                    total: 0,
                    filename: finalFilename || 'downloading...',
                    status: 'downloading' as const
                  });
                }
              }              // Capture filename from output lines
              if (line.includes('Destination:') || line.includes('Merging formats into') || line.includes('[download]') && line.includes('.')) {
                const filenameMatch = line.match(/"([^"]+)"|\/([^\/\s]+\.[a-zA-Z0-9]+)/);
                if (filenameMatch) {
                  finalFilename = filenameMatch[1] || filenameMatch[2];
                }
              }
            } catch {
              // Continue processing other lines
            }
          }
        }
      });

      process.stderr?.on('data', (data) => {
        const message = data.toString();
        this.emit('error', { downloadId, message });
      }); process.on('close', (code, signal) => {
        this.activeProcesses.delete(downloadId);

        // Check if this download was cancelled
        if (this.cancelledDownloads.has(downloadId)) {
          this.cancelledDownloads.delete(downloadId);
          // Don't emit cancelled here since we already did in cancelDownload
          reject(new Error('Download was cancelled'));
          return;
        }

        // Check if process was terminated by signal (another indication of cancellation)
        if (signal === 'SIGTERM' || signal === 'SIGKILL') {
          this.emit('cancelled', { downloadId, filename: finalFilename });
          reject(new Error('Download was terminated'));
          return;
        }

        if (code === 0) {
          this.emit('completed', { downloadId, filename: finalFilename });
          resolve(finalFilename);
        } else {
          this.emit('error', { downloadId, message: `Download failed with exit code ${code}` });
          reject(new Error(`Download failed with code ${code}`));
        }
      });

      process.on('error', (error) => {
        this.activeProcesses.delete(downloadId);
        if (this.cancelledDownloads.has(downloadId)) {
          this.cancelledDownloads.delete(downloadId);
          reject(new Error('Download was cancelled'));
        } else {
          this.emit('error', { downloadId, message: error.message });
          reject(new Error(`Failed to start download: ${error.message}`));
        }
      });
    });
  }  /**
   * Pause/cancel a download
   */
  cancelDownload(downloadId: string): boolean {
    const process = this.activeProcesses.get(downloadId);
    if (process) {
      // Mark as cancelled before killing the process
      this.cancelledDownloads.add(downloadId);

      // Emit cancellation event first
      this.emit('cancelled', { downloadId });

      // Try graceful termination first
      try {
        if (process.pid) {
          // On Windows, use taskkill for more reliable termination
          if (os.platform() === 'win32') {
            spawn('taskkill', ['/pid', process.pid.toString(), '/t', '/f'], {
              stdio: 'ignore'
            });
          } else {
            // On Unix-like systems, use SIGTERM first, then SIGKILL
            process.kill('SIGTERM');
            setTimeout(() => {
              if (this.activeProcesses.has(downloadId)) {
                process.kill('SIGKILL');
              }
            }, 5000); // Wait 5 seconds before force kill
          }
        }
      } catch (error) {
        console.error('Error terminating process:', error);
      }

      // Clean up immediately
      this.activeProcesses.delete(downloadId);
      return true;
    }
    return false;
  }
  /**
   * Get active downloads count
   */
  getActiveDownloadsCount(): number {
    return this.activeProcesses.size;
  }

  /**
   * Check if a specific download is active
   */
  isDownloadActive(downloadId: string): boolean {
    return this.activeProcesses.has(downloadId);
  }

  /**
   * Get all active download IDs
   */
  getActiveDownloadIds(): string[] {
    return Array.from(this.activeProcesses.keys());
  }

  /**
   * Check if yt-dlp is available
   */
  async isAvailable(): Promise<boolean> {
    return new Promise((resolve) => {
      const process = spawn('yt-dlp', ['--version'], {
        stdio: ['ignore', 'pipe', 'pipe']
      });

      process.on('close', (code) => {
        resolve(code === 0);
      });

      process.on('error', () => {
        resolve(false);
      });
    });
  }
}

export const ytDlpService = new YtDlpService();
