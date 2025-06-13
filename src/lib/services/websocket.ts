import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { ytDlpService, DownloadProgress } from './yt-dlp';

interface DownloadError {
  downloadId: string;
  message: string;
}

interface DownloadCompleted {
  downloadId: string;
  filename: string;
}

let io: SocketIOServer | null = null;

export function initializeWebSocket(server: HTTPServer) {
  io = new SocketIOServer(server, {
    cors: {
      origin: process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : false,
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    // Listen for download progress updates
    const onProgress = (data: DownloadProgress & { downloadId: string }) => {
      socket.emit('download-progress', data);
    };

    const onError = (data: DownloadError) => {
      socket.emit('download-error', data);
    };

    const onCompleted = (data: DownloadCompleted) => {
      socket.emit('download-completed', data);
    };

    // Subscribe to yt-dlp events
    ytDlpService.on('progress', onProgress);
    ytDlpService.on('error', onError);
    ytDlpService.on('completed', onCompleted);

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
      // Clean up event listeners
      ytDlpService.off('progress', onProgress);
      ytDlpService.off('error', onError);
      ytDlpService.off('completed', onCompleted);
    });

    // Handle download cancellation
    socket.on('cancel-download', (downloadId: string) => {
      const success = ytDlpService.cancelDownload(downloadId);
      socket.emit('download-cancelled', { downloadId, success });
    });
  });

  return io;
}

export function getWebSocketServer(): SocketIOServer | null {
  return io;
}

export function broadcastToAll(event: string, data: unknown) {
  if (io) {
    io.emit(event, data);
  }
}
