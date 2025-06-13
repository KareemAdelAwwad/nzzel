export interface VideoFormat {
  format_id: string;
  format: string;
  ext: string;
  resolution: string;
  fps: number | null;
  vcodec: string;
  acodec: string;
  filesize: number | null;
  filesize_approx: number | null;
  format_note: string | null;
  quality: number;
  width: number | null;
  height: number | null;
  tbr: number | null;
  abr: number | null;
  vbr: number | null;
}

export interface VideoInfo {
  id: string;
  title: string;
  description: string;
  uploader: string;
  duration: number;
  view_count: number;
  like_count: number;
  thumbnail: string;
  thumbnails?: Array<{
    url: string;
    width?: number;
    height?: number;
    id?: string;
  }>;
  webpage_url: string;
  formats: VideoFormat[];
  requested_formats?: VideoFormat[];
  playlist_id?: string;
  playlist_title?: string;
}

export interface PlaylistInfo {
  id: string;
  title: string;
  uploader: string;
  description: string;
  webpage_url: string;
  entries: VideoInfo[];
}

export interface DownloadProgress {
  percentage: number;
  speed: number;
  eta: number;
  downloaded: number;
  total: number;
  filename: string;
  status: 'downloading' | 'processing' | 'completed' | 'error';
}

// Helper function to format file size
export function formatFileSize(bytes: number | null): string {
  if (!bytes || bytes === 0) return 'Unknown';
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
}

// Helper function to get format note with fallback
export function getFormatNote(format: VideoFormat): string {
  if (format.format_note && format.format_note.trim()) {
    return format.format_note;
  }

  // Fallback to constructing from available info
  const parts = [];

  if (format.height) {
    parts.push(`${format.height}p`);
  }

  if (format.fps && format.fps > 30) {
    parts.push(`${format.fps}fps`);
  }

  if (format.vcodec && format.vcodec !== 'none' && format.vcodec !== 'unknown') {
    parts.push(format.vcodec.toUpperCase());
  }

  if (format.acodec && format.acodec !== 'none' && format.acodec !== 'unknown') {
    parts.push(format.acodec.toUpperCase());
  }

  return parts.length > 0 ? parts.join(', ') : format.ext.toUpperCase();
}
