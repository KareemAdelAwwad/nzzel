"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Navigation } from '@/components/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ArrowLeft, Download, Loader2, Clock, Eye, ThumbsUp } from 'lucide-react'
import { toast } from 'sonner'
import type { VideoInfo, VideoFormat } from '@/lib/types/yt-dlp'
import { formatFileSize, getFormatNote } from '@/lib/types/yt-dlp'

export default function VideoOptionsPage() {
  const [videoData, setVideoData] = useState<VideoInfo | null>(null)
  const [originalUrl, setOriginalUrl] = useState('')
  const [selectedQuality, setSelectedQuality] = useState('best')
  const [audioOnly, setAudioOnly] = useState(false)
  const [outputPath, setOutputPath] = useState('')
  const [isDownloading, setIsDownloading] = useState(false)
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
      if (parsed.type !== 'video') {
        router.push('/')
        return
      }
      setVideoData(parsed.data)
      setOriginalUrl(url)
    } catch (error) {
      console.error('Failed to parse video data:', error)
      router.push('/')
    }
  }, [router])
  const formatDuration = (seconds: number): string => {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    if (h > 0) {
      return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
    }
    return `${m}:${s.toString().padStart(2, '0')}`
  }
  const getQualityOptions = (): VideoFormat[] => {
    if (!videoData?.formats) return []

    // Filter and sort video formats
    const videoFormats = videoData.formats
      .filter(f => f.vcodec !== 'none' && f.height && (f.filesize || f.filesize_approx))
      .sort((a, b) => (b.height || 0) - (a.height || 0))

    // Remove duplicates by height, keeping the one with best quality/codec
    const uniqueFormats = videoFormats.reduce((acc: VideoFormat[], format) => {
      const existing = acc.find(f => f.height === format.height);
      if (!existing) {
        acc.push(format);
      } else {
        // Replace if current format has better quality indicators
        const currentSize = format.filesize || format.filesize_approx || 0;
        const existingSize = existing.filesize || existing.filesize_approx || 0;
        if (currentSize > existingSize || format.tbr && format.tbr > (existing.tbr || 0)) {
          const index = acc.indexOf(existing);
          acc[index] = format;
        }
      }
      return acc;
    }, []);

    return uniqueFormats;
  }

  const handleStartDownload = async () => {
    if (!videoData) return

    setIsDownloading(true)

    try {
      const response = await fetch('/api/download', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }, body: JSON.stringify({
          url: originalUrl,
          videoId: videoData.id,
          title: videoData.title,
          quality: selectedQuality,
          audioOnly,
          outputPath: outputPath || undefined,
          thumbnailUrl: videoData.thumbnail,
          duration: videoData.duration,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to start download')
      }

      toast.success('Download started! Check the Downloads page for progress.')
      router.push('/downloads')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to start download')
    } finally {
      setIsDownloading(false)
    }
  }

  if (!videoData) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </main>
      </div>
    )
  }

  const qualityOptions = getQualityOptions()

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <Button variant="outline" onClick={() => router.back()}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <h1 className="text-2xl font-bold">Download Options</h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Video Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Video Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">                <div className="aspect-video relative rounded-lg overflow-hidden bg-muted">
                {videoData.thumbnail && (
                  <Image
                    src={videoData.thumbnail}
                    alt={videoData.title}
                    fill
                    className="object-cover"
                  />
                )}
              </div>

                <div>
                  <h3 className="font-semibold text-lg mb-2">{videoData.title}</h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    by {videoData.uploader}
                  </p>

                  <div className="flex flex-wrap gap-4 text-sm">
                    {videoData.duration && (
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {formatDuration(videoData.duration)}
                      </div>
                    )}
                    {videoData.view_count && (
                      <div className="flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        {videoData.view_count.toLocaleString()} views
                      </div>
                    )}
                    {videoData.like_count && (
                      <div className="flex items-center gap-1">
                        <ThumbsUp className="h-4 w-4" />
                        {videoData.like_count.toLocaleString()}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Download Options */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Download Settings</CardTitle>
                <CardDescription>
                  Choose your preferred format and quality settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Audio Only Toggle */}
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="audio-only">Audio Only</Label>
                    <p className="text-sm text-muted-foreground">
                      Extract audio track as MP3
                    </p>
                  </div>
                  <Switch
                    id="audio-only"
                    checked={audioOnly}
                    onCheckedChange={setAudioOnly}
                  />
                </div>

                <Separator />

                {!audioOnly && (
                  <>
                    {/* Quality Selection */}
                    <div className="space-y-2">
                      <Label>Video Quality</Label>
                      <Select value={selectedQuality} onValueChange={setSelectedQuality}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select quality" />
                        </SelectTrigger>                        <SelectContent>
                          <SelectItem value="best">Best Available Quality</SelectItem>
                          <SelectItem value="worst">Worst Available Quality</SelectItem>
                          {qualityOptions.map((format) => {
                            const fileSize = formatFileSize(format.filesize || format.filesize_approx);
                            const bitrate = format.tbr ? ` • ${format.tbr}kbps` : '';
                            const codec = format.vcodec && format.vcodec !== 'unknown' ? ` • ${format.vcodec.toUpperCase()}` : '';
                            return (
                              <SelectItem key={format.format_id} value={format.height?.toString() || ''}>
                                {format.height}p ({format.ext.toUpperCase()}) - {fileSize}{bitrate}{codec}
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    </div>

                    <Separator />
                  </>
                )}

                {/* Output Path */}
                <div className="space-y-2">
                  <Label htmlFor="output-path">Download Location (Optional)</Label>
                  <Input
                    id="output-path"
                    type="text"
                    placeholder="Default: Downloads folder"
                    value={outputPath}
                    onChange={(e) => setOutputPath(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Leave empty to use default Downloads folder
                  </p>
                </div>

                <Separator />

                {/* Download Button */}
                <Button
                  onClick={handleStartDownload}
                  disabled={isDownloading}
                  className="w-full"
                  size="lg"
                >
                  {isDownloading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Starting Download...
                    </>
                  ) : (
                    <>
                      <Download className="mr-2 h-4 w-4" />
                      Start Download
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Format Details */}
          {!audioOnly && qualityOptions.length > 0 && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-lg">Available Formats</CardTitle>
                <CardDescription>
                  All available video formats for this video
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {qualityOptions.slice(0, 5).map((format) => (
                    <div key={format.format_id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Badge variant="secondary">
                          {format.height}p
                        </Badge>                        <div>
                          <p className="font-medium">{getFormatNote(format)}</p>
                          <p className="text-sm text-muted-foreground">
                            {format.ext.toUpperCase()} • {format.vcodec} • {format.acodec}
                          </p>
                        </div>
                      </div>                      <div className="text-right">
                        <p className="font-medium">{formatFileSize(format.filesize || format.filesize_approx)}</p>
                        {format.tbr && (
                          <p className="text-sm text-muted-foreground">{format.tbr} kbps</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
