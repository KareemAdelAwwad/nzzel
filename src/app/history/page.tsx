"use client"

import { useEffect, useState, useCallback } from 'react'
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, Download as DownloadIcon, Calendar, HardDrive, Filter, X, RotateCcw, Clock, CheckCircle, XCircle, Trash2, Archive } from 'lucide-react'
import { toast } from "sonner"
import type { Download } from '@/lib/db/schema'

export default function HistoryPage() {
  const [downloads, setDownloads] = useState<Download[]>([])
  const [filteredDownloads, setFilteredDownloads] = useState<Download[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortBy, setSortBy] = useState('date')
  const [removingItems, setRemovingItems] = useState<Set<number>>(new Set())
  const [retryingItems, setRetryingItems] = useState<Set<number>>(new Set())

  useEffect(() => {
    fetchDownloads()
  }, [])

  const filterAndSortDownloads = useCallback(() => {
    // Only show historical downloads (completed, failed, cancelled) - not active ones
    let filtered = downloads.filter(download =>
      download.status === 'completed' ||
      download.status === 'failed' ||
      download.status === 'cancelled'
    )

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(download =>
        download.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        download.url.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(download => download.status === statusFilter)
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.downloadedAt || 0).getTime() - new Date(a.downloadedAt || 0).getTime()
        case 'title':
          return a.title.localeCompare(b.title)
        case 'size':
          return (b.fileSize || 0) - (a.fileSize || 0)
        case 'quality':
          return a.quality.localeCompare(b.quality)
        default:
          return 0
      }
    })

    setFilteredDownloads(filtered)
  }, [downloads, searchTerm, statusFilter, sortBy])

  useEffect(() => {
    filterAndSortDownloads()
  }, [filterAndSortDownloads])

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

  const formatDate = (dateString: string | null): string => {
    if (!dateString) return 'Unknown'
    const date = new Date(dateString)
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const handleRemoveFromHistory = async (downloadId: number) => {
    setRemovingItems(prev => new Set(prev).add(downloadId))

    try {
      const response = await fetch('/api/download', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ downloadId, action: 'remove' }),
      })

      if (response.ok) {
        toast.success('Download removed from history')
        await fetchDownloads()
      } else {
        toast.error('Failed to remove download')
        console.error('Failed to remove download')
      }
    } catch (error) {
      toast.error('Failed to remove download')
      console.error('Failed to remove download:', error)
    } finally {
      setRemovingItems(prev => {
        const newSet = new Set(prev)
        newSet.delete(downloadId)
        return newSet
      })
    }
  }

  const handleRetryDownload = async (download: Download) => {
    setRetryingItems(prev => new Set(prev).add(download.id))

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
      setRetryingItems(prev => {
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
      default: return 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-900/30 dark:text-slate-300 dark:border-slate-700/50'
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4" />
      case 'failed': return <XCircle className="h-4 w-4" />
      case 'cancelled': return <X className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  if (isLoading) {
    return (      <div className="min-h-full bg-gradient-to-br from-background via-background to-primary/5 relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]" />
          <div className="absolute h-full w-full bg-gradient-to-br from-primary/5 via-transparent to-primary/10" />
        </div>

        <div className="relative container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="flex flex-col items-center gap-6 p-8 rounded-2xl backdrop-blur-sm bg-card/50 border border-border/30">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-primary/40 rounded-full animate-spin animation-delay-150"></div>
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-xl font-semibold">Loading History</h3>                <p className="text-muted-foreground">Fetching your download history...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-full bg-gradient-to-br from-background via-background to-primary/5 relative overflow-hidden">
      {/* Enhanced animated background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]" />
        <div className="absolute h-full w-full bg-gradient-to-br from-primary/5 via-transparent to-primary/10" />
      </div>

      <div className="relative container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Enhanced Header */}
          <div className="text-center space-y-6">
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-purple-50 to-primary/10 dark:from-blue-900/30 dark:to-primary/20 text-purple-700 dark:text-purple-300 rounded-full text-sm font-medium border border-blue-200/50 dark:border-purple-700/30 backdrop-blur-sm">
              <Archive className="h-4 w-4" />
              Download Archive
            </div>

            {/* Stats Pills */}
            {filteredDownloads.length > 0 && (
              <div className="flex flex-wrap justify-center gap-3 pt-4">
                <div className="px-4 py-2 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-full text-sm font-medium border border-emerald-200/50 dark:border-emerald-700/30">
                  {downloads.filter(d => d.status === 'completed').length} Completed
                </div>
                <div className="px-4 py-2 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-full text-sm font-medium border border-red-200/50 dark:border-red-700/30">
                  {downloads.filter(d => d.status === 'failed').length} Failed
                </div>
                <div className="px-4 py-2 bg-slate-50 dark:bg-slate-900/30 text-slate-700 dark:text-slate-300 rounded-full text-sm font-medium border border-slate-200/50 dark:border-slate-700/30">
                  {downloads.filter(d => d.status === 'cancelled').length} Cancelled
                </div>
              </div>
            )}
          </div>          {/* Enhanced Filters */}
          <Card className="border-border/30 bg-gradient-to-br from-card/80 via-card/60 to-card/40 backdrop-blur-xl relative before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/10 before:via-white/5 before:to-transparent before:pointer-events-none">
            <CardHeader className="pb-0">
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center">
                  <Filter className="h-4 w-4 text-primary-foreground" />
                </div>
                Filter & Search
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Search Downloads</label>
                  <div className="relative group">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input
                      placeholder="Search by title or URL..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 py-5 bg-background/60 border-border/50 focus:border-primary/50 focus:ring-primary/20 transition-all duration-200"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Status Filter</label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="bg-background/60 py-5 border-border/50">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Sort By</label>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="bg-background/60 py-5 border-border/50">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="date">Date</SelectItem>
                      <SelectItem value="title">Title</SelectItem>
                      <SelectItem value="size">File Size</SelectItem>
                      <SelectItem value="quality">Quality</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground">Results</label>
                  <div className="flex items-center justify-between px-3 py-1.5 bg-muted/50 rounded-lg border border-border/30">
                    <span className="text-sm font-medium">{filteredDownloads.length} items</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSearchTerm('')
                        setStatusFilter('all')
                        setSortBy('date')
                      }}
                      className="text-xs"
                    >
                      Clear
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Enhanced Downloads List */}
          {filteredDownloads.length > 0 ? (
            <div className="grid gap-6">
              {filteredDownloads.map((download) => (
                <Card key={download.id} className="overflow-hidden border-border/30 bg-gradient-to-br from-card/80 via-card/60 to-card/40 backdrop-blur-xl hover:from-card/90 hover:via-card/70 hover:to-card/50 transition-all duration-500 group relative before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/10 before:via-white/5 before:to-transparent before:pointer-events-none">
                  <CardContent className="p-0">
                    <div className="relative">
                      {/* Status indicator bar */}
                      <div className={`absolute top-0 left-0 right-0 h-1 ${download.status === 'completed' ? 'bg-gradient-to-r from-emerald-500 to-emerald-600' :
                        download.status === 'failed' ? 'bg-gradient-to-r from-red-500 to-red-600' :
                          download.status === 'cancelled' ? 'bg-gradient-to-r from-slate-400 to-slate-500' :
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
                                  width={160}
                                  height={90}
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

                            {/* File info and timestamp */}
                            <div className="flex items-center gap-6 text-sm text-muted-foreground flex-wrap">
                              {download.fileSize && (
                                <div className="flex items-center gap-2 px-3 py-1.5 bg-muted/30 rounded-full">
                                  <HardDrive className="h-3 w-3" />
                                  <span className="font-medium">{formatFileSize(download.fileSize)}</span>
                                </div>
                              )}
                              {download.downloadedAt && (
                                <div className="flex items-center gap-2 px-3 py-1.5 bg-muted/30 rounded-full">
                                  <Calendar className="h-3 w-3" />
                                  <span className="font-medium">{formatDate(download.downloadedAt)}</span>
                                </div>
                              )}
                              {download.duration && (
                                <div className="flex items-center gap-2 px-3 py-1.5 bg-muted/30 rounded-full">
                                  <Clock className="h-3 w-3" />
                                  <span className="font-medium">{Math.floor(download.duration / 60)}:{(download.duration % 60).toString().padStart(2, '0')}</span>
                                </div>
                              )}
                            </div>

                            {/* Error message for failed downloads */}
                            {download.status === 'failed' && download.errorMessage && (
                              <div className="p-4 bg-gradient-to-br from-red-50/80 to-red-50/40 dark:from-red-900/20 dark:to-red-900/10 border border-red-200/50 dark:border-red-700/30 rounded-xl backdrop-blur-sm">
                                <div className="flex items-start gap-3">
                                  <div className="w-6 h-6 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center flex-shrink-0">
                                    <XCircle className="w-3 h-3 text-white" />
                                  </div>
                                  <div className="space-y-1 flex-1">
                                    <p className="text-sm font-semibold text-red-700 dark:text-red-300">Download Failed</p>
                                    <p className="text-sm text-red-600 dark:text-red-400 leading-relaxed">
                                      {download.errorMessage}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Enhanced Action buttons */}
                          <div className="flex items-center gap-2 flex-shrink-0">
                            {download.status === 'failed' && (
                              <Button
                                variant="outline"
                                size="sm" onClick={() => handleRetryDownload(download)}
                                disabled={retryingItems.has(download.id)}
                                className="hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 dark:hover:bg-emerald-900/20 dark:hover:text-emerald-300 dark:hover:border-emerald-700/30 transition-colors"
                              >
                                <RotateCcw className={`h-4 w-4 mr-2 ${retryingItems.has(download.id) ? 'animate-spin' : ''}`} />
                                {retryingItems.has(download.id) ? 'Retrying...' : 'Retry'}
                              </Button>
                            )}
                            {download.status === 'completed' && (
                              <Button
                                variant="outline"
                                size="sm" onClick={() => handleRetryDownload(download)}
                                disabled={retryingItems.has(download.id)}
                                className="hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 dark:hover:bg-blue-900/20 dark:hover:text-blue-300 dark:hover:border-blue-700/30 transition-colors"
                              >
                                <DownloadIcon className={`h-4 w-4 mr-2 ${retryingItems.has(download.id) ? 'animate-pulse' : ''}`} />
                                {retryingItems.has(download.id) ? 'Starting...' : 'Redownload'}
                              </Button>
                            )}
                            <Button
                              variant="outline"
                              size="sm" onClick={() => handleRemoveFromHistory(download.id)}
                              disabled={removingItems.has(download.id)}
                              className="hover:bg-red-50 hover:text-red-700 hover:border-red-200 dark:hover:bg-red-900/20 dark:hover:text-red-300 dark:hover:border-red-700/30 transition-colors"
                            >
                              <Trash2 className={`h-4 w-4 mr-2 ${removingItems.has(download.id) ? 'animate-pulse' : ''}`} />
                              {removingItems.has(download.id) ? 'Removing...' : 'Remove'}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (<Card className="border-border/30 bg-gradient-to-br from-card/80 via-card/60 to-card/40 backdrop-blur-xl relative before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/10 before:via-white/5 before:to-transparent before:pointer-events-none">
            <CardContent className="text-center py-20">
              <div className="space-y-8">
                <div className="relative mx-auto w-32 h-32">
                  <div className="absolute inset-0 bg-gradient-to-br from-red-100/80 to-red-50/40 dark:from-red-900/20 dark:to-red-900/10 rounded-3xl flex items-center justify-center backdrop-blur-sm border border-red-200/30 dark:border-red-700/20">
                    <Archive className="h-16 w-16 text-red-600 dark:text-red-400" />
                  </div>
                  <div className="absolute -inset-4 bg-gradient-to-r from-red-500/10 via-red-500/5 to-red-500/10 rounded-3xl blur-xl opacity-60 animate-pulse"></div>
                </div>
                <div className="space-y-4">
                  <h3 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                    {downloads.length === 0 ? 'No Download History' : 'No Downloads Match Your Filters'}
                  </h3>
                  <p className="text-lg text-muted-foreground max-w-md mx-auto leading-relaxed">
                    {downloads.length === 0
                      ? 'You haven\'t completed any downloads yet. Start downloading some videos to see them here.'
                      : searchTerm || statusFilter !== 'all'
                        ? 'No downloads match your current filters. Try adjusting your search or filter settings.'
                        : 'Your download history will appear here once you complete some downloads.'
                    }
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  {downloads.length === 0 && (
                    <Button
                      onClick={() => window.location.href = '/'}
                      className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 transition-all duration-300 px-8 py-6 text-md group"
                    >
                      <DownloadIcon className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                      Start Downloading
                    </Button>
                  )}
                  {(searchTerm || statusFilter !== 'all') && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSearchTerm('')
                        setStatusFilter('all')
                        setSortBy('date')
                      }}
                      className="bg-card/50 backdrop-blur-sm border-border/50 hover:bg-card/70 px-6 py-6 text-md"
                    >
                      Clear Filters
                    </Button>
                  )}                </div>
              </div>
            </CardContent>
          </Card>
          )}
        </div>
      </div>
    </div>
  )
}
