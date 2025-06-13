# Copilot Instructions

<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

## Project Overview

This is a Next.js 15 YouTube downloader application built with:

- Next.js 15 with App Router and React Server Components
- TypeScript for type safety
- Tailwind CSS 4 for styling
- shadcn/ui for UI components
- Drizzle ORM with SQLite for local database
- Socket.IO for real-time progress updates
- yt-dlp integration for YouTube downloads
- ffmpeg for video processing

## Architecture Guidelines

- Use React Server Components where appropriate
- Implement proper error boundaries and error handling
- Follow Next.js 15 best practices with App Router
- Use TypeScript types throughout the application
- Implement proper database schema with Drizzle ORM
- Use WebSocket/Socket.IO for real-time progress updates
- Modular service architecture for yt-dlp integration

## Coding Standards

- Use TypeScript strict mode
- Implement proper error handling for downloads
- Use shadcn/ui components for consistent UI
- Follow React best practices with hooks and state management
- Implement proper loading states and user feedback
- Use server actions for form submissions where appropriate
- Implement proper database transactions

## Key Features

- YouTube video/playlist URL input
- Format selection and quality options
- Real-time download progress tracking
- Download history with SQLite storage
- Modern, responsive UI with dark/light theme
- Fully offline local application
