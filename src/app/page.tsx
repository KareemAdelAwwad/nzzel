import { UrlInput } from '@/components/url-input'
import { Download, Zap, History, Play, Music, Settings } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-full bg-gradient-to-br from-background via-background to-primary/5 relative overflow-hidden">
      {/* Enhanced animated background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]" />
        <div className="absolute h-full w-full bg-gradient-to-br from-primary/8 via-transparent to-primary/12" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary/30 rounded-full blur-3xl opacity-30 animate-pulse"></div>
      </div>

      <div className="relative container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Enhanced Hero Section */}
          <div className="text-center mb-16 space-y-8">
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-purple-50 to-primary/10 dark:from-blue-900/30 dark:to-primary/20 text-purple-700 dark:text-purple-300 rounded-full text-sm font-medium border border-blue-200/50 dark:border-purple-700/30 backdrop-blur-sm">
              <Zap className="h-4 w-4" />
              Nazzel
            </div>
            <div className="space-y-6">
              <h1 className="text-6xl md:text-7xl font-bold tracking-tight">
                <span className="bg-gradient-to-br via-primary to-foreground bg-clip-text text-transparent">
                  Download YouTube
                </span>
                <span className="block mt-2 bg-gradient-to-tl via-primary to-foreground bg-clip-text text-transparent">
                  Videos & Playlists
                </span>
              </h1>
            </div>
          </div>

          {/* Enhanced URL Input Section */}
          <div className="mb-32">
            <UrlInput />
          </div>

          {/* Enhanced Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
            <div className="group p-8 rounded-3xl bg-card/60 backdrop-blur-md border border-border/30 hover:border-primary/30 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-1">
              <div className="w-16 h-16 mb-6 bg-gradient-to-br from-primary to-primary/80 rounded-3xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg">
                <Play className="w-8 h-8 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-bold mb-4 group-hover:text-primary transition-colors">Multiple Formats</h3>
              <p className="text-muted-foreground leading-relaxed">
                Download in various qualities from 144p to 4K. Choose MP4 for video or MP3 for audio-only downloads.
              </p>
            </div>

            <div className="group p-8 rounded-3xl bg-card/60 backdrop-blur-md border border-border/30 hover:border-blue-300/30 transition-all duration-500 hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-1">
              <div className="w-16 h-16 mb-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-4 group-hover:text-blue-600 transition-colors">Lightning Fast</h3>
              <p className="text-muted-foreground leading-relaxed">
                Real-time progress tracking with download speed, ETA, and completion status for all your downloads.
              </p>
            </div>

            <div className="group p-8 rounded-3xl bg-card/60 backdrop-blur-md border border-border/30 hover:border-emerald-300/30 transition-all duration-500 hover:shadow-2xl hover:shadow-emerald-500/10 hover:-translate-y-1">
              <div className="w-16 h-16 mb-6 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-3xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg">
                <History className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-4 group-hover:text-emerald-600 transition-colors">Smart History</h3>
              <p className="text-muted-foreground leading-relaxed">
                Complete download history with search, filtering, and one-click re-download capabilities.
              </p>
            </div>

            <div className="group p-8 rounded-3xl bg-card/60 backdrop-blur-md border border-border/30 hover:border-purple-300/30 transition-all duration-500 hover:shadow-2xl hover:shadow-purple-500/10 hover:-translate-y-1">
              <div className="w-16 h-16 mb-6 bg-gradient-to-br from-purple-500 to-purple-600 rounded-3xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg">
                <Download className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-4 group-hover:text-purple-600 transition-colors">Playlist Support</h3>
              <p className="text-muted-foreground leading-relaxed">
                Download entire playlists or select specific videos. Batch operations with progress tracking.
              </p>
            </div>

            <div className="group p-8 rounded-3xl bg-card/60 backdrop-blur-md border border-border/30 hover:border-rose-300/30 transition-all duration-500 hover:shadow-2xl hover:shadow-rose-500/10 hover:-translate-y-1">
              <div className="w-16 h-16 mb-6 bg-gradient-to-br from-rose-500 to-rose-600 rounded-3xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg">
                <Music className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-4 group-hover:text-rose-600 transition-colors">Audio Extraction</h3>
              <p className="text-muted-foreground leading-relaxed">
                Extract high-quality audio in MP3 format. Perfect for music, podcasts, and audio content.
              </p>
            </div>

            <div className="group p-8 rounded-3xl bg-card/60 backdrop-blur-md border border-border/30 hover:border-amber-300/30 transition-all duration-500 hover:shadow-2xl hover:shadow-amber-500/10 hover:-translate-y-1">
              <div className="w-16 h-16 mb-6 bg-gradient-to-br from-amber-500 to-amber-600 rounded-3xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg">
                <Settings className="w-8 h-8 text-white" />              </div>
              <h3 className="text-xl font-bold mb-4 group-hover:text-amber-600 transition-colors">Advanced Options</h3>
              <p className="text-muted-foreground leading-relaxed">
                Custom output paths, format selection, and quality preferences. Full control over your downloads.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
