"use client"

import { useEffect, useState } from 'react'
import { Navigation } from '@/components/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Download as DownloadIcon, X, Clock, HardDrive, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import type { Download } from '@/lib/db/schema'

export default function DownloadsPage() {
  const [downloads, setDownloads] = useState<Download[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [cancellingDownloads, setCancellingDownloads] = useState<Set<number>>(new Set())

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

  const formatETA = (seconds: number | null): string => {
    if (!seconds) return 'Unknown'
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60

    if (h > 0) {
      return `${h}h ${m}m`
    } else if (m > 0) {
      return `${m}m ${s}s`
    } else {
      return `${s}s`
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500'
      case 'downloading': return 'bg-blue-500'
      case 'failed': return 'bg-red-500'
      case 'paused': return 'bg-yellow-500'
      case 'cancelled': return 'bg-gray-500'
      default: return 'bg-gray-500'
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

  const handleCancelDownload = async (downloadId: number) => {
    setCancellingDownloads(prev => new Set(prev).add(downloadId));
    
    try {
      const response = await fetch('/api/download', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ downloadId }),
      });

      if (response.ok) {
        toast.success('Download cancelled successfully');
        await fetchDownloads();
      } else {
        toast.error('Failed to cancel download');
      }
    } catch (error) {
      toast.error('Failed to cancel download');
      console.error('Failed to cancel download:', error);
    } finally {
      setCancellingDownloads(prev => {
        const newSet = new Set(prev);
        newSet.delete(downloadId);
        return newSet;
      });
    }
  };

  // Filter only active downloads (downloading or pending)
  const activeDownloads = downloads.filter(d => d.status === 'downloading' || d.status === 'pending')

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
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
            <div className="flex items-center gap-2">
              <DownloadIcon className="h-6 w-6" />
              <h1 className="text-2xl font-bold">Active Downloads</h1>
            </div>
            <div className="text-sm text-muted-foreground">
              Currently downloading videos • <a href="/history" className="text-primary hover:underline">View History</a>
            </div>
          </div>

          {/* No Active Downloads */}
          {activeDownloads.length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <DownloadIcon className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Active Downloads</h3>
                <p className="text-muted-foreground text-center max-w-md">
                  Start downloading videos from YouTube and they'll appear here. 
                  <br />
                  <a href="/" className="text-primary hover:underline">Go to home page</a> to get started.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Active Downloads */}
          {activeDownloads.length > 0 && (
            <div className="grid gap-6">
              {activeDownloads.map((download) => (
                <Card key={download.id} className="w-full">
                  <CardHeader>
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg line-clamp-2">
                          {download.title}
                        </CardTitle>
                        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground mt-2">
                          <Badge variant="secondary" className={getStatusColor(download.status)}>
                            {getStatusText(download.status)}
                          </Badge>
                          {download.quality && (
                            <span>{download.quality}</span>
                          )}
                          {download.format && (
                            <span>{download.format.toUpperCase()}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={download.status !== 'downloading' || cancellingDownloads.has(download.id)}
                          onClick={() => handleCancelDownload(download.id)}
                          title="Cancel Download"
                          className="flex-shrink-0"
                        >
                          {cancellingDownloads.has(download.id) ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <X className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <Progress value={download.progress || 0} className="w-full" />
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-muted-foreground">
                        <span className="font-medium">{(download.progress || 0).toFixed(1)}%</span>
                        <div className="flex flex-wrap items-center gap-4">
                          {download.downloadSpeed && download.downloadSpeed > 0 && (
                            <span className="flex items-center gap-1">
                              <DownloadIcon className="h-3 w-3" />
                              {formatSpeed(download.downloadSpeed)}
                            </span>
                          )}
                          {download.eta && download.eta > 0 && (
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatETA(download.eta)}
                            </span>
                          )}
                          {download.fileSize && (
                            <span className="flex items-center gap-1">
                              <HardDrive className="h-3 w-3" />
                              {formatFileSize(download.fileSize)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
    if (!bytesPerSecond) return '0 B/s'
    const sizes = ['B/s', 'KB/s', 'MB/s', 'GB/s']
    const i = Math.floor(Math.log(bytesPerSecond) / Math.log(1024))
    return `${(bytesPerSecond / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`
  }

  const formatETA = (seconds: number | null): string => {
    if (!seconds) return 'Unknown'
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60

    if (h > 0) {
      return `${h}h ${m}m`
    } else if (m > 0) {
      return `${m}m ${s}s`
    } else {
      return `${s}s`
    }
  }
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500'
      case 'downloading': return 'bg-blue-500'
      case 'failed': return 'bg-red-500'
      case 'paused': return 'bg-yellow-500'
      case 'cancelled': return 'bg-gray-500'
      default: return 'bg-gray-500'
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

  const handleCancelDownload = async (downloadId: number) => {
    // Add to cancelling set to show loading state
    setCancellingDownloads(prev => new Set(prev).add(downloadId));

    try {
      const response = await fetch('/api/download', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ downloadId }),
      });

      if (response.ok) {
        toast.success('Download cancelled successfully');
        // Refresh the downloads list
        await fetchDownloads();
      } else {
        toast.error('Failed to cancel download');
        console.error('Failed to cancel download');
      }
    } catch (error) {
      toast.error('Failed to cancel download');
      console.error('Failed to cancel download:', error);
    } finally {
      // Remove from cancelling set
      setCancellingDownloads(prev => {
        const newSet = new Set(prev);
        newSet.delete(downloadId);
        return newSet;
      });
    }
  };
  const activeDownloads = downloads.filter(d => d.status === 'downloading' || d.status === 'pending')
  const completedDownloads = downloads.filter(d => d.status === 'completed')
  const failedDownloads = downloads.filter(d => d.status === 'failed')
  const cancelledDownloads = downloads.filter(d => d.status === 'cancelled')

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
      <main className="container mx-auto px-4 py-8">        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
            <div className="flex items-center gap-2">
              <DownloadIcon className="h-6 w-6" />
              <h1 className="text-2xl font-bold">Active Downloads</h1>
            </div>
            <div className="text-sm text-muted-foreground">
              Currently downloading videos • <a href="/history" className="text-primary hover:underline">View History</a>
            </div>
          </div>

          {/* No Active Downloads */}
          {activeDownloads.length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <DownloadIcon className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Active Downloads</h3>
                <p className="text-muted-foreground text-center max-w-md">
                  Start downloading videos from YouTube and they'll appear here. 
                  <br />
                  <a href="/" className="text-primary hover:underline">Go to home page</a> to get started.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Active Downloads */}
          {activeDownloads.length > 0 && (
            <div className="grid gap-6">
              {activeDownloads.map((download) => (
                <CardDescription>
                  Currently downloading videos
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {activeDownloads.map((download) => (
                  <div key={download.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-sm mb-1 line-clamp-2">
                          {download.title}
                        </h3>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Badge variant="secondary" className={getStatusColor(download.status)}>
                            {getStatusText(download.status)}
                          </Badge>
                          {download.quality && (
                            <span>{download.quality}</span>
                          )}
                          {download.format && (
                            <span>{download.format.toUpperCase()}</span>
                          )}
                        </div>
                      </div>                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={download.status !== 'downloading' || cancellingDownloads.has(download.id)}
                          onClick={() => handleCancelDownload(download.id)}
                          title="Cancel Download"
                        >
                          {cancellingDownloads.has(download.id) ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <X className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Progress value={download.progress || 0} className="w-full" />
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{(download.progress || 0).toFixed(1)}%</span>
                        <div className="flex items-center gap-4">
                          {download.downloadSpeed && (<span className="flex items-center gap-1">
                            <DownloadIcon className="h-3 w-3" />
                            {formatSpeed(download.downloadSpeed)}
                          </span>
                          )}
                          {download.eta && (
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatETA(download.eta)}
                            </span>
                          )}
                          {download.fileSize && (
                            <span className="flex items-center gap-1">
                              <HardDrive className="h-3 w-3" />
                              {formatFileSize(download.fileSize)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Completed Downloads */}
          {completedDownloads.length > 0 && (
            <Card className="mb-6">
              <CardHeader>                <CardTitle className="flex items-center gap-2 text-green-600">
                <DownloadIcon className="h-5 w-5" />
                Completed ({completedDownloads.length})
              </CardTitle>
                <CardDescription>
                  Successfully downloaded videos
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {completedDownloads.slice(0, 5).map((download) => (
                  <div key={download.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <h3 className="font-semibold text-sm mb-1 line-clamp-1">
                        {download.title}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          Completed
                        </Badge>
                        {download.quality && <span>{download.quality}</span>}
                        {download.format && <span>{download.format.toUpperCase()}</span>}
                        {download.fileSize && <span>{formatFileSize(download.fileSize)}</span>}
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {download.downloadedAt && new Date(download.downloadedAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
                {completedDownloads.length > 5 && (
                  <p className="text-center text-sm text-muted-foreground">
                    And {completedDownloads.length - 5} more completed downloads...
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Failed Downloads */}
          {failedDownloads.length > 0 && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-600">
                  <X className="h-5 w-5" />
                  Failed ({failedDownloads.length})
                </CardTitle>
                <CardDescription>
                  Downloads that encountered errors
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {failedDownloads.map((download) => (
                  <div key={download.id} className="flex items-center justify-between p-3 border rounded-lg border-red-200">
                    <div className="flex-1">
                      <h3 className="font-semibold text-sm mb-1 line-clamp-1">
                        {download.title}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                        <Badge variant="destructive">
                          Failed
                        </Badge>
                        {download.quality && <span>{download.quality}</span>}
                        {download.format && <span>{download.format.toUpperCase()}</span>}
                      </div>
                      {download.errorMessage && (
                        <p className="text-xs text-red-600 truncate">
                          {download.errorMessage}
                        </p>
                      )}
                    </div>
                    <Button variant="outline" size="sm" disabled>
                      Retry
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>)}

          {/* Cancelled Downloads */}
          {cancelledDownloads.length > 0 && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-600">
                  <X className="h-5 w-5" />
                  Cancelled ({cancelledDownloads.length})
                </CardTitle>
                <CardDescription>
                  Downloads that were cancelled by user
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {cancelledDownloads.map((download) => (
                  <div key={download.id} className="flex items-center justify-between p-3 border rounded-lg border-gray-200">
                    <div className="flex-1">
                      <h3 className="font-semibold text-sm mb-1 line-clamp-1">
                        {download.title}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Badge variant="secondary">
                          Cancelled
                        </Badge>
                        {download.quality && <span>{download.quality}</span>}
                        {download.format && <span>{download.format.toUpperCase()}</span>}
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        // Redirect to home page with the URL pre-filled if possible
                        window.location.href = '/'
                      }}
                    >
                      Retry
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Empty State */}
          {downloads.length === 0 && (
            <Card>              <CardContent className="text-center py-12">
              <DownloadIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No downloads yet</h3>
              <p className="text-muted-foreground mb-4">
                Start by entering a YouTube URL on the home page
              </p>
              <Button onClick={() => window.location.href = '/'}>
                Start Downloading
              </Button>
            </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
