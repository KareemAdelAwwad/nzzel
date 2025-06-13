CREATE TABLE `downloads` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`video_id` text NOT NULL,
	`title` text NOT NULL,
	`url` text NOT NULL,
	`quality` text NOT NULL,
	`format` text NOT NULL,
	`filename` text NOT NULL,
	`file_path` text NOT NULL,
	`file_size` integer,
	`duration` integer,
	`thumbnail_url` text,
	`downloaded_at` text DEFAULT CURRENT_TIMESTAMP,
	`status` text DEFAULT 'pending' NOT NULL,
	`progress` real DEFAULT 0,
	`download_speed` real,
	`eta` integer,
	`error_message` text
);
--> statement-breakpoint
CREATE TABLE `playlist_videos` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`playlist_id` integer,
	`download_id` integer,
	`position` integer NOT NULL,
	FOREIGN KEY (`playlist_id`) REFERENCES `playlists`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`download_id`) REFERENCES `downloads`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `playlists` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`playlist_id` text NOT NULL,
	`title` text NOT NULL,
	`url` text NOT NULL,
	`video_count` integer NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP
);
