"use client"

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { Navigation } from '@/components/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Download as DownloadIcon, X, RotateCcw, HardDrive } from 'lucide-react'
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
      console.error('Failed to fetch downloads:', error)
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
        console.error('Failed to cancel download')
      }
    } catch (error) {
      toast.error('Failed to cancel download')
      console.error('Failed to cancel download:', error)
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
        console.error('Failed to restart download')
      }
    } catch (error) {
      toast.error('Failed to restart download')
      console.error('Failed to restart download:', error)
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
      case 'completed': return 'bg-green-100 text-green-800 border-green-200'
      case 'downloading': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'failed': return 'bg-red-100 text-red-800 border-red-200'
      case 'paused': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'cancelled': return 'bg-gray-100 text-gray-800 border-gray-200'
      case 'pending': return 'bg-orange-100 text-orange-800 border-orange-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
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
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <DownloadIcon className="h-6 w-6" />
            <h1 className="text-2xl font-bold">Active Downloads</h1>
            {activeDownloads.length > 0 && (
              <Badge variant="secondary" className="ml-auto">
                {activeDownloads.length} active
              </Badge>
            )}
          </div>

          {/* Active Downloads */}
          {activeDownloads.length > 0 ? (
            <div className="space-y-4">
              {activeDownloads.map((download) => (
                <Card key={download.id} className="overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex flex-col space-y-4">
                      {/* Header with thumbnail and title */}
                      <div className="flex items-start gap-4">
                        {download.thumbnailUrl && (
                          <div className="flex-shrink-0">
                            <Image
                              src={download.thumbnailUrl}
                              alt={download.title}
                              width={120}
                              height={68}
                              className="object-cover rounded-lg"
                              unoptimized
                            />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                            {download.title}
                          </h3>
                          <div className="flex items-center gap-3 mb-3 flex-wrap">
                            <Badge className={getStatusColor(download.status)}>
                              {getStatusText(download.status)}
                            </Badge>
                            {download.quality && (
                              <Badge variant="outline">{download.quality}</Badge>
                            )}
                            {download.format && (
                              <Badge variant="outline">{download.format.toUpperCase()}</Badge>
                            )}
                            {download.fileSize && (
                              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <HardDrive className="h-3 w-3" />
                                {formatFileSize(download.fileSize)}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {download.status === 'failed' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRetryDownload(download)}
                              disabled={retryingDownloads.has(download.id)}
                            >
                              <RotateCcw className="h-4 w-4 mr-1" />
                              {retryingDownloads.has(download.id) ? 'Retrying...' : 'Retry'}
                            </Button>
                          )}
                          {(download.status === 'downloading' || download.status === 'pending') && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleCancelDownload(download.id)}
                              disabled={cancellingDownloads.has(download.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <X className="h-4 w-4 mr-1" />
                              {cancellingDownloads.has(download.id) ? 'Cancelling...' : 'Cancel'}
                            </Button>
                          )}
                        </div>
                      </div>

                      {/* Progress section for downloading items */}
                      {download.status === 'downloading' && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span>Progress: {download.progress || 0}%</span>
                            <div className="flex items-center gap-4 text-muted-foreground">
                              {download.downloadSpeed && download.downloadSpeed > 0 && (
                                <span>Speed: {formatSpeed(download.downloadSpeed)}</span>
                              )}
                              {download.eta && download.eta > 0 && (
                                <span>ETA: {formatTime(download.eta)}</span>
                              )}
                            </div>
                          </div>
                          <Progress value={download.progress || 0} className="w-full h-2" />
                        </div>
                      )}

                      {/* Error message for failed downloads */}
                      {download.status === 'failed' && download.errorMessage && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                          <p className="text-sm text-red-700 font-medium">Error:</p>
                          <p className="text-sm text-red-600">{download.errorMessage}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <DownloadIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Active Downloads</h3>
                <p className="text-muted-foreground mb-4">
                  No downloads are currently in progress. Start by entering a YouTube URL on the home page.
                </p>
                <Button onClick={() => window.location.href = '/'}>
                  Start Downloading
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Link to history page */}
          <div className="mt-8 text-center">
            <Button
              variant="outline"
              onClick={() => window.location.href = '/history'}
              className="text-muted-foreground"
            >
              View Download History
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
