"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { ArrowLeft, Download, Loader2, PlayCircle, Clock, List } from 'lucide-react'
import { toast } from 'sonner'
import type { PlaylistInfo, VideoInfo, VideoFormat } from '@/lib/types/yt-dlp'
import { formatFileSize } from '@/lib/types/yt-dlp'

export default function PlaylistOptionsPage() {
  const [playlistData, setPlaylistData] = useState<PlaylistInfo | null>(null)
  const [selectedVideos, setSelectedVideos] = useState<Set<string>>(new Set())
  const [selectedQuality, setSelectedQuality] = useState('best')
  const [audioOnly, setAudioOnly] = useState(false)
  const [outputPath, setOutputPath] = useState('')
  const [isDownloading, setIsDownloading] = useState(false)
  const [expandedVideoId, setExpandedVideoId] = useState<string | null>(null)
  const [videoFormats, setVideoFormats] = useState<Record<string, VideoFormat[]>>({})
  const [loadingFormats, setLoadingFormats] = useState<Set<string>>(new Set())
  const router = useRouter()

  useEffect(() => {
    const data = sessionStorage.getItem('extractedData')
    const url = sessionStorage.getItem('originalUrl')

    if (!data || !url) {
      router.push('/')
      return
    }

    try {
      const parsed = JSON.parse(data)
      if (parsed.type !== 'playlist') {
        router.push('/')
        return
      } setPlaylistData(parsed.data)
      // Select all videos by default
      const allVideoIds = new Set<string>(parsed.data.entries.map((video: VideoInfo) => video.id))
      setSelectedVideos(allVideoIds)

      // Debug: Log thumbnail URLs
      if (process.env.NODE_ENV === 'development') {
        console.log('Playlist thumbnails:', parsed.data.entries.map((v: VideoInfo) => ({ id: v.id, title: v.title, thumbnail: v.thumbnail })))
      }
    } catch (error) {
      toast.error('Failed to parse playlist data')
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to parse playlist data:', error)
      }
      router.push('/')
    }
  }, [router])

  const handleVideoToggle = (videoId: string) => {
    const newSelected = new Set(selectedVideos)
    if (newSelected.has(videoId)) {
      newSelected.delete(videoId)
    } else {
      newSelected.add(videoId)
    }
    setSelectedVideos(newSelected)
  }

  const handleSelectAll = () => {
    if (!playlistData) return
    const allVideoIds = new Set<string>(playlistData.entries.map(video => video.id))
    setSelectedVideos(allVideoIds)
  }

  const handleSelectNone = () => {
    setSelectedVideos(new Set())
  }
  const formatDuration = (seconds: number): string => {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    if (h > 0) {
      return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
    }
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  const getBestThumbnail = (video: VideoInfo): string | null => {
    // Try thumbnails array first (prefer higher resolution)
    if (video.thumbnails && video.thumbnails.length > 0) {
      // Sort by resolution (width * height) and pick the best one that's reasonable size
      const sorted = video.thumbnails
        .filter(t => t.url)
        .sort((a, b) => {
          const aRes = (a.width || 0) * (a.height || 0)
          const bRes = (b.width || 0) * (b.height || 0)
          return bRes - aRes
        })

      // Prefer thumbnails around 320x240 or higher, but not too high
      const preferred = sorted.find(t => (t.width || 0) >= 320 && (t.width || 0) <= 640)
      if (preferred) return preferred.url

      // Otherwise, take the best available
      if (sorted.length > 0) return sorted[0].url
    }

    // Fallback to thumbnail field
    if (video.thumbnail) return video.thumbnail

    // Generate fallback YouTube thumbnail URL
    if (video.id) {
      return `https://i.ytimg.com/vi/${video.id}/mqdefault.jpg`
    } return null
  }

  const fetchVideoFormats = async (videoUrl: string, videoId: string) => {
    if (videoFormats[videoId] || loadingFormats.has(videoId)) return;

    setLoadingFormats(prev => new Set(prev).add(videoId));

    try {
      const response = await fetch('/api/formats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: videoUrl }),
      });

      if (response.ok) {
        const data = await response.json();
        setVideoFormats(prev => ({
          ...prev,
          [videoId]: data.formats
        }));
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to fetch video formats:', error);
      }
    } finally {
      setLoadingFormats(prev => {
        const newSet = new Set(prev);
        newSet.delete(videoId);
        return newSet;
      });
    }
  }

  const toggleVideoFormats = (video: VideoInfo) => {
    if (expandedVideoId === video.id) {
      setExpandedVideoId(null);
    } else {
      setExpandedVideoId(video.id);
      fetchVideoFormats(video.webpage_url, video.id);
    }
  }

  const handleStartDownloads = async () => {
    if (!playlistData || selectedVideos.size === 0) {
      toast.error('Please select at least one video to download')
      return
    }

    setIsDownloading(true)

    try {
      const selectedVideosList = playlistData.entries.filter(video =>
        selectedVideos.has(video.id)
      )

      // Start downloads for each selected video
      const downloadPromises = selectedVideosList.map(async (video) => {
        const response = await fetch('/api/download', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            url: video.webpage_url,
            videoId: video.id,
            title: video.title,
            quality: selectedQuality,
            audioOnly,
            outputPath: outputPath || undefined,
            thumbnailUrl: video.thumbnail,
            duration: video.duration,
          }),
        })

        if (!response.ok) {
          const data = await response.json()
          throw new Error(`Failed to start download for "${video.title}": ${data.error}`)
        }

        return response.json()
      })

      await Promise.all(downloadPromises)

      toast.success(`Started downloading ${selectedVideos.size} videos!`)
      router.push('/downloads')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to start downloads')
    } finally {
      setIsDownloading(false)
    }
  }
  if (!playlistData) {
    return (
      <div className="min-h-full bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-full bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <Button variant="outline" onClick={() => router.back()}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <h1 className="text-2xl font-bold">Playlist Download Options</h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Playlist Info */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <List className="h-5 w-5" />
                  Playlist Info
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg mb-2">{playlistData.title}</h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    by {playlistData.uploader}
                  </p>

                  <div className="flex items-center gap-2 text-sm mb-4">
                    <PlayCircle className="h-4 w-4" />
                    {playlistData.entries.length} videos
                  </div>

                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <Download className="h-4 w-4" />
                    {selectedVideos.size} selected
                  </div>
                </div>

                <Separator />

                {/* Download Options */}
                <div className="space-y-4">
                  <h4 className="font-semibold">Download Settings</h4>

                  {/* Audio Only Toggle */}
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="audio-only">Audio Only</Label>
                      <p className="text-xs text-muted-foreground">
                        Extract audio tracks as MP3
                      </p>
                    </div>
                    <Switch
                      id="audio-only"
                      checked={audioOnly}
                      onCheckedChange={setAudioOnly}
                    />
                  </div>

                  {!audioOnly && (
                    <div className="space-y-2">
                      <Label>Video Quality</Label>
                      <Select value={selectedQuality} onValueChange={setSelectedQuality}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select quality" />
                        </SelectTrigger>                        <SelectContent>
                          <SelectItem value="best">Best Available Quality (Highest resolution & bitrate)</SelectItem>
                          <SelectItem value="worst">Worst Available Quality (Lowest file size)</SelectItem>
                          <SelectItem value="720">720p HD (Good quality, ~500MB-1GB per hour)</SelectItem>
                          <SelectItem value="480">480p (Medium quality, ~200-400MB per hour)</SelectItem>
                          <SelectItem value="360">360p (Low quality, ~100-200MB per hour)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="output-path">Download Location</Label>
                    <Input
                      id="output-path"
                      type="text"
                      placeholder="Default: Downloads folder"
                      value={outputPath}
                      onChange={(e) => setOutputPath(e.target.value)}
                    />
                  </div>
                </div>

                <Separator />

                {/* Download Button */}
                <Button
                  onClick={handleStartDownloads}
                  disabled={isDownloading || selectedVideos.size === 0}
                  className="w-full"
                  size="lg"
                >
                  {isDownloading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Starting Downloads...
                    </>
                  ) : (
                    <>
                      <Download className="mr-2 h-4 w-4" />
                      Download {selectedVideos.size} Videos
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Video Selection */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Select Videos</CardTitle>
                <CardDescription>
                  Choose which videos from the playlist to download
                </CardDescription>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleSelectAll}>
                    Select All
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleSelectNone}>
                    Select None
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">                  {playlistData.entries.map((video, index) => (
                  <div key={video.id} className="flex items-start gap-3 p-3 border rounded-lg hover:bg-muted/50">
                    <Checkbox
                      checked={selectedVideos.has(video.id)}
                      onCheckedChange={() => handleVideoToggle(video.id)}
                      className="mt-1"
                    />

                    <div className="flex-1 min-w-0">                        <div className="flex items-start gap-3">                        <div className="flex-shrink-0 w-[120px] h-[68px] relative bg-muted rounded border">
                      {(() => {
                        const thumbnailUrl = getBestThumbnail(video)
                        return thumbnailUrl ? (
                          <>
                            <Image
                              src={thumbnailUrl}
                              alt={video.title}
                              width={120}
                              height={68}
                              className="object-cover rounded border w-full h-full"
                              unoptimized={true}
                              onError={(e) => {
                                if (process.env.NODE_ENV === 'development') {
                                  console.log('Image failed to load:', thumbnailUrl);
                                }
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                // Show fallback
                                const fallback = target.nextElementSibling as HTMLElement;
                                if (fallback) {
                                  fallback.style.display = 'flex';
                                }
                              }}
                              onLoad={() => {
                                if (process.env.NODE_ENV === 'development') {
                                  console.log('Image loaded successfully:', thumbnailUrl);
                                }
                              }}
                            />
                            <div className="absolute inset-0 hidden items-center justify-center bg-muted rounded border">
                              <PlayCircle className="h-6 w-6 text-muted-foreground" />
                            </div>
                          </>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <PlayCircle className="h-6 w-6 text-muted-foreground" />
                          </div>
                        )
                      })()}
                    </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm line-clamp-2 mb-1">
                          {video.title}
                        </h4>                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span>#{index + 1}</span>
                          {video.duration && (
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatDuration(video.duration)}
                            </div>
                          )}
                          {video.view_count && (
                            <span>{video.view_count.toLocaleString()} views</span>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleVideoFormats(video)}
                            className="h-6 px-2 text-xs"
                          >
                            {expandedVideoId === video.id ? 'Hide Formats' : 'Show Formats'}
                          </Button>
                        </div>

                        {expandedVideoId === video.id && (
                          <div className="mt-3 p-3 bg-muted/50 rounded border">
                            {loadingFormats.has(video.id) ? (
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Loading formats...
                              </div>
                            ) : videoFormats[video.id] ? (
                              <div className="space-y-2">
                                <h5 className="font-medium text-sm">Available Formats:</h5>
                                {videoFormats[video.id].slice(0, 4).map((format) => (
                                  <div key={format.format_id} className="flex items-center justify-between p-2 border rounded text-xs">
                                    <div className="flex items-center gap-2">
                                      <span className="font-medium">{format.height}p</span>
                                      <span className="text-muted-foreground">{format.ext.toUpperCase()}</span>
                                      {format.fps && format.fps > 30 && (
                                        <span className="text-muted-foreground">{format.fps}fps</span>
                                      )}
                                    </div>
                                    <div className="text-right">
                                      <div className="font-medium">{formatFileSize(format.filesize)}</div>
                                      {format.tbr && (
                                        <div className="text-muted-foreground">{format.tbr}kbps</div>
                                      )}
                                    </div>
                                  </div>
                                ))}
                                {videoFormats[video.id].length > 4 && (
                                  <p className="text-xs text-muted-foreground">
                                    And {videoFormats[video.id].length - 4} more formats...
                                  </p>
                                )}
                              </div>
                            ) : (
                              <p className="text-sm text-muted-foreground">Failed to load formats</p>
                            )}
                          </div>
                        )}
                      </div>                        </div>
                    </div>
                  </div>
                ))}                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
