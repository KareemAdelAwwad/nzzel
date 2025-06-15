"use client"

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>YouTube Downloader</span>
            <span>•</span>
            <span>Open Source</span>
          </div>
          <div className="text-sm text-muted-foreground">
            © {currentYear} YouTube Downloader. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  )
}
