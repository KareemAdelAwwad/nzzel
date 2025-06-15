"use client"

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Download as DownloadIcon, X, RotateCcw, HardDrive, Clock, Gauge, Pause, AlertCircle, CheckCircle2, Loader2, Activity } from 'lucide-react'
import { toast } from "sonner"
import type { Download } from '@/lib/db/schema'

export default function DownloadsPage() {
  const [downloads, setDownloads] = useState<Download[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [cancellingDownloads, setCancellingDownloads] = useState<Set<number>>(new Set())
  const [retryingDownloads, setRetryingDownloads] = useState<Set<number>>(new Set())

  useEffect(() => {
    fetchDownloads()
    // Set up real-time updates
    const interval = setInterval(fetchDownloads, 2000)
    return () => clearInterval(interval)
  }, [])

  const fetchDownloads = async () => {
    try {
      const response = await fetch('/api/download')
      const data = await response.json()

      if (response.ok) {
        setDownloads(data)
      }
    } catch (error) {
      // Handle fetch error silently or log in development
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to fetch downloads:', error)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const formatFileSize = (bytes: number | null): string => {
    if (!bytes) return 'Unknown'
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`
  }

  const formatSpeed = (bytesPerSecond: number | null): string => {
    if (!bytesPerSecond) return '0 B/s'
    const sizes = ['B/s', 'KB/s', 'MB/s', 'GB/s']
    const i = Math.floor(Math.log(bytesPerSecond) / Math.log(1024))
    return `${(bytesPerSecond / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`
  }

  const formatTime = (seconds: number | null): string => {
    if (!seconds || seconds <= 0) return 'Unknown'
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = Math.floor(seconds % 60)

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    } else {
      return `${minutes}:${secs.toString().padStart(2, '0')}`
    }
  }

  const handleCancelDownload = async (downloadId: number) => {
    setCancellingDownloads(prev => new Set(prev).add(downloadId))

    try {
      const response = await fetch('/api/download', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ downloadId }),
      })

      if (response.ok) {
        toast.success('Download cancelled successfully')
        await fetchDownloads()
      } else {
        toast.error('Failed to cancel download')
        if (process.env.NODE_ENV === 'development') {
          console.error('Failed to cancel download')
        }
      }
    } catch (error) {
      toast.error('Failed to cancel download')
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to cancel download:', error)
      }
    } finally {
      setCancellingDownloads(prev => {
        const newSet = new Set(prev)
        newSet.delete(downloadId)
        return newSet
      })
    }
  }

  const handleRetryDownload = async (download: Download) => {
    setRetryingDownloads(prev => new Set(prev).add(download.id))

    try {
      const response = await fetch('/api/download', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: download.url,
          videoId: download.videoId,
          title: download.title,
          quality: download.quality,
          audioOnly: download.format === 'mp3',
          outputPath: download.filePath,
          thumbnailUrl: download.thumbnailUrl,
          duration: download.duration,
        }),
      })

      if (response.ok) {
        toast.success('Download restarted successfully')
        await fetchDownloads()
      } else {
        toast.error('Failed to restart download')
        if (process.env.NODE_ENV === 'development') {
          console.error('Failed to restart download')
        }
      }
    } catch (error) {
      toast.error('Failed to restart download')
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to restart download:', error)
      }
    } finally {
      setRetryingDownloads(prev => {
        const newSet = new Set(prev)
        newSet.delete(download.id)
        return newSet
      })
    }
  }
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-700/50'
      case 'downloading': return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700/50'
      case 'failed': return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700/50'
      case 'paused': return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-700/50'
      case 'cancelled': return 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-900/30 dark:text-slate-300 dark:border-slate-700/50'
      case 'pending': return 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-700/50'
      default: return 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-900/30 dark:text-slate-300 dark:border-slate-700/50'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="h-3 w-3" />
      case 'downloading': return <Activity className="h-3 w-3 animate-pulse" />
      case 'failed': return <AlertCircle className="h-3 w-3" />
      case 'paused': return <Pause className="h-3 w-3" />
      case 'cancelled': return <X className="h-3 w-3" />
      case 'pending': return <Loader2 className="h-3 w-3 animate-spin" />
      default: return <AlertCircle className="h-3 w-3" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Completed'
      case 'downloading': return 'Downloading'
      case 'failed': return 'Failed'
      case 'paused': return 'Paused'
      case 'cancelled': return 'Cancelled'
      case 'pending': return 'Pending'
      default: return status
    }
  }

  // Filter to only show active downloads (downloading/pending)
  const activeDownloads = downloads.filter(d =>
    d.status === 'downloading' || d.status === 'pending'
  )
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]" />
          <div className="absolute h-full w-full bg-gradient-to-br from-primary/5 via-transparent to-primary/10" />        </div>

        <div className="relative container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="flex flex-col items-center gap-6 p-8 rounded-2xl backdrop-blur-sm bg-card/50 border border-border/30">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-primary/40 rounded-full animate-spin animation-delay-150"></div>
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-xl font-semibold">Loading Downloads</h3>
                <p className="text-muted-foreground">Fetching your download status...</p>              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
  return (
    <div className="min-h-full bg-gradient-to-br from-background via-background to-primary/5 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]" />
        <div className="absolute h-full w-full bg-gradient-to-br from-primary/5 via-transparent to-primary/10" />
      </div>

      <div className="relative container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Enhanced Header */}
          <div className="text-center space-y-6">
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-purple-50 to-primary/10 dark:from-blue-900/30 dark:to-primary/20 text-purple-700 dark:text-purple-300 rounded-full text-sm font-medium border border-blue-200/50 dark:border-purple-700/30 backdrop-blur-sm">
              <Activity className="h-4 w-4 animate-pulse" />
              Live Download Monitor
            </div>
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-foreground via-primary to-foreground/80 bg-clip-text text-transparent">
                Active Downloads
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Monitor your downloads in real-time with live progress tracking and detailed status information
              </p>
            </div>

            {/* Stats Pills */}
            {activeDownloads.length > 0 && (
              <div className="flex flex-wrap justify-center gap-3 pt-4">
                <div className="px-4 py-2 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium border border-blue-200/50 dark:border-blue-700/30">
                  {activeDownloads.length} Active
                </div>
                <div className="px-4 py-2 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-full text-sm font-medium border border-emerald-200/50 dark:border-emerald-700/30">
                  {activeDownloads.filter(d => d.status === 'downloading').length} Downloading
                </div>
                <div className="px-4 py-2 bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded-full text-sm font-medium border border-orange-200/50 dark:border-orange-700/30">
                  {activeDownloads.filter(d => d.status === 'pending').length} Pending
                </div>
              </div>
            )}
          </div>
          {/* Enhanced Downloads Grid */}
          {activeDownloads.length > 0 ? (
            <div className="grid gap-6">
              {activeDownloads.map((download) => (
                <Card key={download.id} className="overflow-hidden border-border/30 bg-gradient-to-br from-card/80 via-card/60 to-card/40 backdrop-blur-xl hover:from-card/90 hover:via-card/70 hover:to-card/50 transition-all duration-500 group relative before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/10 before:via-white/5 before:to-transparent before:pointer-events-none">
                  <CardContent className="p-0">
                    <div className="relative">
                      {/* Status indicator bar */}
                      <div className={`absolute top-0 left-0 right-0 h-1 rounded-full ${download.status === 'downloading' ? 'bg-gradient-to-r from-blue-500 to-primary animate-pulse' :
                        download.status === 'completed' ? 'bg-gradient-to-r from-emerald-500 to-emerald-600' :
                          download.status === 'failed' ? 'bg-gradient-to-r from-red-500 to-red-600' :
                            download.status === 'pending' ? 'bg-gradient-to-r from-orange-500 to-orange-600 animate-pulse' :
                              'bg-gradient-to-r from-slate-400 to-slate-500'
                        }`}></div>

                      <div className="p-6 space-y-6">
                        {/* Header with thumbnail and title */}
                        <div className="flex items-start gap-6">
                          {download.thumbnailUrl && (
                            <div className="flex-shrink-0 relative group/thumb">
                              <div className="relative overflow-hidden rounded-2xl shadow-lg group-hover/thumb:shadow-xl transition-all duration-300">
                                <Image
                                  src={download.thumbnailUrl}
                                  alt={download.title}
                                  width={180}
                                  height={101}
                                  className="object-cover transition-all duration-500 group-hover/thumb:scale-105"
                                  unoptimized
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent"></div>
                                <div className="absolute bottom-2 right-2">
                                  <div className={`p-1.5 rounded-full backdrop-blur-sm ${getStatusColor(download.status)} border`}>
                                    {getStatusIcon(download.status)}
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                          <div className="flex-1 min-w-0 space-y-4">
                            <div className="space-y-3">
                              <h3 className="font-bold text-xl leading-tight line-clamp-2 group-hover:text-primary transition-colors duration-300">
                                {download.title}
                              </h3>
                              <div className="flex items-center gap-3 flex-wrap">
                                <Badge className={`${getStatusColor(download.status)} font-medium px-3 py-1.5 border`}>
                                  <span className="flex items-center gap-2">
                                    {getStatusIcon(download.status)}
                                    {getStatusText(download.status)}
                                  </span>
                                </Badge>
                                {download.quality && (
                                  <Badge variant="outline" className="font-medium px-3 py-1.5 bg-muted/50 border-muted-foreground/20">
                                    <HardDrive className="h-3 w-3 mr-1" />
                                    {download.quality}
                                  </Badge>
                                )}
                                {download.format && (
                                  <Badge variant="outline" className="font-medium px-3 py-1.5 bg-primary/5 text-primary border-primary/20">
                                    {download.format.toUpperCase()}
                                  </Badge>
                                )}
                              </div>
                            </div>

                            {/* File size and duration info */}
                            {(download.fileSize || download.duration) && (
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                {download.fileSize && (
                                  <div className="flex items-center gap-2 px-3 py-1.5 bg-muted/30 rounded-full">
                                    <HardDrive className="h-3 w-3" />
                                    <span className="font-medium">{formatFileSize(download.fileSize)}</span>
                                  </div>
                                )}
                                {download.duration && (
                                  <div className="flex items-center gap-2 px-3 py-1.5 bg-muted/30 rounded-full">
                                    <Clock className="h-3 w-3" />
                                    <span className="font-medium">{formatTime(download.duration)}</span>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Enhanced Action buttons */}
                          <div className="flex items-center gap-2 flex-shrink-0">
                            {download.status === 'failed' && (
                              <Button
                                variant="outline"
                                size="sm" onClick={() => handleRetryDownload(download)}
                                disabled={retryingDownloads.has(download.id)}
                                className="hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 dark:hover:bg-emerald-900/20 dark:hover:text-emerald-300 dark:hover:border-emerald-700/30 transition-colors"
                              >
                                <RotateCcw className={`h-4 w-4 mr-2 ${retryingDownloads.has(download.id) ? 'animate-spin' : ''}`} />
                                {retryingDownloads.has(download.id) ? 'Retrying...' : 'Retry'}
                              </Button>
                            )}
                            {(download.status === 'downloading' || download.status === 'pending') && (
                              <Button
                                variant="outline"
                                size="sm" onClick={() => handleCancelDownload(download.id)}
                                disabled={cancellingDownloads.has(download.id)}
                                className="hover:bg-red-50 hover:text-red-700 hover:border-red-200 dark:hover:bg-red-900/20 dark:hover:text-red-300 dark:hover:border-red-700/30 transition-colors"
                              >
                                <X className={`h-4 w-4 mr-2 ${cancellingDownloads.has(download.id) ? 'animate-pulse' : ''}`} />
                                {cancellingDownloads.has(download.id) ? 'Cancelling...' : 'Cancel'}
                              </Button>
                            )}
                          </div>
                        </div>                        {/* Enhanced Progress section for downloading items */}
                        {download.status === 'downloading' && (
                          <div className="space-y-4 p-6 bg-gradient-to-br from-blue-50/80 via-primary/5 to-blue-50/40 dark:from-blue-900/20 dark:via-primary/10 dark:to-blue-900/10 rounded-2xl border border-blue-200/30 dark:border-blue-700/20 backdrop-blur-sm">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="relative">
                                  <div className="w-4 h-4 bg-blue-500 rounded-full animate-pulse"></div>
                                  <div className="absolute inset-0 w-4 h-4 bg-blue-400 rounded-full animate-ping opacity-75"></div>
                                </div>
                                <span className="font-bold text-lg bg-gradient-to-r from-blue-600 to-primary bg-clip-text text-transparent">
                                  {download.progress || 0}% Complete
                                </span>
                              </div>
                              <div className="flex items-center gap-6 text-sm">
                                {download.downloadSpeed && download.downloadSpeed > 0 && (
                                  <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-100/80 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full font-medium">
                                    <Gauge className="h-4 w-4" />
                                    <span>{formatSpeed(download.downloadSpeed)}</span>
                                  </div>
                                )}
                                {download.eta && download.eta > 0 && (
                                  <div className="flex items-center gap-2 px-3 py-1.5 bg-orange-100/80 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded-full font-medium">
                                    <Clock className="h-4 w-4" />
                                    <span>{formatTime(download.eta)}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="relative">
                              <Progress
                                value={download.progress || 0}
                                className="h-3 bg-blue-100/50 dark:bg-blue-900/20"
                              />
                              <div
                                className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-400 via-primary to-blue-500 rounded-full transition-all duration-700 ease-out opacity-60"
                                style={{ width: `${download.progress || 0}%` }}
                              ></div>
                              <div
                                className="absolute top-0 left-0 h-full bg-gradient-to-r from-white/30 to-transparent rounded-full transition-all duration-700 ease-out"
                                style={{ width: `${Math.min((download.progress || 0) + 10, 100)}%` }}
                              ></div>
                            </div>
                          </div>
                        )}

                        {/* Enhanced Error message for failed downloads */}
                        {download.status === 'failed' && download.errorMessage && (
                          <div className="p-6 bg-gradient-to-br from-red-50/80 to-red-50/40 dark:from-red-900/20 dark:to-red-900/10 border border-red-200/50 dark:border-red-700/30 rounded-2xl backdrop-blur-sm">
                            <div className="flex items-start gap-4">
                              <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center flex-shrink-0">
                                <AlertCircle className="w-4 h-4 text-white" />
                              </div>
                              <div className="space-y-2 flex-1">
                                <p className="text-sm font-bold text-red-700 dark:text-red-300">Download Failed</p>
                                <p className="text-sm text-red-600 dark:text-red-400 leading-relaxed bg-red-50/50 dark:bg-red-900/20 p-3 rounded-lg border border-red-200/30 dark:border-red-700/20">
                                  {download.errorMessage}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>) : (
            <Card className="border-border/30 bg-gradient-to-br from-card/80 via-card/60 to-card/40 backdrop-blur-xl relative before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/10 before:via-white/5 before:to-transparent before:pointer-events-none">
              <CardContent className="text-center py-20">
                <div className="space-y-8">
                  <div className="relative mx-auto w-32 h-32">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/10 to-primary/5 rounded-3xl flex items-center justify-center backdrop-blur-sm border border-primary/20">
                      <DownloadIcon className="h-16 w-16 text-primary" />
                    </div>
                    <div className="absolute -inset-4 bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 rounded-3xl blur-xl opacity-60 animate-pulse"></div>
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                      No Active Downloads
                    </h3>
                    <p className="text-lg text-muted-foreground max-w-md mx-auto leading-relaxed">
                      Ready to start downloading? Enter a YouTube URL to begin your next download session.
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <Button
                      onClick={() => window.location.href = '/'}
                      className=""
                      size="lg"
                    >
                      <DownloadIcon className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                      Start Downloading
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => window.location.href = '/history'}
                      size="lg"
                    >
                      View History
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}          {/* Enhanced Link to history page */}
          {activeDownloads.length > 0 && (
            <div className="text-center pt-8">
              <div className="inline-flex flex-col sm:flex-row gap-4 p-6 rounded-2xl bg-muted/30 backdrop-blur-sm border border-border/30">
                <div className="text-center sm:text-left space-y-2">
                  <h4 className="font-semibold">Want to see all downloads?</h4>
                  <p className="text-sm text-muted-foreground">Check your complete download history and manage completed files.</p>
                </div>
                <Button
                  variant="outline" onClick={() => window.location.href = '/history'}
                  className="bg-card/50 backdrop-blur-sm border-border/50 hover:bg-card/70 px-6 py-3 transition-colors"
                >                  View Download History
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
