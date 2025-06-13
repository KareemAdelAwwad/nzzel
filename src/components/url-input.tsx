"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Loader2, Download } from 'lucide-react'
import { toast } from 'sonner'

export function UrlInput() {
  const [url, setUrl] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!url.trim()) {
      toast.error('Please enter a YouTube URL')
      return
    }

    // Basic YouTube URL validation
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/
    if (!youtubeRegex.test(url.trim())) {
      toast.error('Please enter a valid YouTube URL')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/extract', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: url.trim() }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to extract video information')
      }

      // Store the extracted data and navigate to options page
      sessionStorage.setItem('extractedData', JSON.stringify(data))
      sessionStorage.setItem('originalUrl', url.trim())

      if (data.type === 'playlist') {
        router.push('/options/playlist')
      } else {
        router.push('/options/video')
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5" />
          Enter YouTube URL
        </CardTitle>
        <CardDescription>
          Paste a YouTube video or playlist URL to get started
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="url">YouTube URL</Label>
            <Input
              id="url"
              type="url"
              placeholder="https://www.youtube.com/watch?v=..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={isLoading}
              className="w-full"
            />
          </div>
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading || !url.trim()}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Extracting Information...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Extract Video Information
              </>
            )}
          </Button>
        </form>

        <div className="mt-4 text-sm text-muted-foreground">
          <p className="font-medium mb-2">Supported URLs:</p>
          <ul className="space-y-1 text-xs">
            <li>• Single videos: https://www.youtube.com/watch?v=...</li>
            <li>• Short URLs: https://youtu.be/...</li>
            <li>• Playlists: https://www.youtube.com/playlist?list=...</li>
            <li>• Channel URLs with playlists</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
