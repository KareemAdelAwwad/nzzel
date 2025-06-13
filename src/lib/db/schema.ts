import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const downloads = sqliteTable('downloads', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  videoId: text('video_id').notNull(),
  title: text('title').notNull(),
  url: text('url').notNull(),
  quality: text('quality').notNull(),
  format: text('format').notNull(),
  filename: text('filename').notNull(),
  filePath: text('file_path').notNull(),
  fileSize: integer('file_size'), // in bytes
  duration: integer('duration'), // in seconds
  thumbnailUrl: text('thumbnail_url'),
  downloadedAt: text('downloaded_at').default(sql`CURRENT_TIMESTAMP`),
  status: text('status', { enum: ['pending', 'downloading', 'completed', 'failed', 'paused', 'cancelled'] }).notNull().default('pending'),
  progress: real('progress').default(0), // 0-100
  downloadSpeed: real('download_speed'), // bytes per second
  eta: integer('eta'), // estimated time remaining in seconds
  errorMessage: text('error_message'),
});

export const playlists = sqliteTable('playlists', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  playlistId: text('playlist_id').notNull(),
  title: text('title').notNull(),
  url: text('url').notNull(),
  videoCount: integer('video_count').notNull(),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

export const playlistVideos = sqliteTable('playlist_videos', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  playlistId: integer('playlist_id').references(() => playlists.id),
  downloadId: integer('download_id').references(() => downloads.id),
  position: integer('position').notNull(),
});

export type Download = typeof downloads.$inferSelect;
export type NewDownload = typeof downloads.$inferInsert;
export type Playlist = typeof playlists.$inferSelect;
export type NewPlaylist = typeof playlists.$inferInsert;
export type PlaylistVideo = typeof playlistVideos.$inferSelect;
export type NewPlaylistVideo = typeof playlistVideos.$inferInsert;
