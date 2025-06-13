"use client"

import { useEffect, useState, useCallback } from 'react'
import Image from 'next/image'
import { Navigation } from '@/components/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { History, Search, Download as DownloadIcon, Calendar, HardDrive, Filter } from 'lucide-react'
import type { Download } from '@/lib/db/schema'

export default function HistoryPage() {
  const [downloads, setDownloads] = useState<Download[]>([])
  const [filteredDownloads, setFilteredDownloads] = useState<Download[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortBy, setSortBy] = useState('date')

  useEffect(() => {
    fetchDownloads()
  }, [])

  const filterAndSortDownloads = useCallback(() => {
    let filtered = downloads

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
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200'
      case 'downloading': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'failed': return 'bg-red-100 text-red-800 border-red-200'
      case 'paused': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'cancelled': return 'bg-gray-100 text-gray-800 border-gray-200'
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

  const handleRedownload = async (download: Download) => {
    // TODO: Implement redownload functionality
    console.log('Redownload:', download)
  }

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
          <div className="flex items-center gap-4 mb-6">
            <History className="h-6 w-6" />
            <h1 className="text-2xl font-bold">Download History</h1>
          </div>

          {/* Filters and Search */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Search</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search videos..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Status</label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                      <SelectItem value="downloading">Downloading</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Sort By</label>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="date">Date</SelectItem>
                      <SelectItem value="title">Title</SelectItem>
                      <SelectItem value="size">File Size</SelectItem>
                      <SelectItem value="quality">Quality</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-end">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchTerm('')
                      setStatusFilter('all')
                      setSortBy('date')
                    }}
                    className="w-full"
                  >
                    Clear Filters
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Results Summary */}
          <div className="mb-4 text-sm text-muted-foreground">
            Showing {filteredDownloads.length} of {downloads.length} downloads
          </div>

          {/* Downloads List */}
          {filteredDownloads.length > 0 ? (
            <div className="space-y-4">
              {filteredDownloads.map((download) => (
                <Card key={download.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-4">                          {download.thumbnailUrl && (
                          <div className="flex-shrink-0">
                            <Image
                              src={download.thumbnailUrl}
                              alt={download.title}
                              width={96}
                              height={64}
                              className="object-cover rounded-lg"
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
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              {download.downloadedAt && (
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {new Date(download.downloadedAt).toLocaleDateString()} {new Date(download.downloadedAt).toLocaleTimeString()}
                                </div>
                              )}
                              {download.duration && (
                                <div>
                                  Duration: {Math.floor(download.duration / 60)}:{(download.duration % 60).toString().padStart(2, '0')}
                                </div>
                              )}
                            </div>
                            {download.errorMessage && (
                              <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                                Error: {download.errorMessage}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        {download.status === 'completed' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRedownload(download)}
                          >
                            <DownloadIcon className="h-3 w-3 mr-1" />
                            Redownload
                          </Button>
                        )}
                        {download.status === 'failed' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRedownload(download)}
                          >
                            Retry
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <History className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  {downloads.length === 0 ? 'No downloads yet' : 'No downloads match your filters'}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {downloads.length === 0
                    ? 'Start by entering a YouTube URL on the home page'
                    : 'Try adjusting your search terms or filters'
                  }
                </p>
                {downloads.length === 0 && (
                  <Button onClick={() => window.location.href = '/'}>
                    Start Downloading
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
