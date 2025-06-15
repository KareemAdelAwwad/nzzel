"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Loader2, Link, Sparkles } from 'lucide-react'
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

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText()
      if (text) {
        setUrl(text)
        toast.success('URL pasted from clipboard')
      }
    } catch {
      toast.error('Failed to paste from clipboard')
    }
  }
  return (
    <div className="w-full max-w-4xl mx-auto">
      <Card className="relative overflow-hidden bg-gradient-to-br from-card/80 via-card/60 to-card/40 backdrop-blur-xl border-border/30 transition-all duration-500 before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/10 before:via-white/5 before:to-transparent before:pointer-events-none">
        {/* Enhanced decorative background */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-primary/10"></div>
        <div className="absolute -inset-20 bg-gradient-to-r from-primary/30 via-primary/10 to-primary/30 opacity-20 blur-3xl animate-pulse"></div>
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:30px_30px]"></div>

        <CardContent className="relative p-8 space-y-8">
          {/* Enhanced Header */}
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold bg-gradient-to-r via-primary to-foreground/80 bg-clip-text text-transparent">
              Extract Video Information
            </h2>
            <p className="text-muted-foreground text- leading-relaxed mx-auto">
              Enter any YouTube URL to get started with your download
            </p>
          </div>

          {/* Enhanced Input Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative group">
              <div className="relative">
                <Input
                  type="url"
                  placeholder="https://www.youtube.com/watch?v=... or youtu.be/..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  disabled={isLoading}
                  className="pl-12 pr-24 h-12 text-lg bg-background/60 border-border/50 focus:border-primary/50 focus:ring-primary/20 transition-all duration-300 backdrop-blur-sm"
                />
                <Link className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handlePaste}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-10 px-4 text-sm hover:bg-primary/10 rounded-lg font-medium transition-all duration-200"
                >
                  Paste
                </Button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-12 text-lg bg-primary/80 transition-all duration-300 group relative overflow-hidden"
              disabled={isLoading || !url.trim()}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              {isLoading ? (
                <>
                  <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                  Extracting Information...
                </>
              ) : (
                <>
                  <Sparkles className="mr-3 h-5 w-5 group-hover:scale-110 group-hover:rotate-12 transition-transform duration-300" />
                  Extract Video Information
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
