"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Download, History, Home } from 'lucide-react'
import { ModeToggle } from './mode-toggle'
import Image from 'next/image'

export function Navigation() {
  const pathname = usePathname()
  const navigation = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Downloads', href: '/downloads', icon: Download },
    { name: 'History', href: '/history', icon: History },
  ]

  return (
    <header className="sticky-nav">
      <div className="container flex h-16 items-center px-4">
        <div className="mr-4 flex">
          <Link href="/" className="mr-6 flex items-center space-x-2 group">
            <Image src="/logo.png" alt="Nazzel Icon" width={46} height={46} />
            <span className="font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Nazzel
            </span>
          </Link>
        </div>
        <nav className="flex w-fit items-center space-x-2 text-sm font-medium">
          {navigation.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 hover:bg-muted/80 ${isActive
                  ? 'text-primary bg-primary/10 border border-primary/20'
                  : 'text-muted-foreground hover:text-foreground'
                  }`}
              >
                <Icon className="h-4 w-4" />
                <span>{item.name}</span>
              </Link>
            )
          })}
        </nav>
        <div className="ml-auto flex items-center space-x-4">
          <Link
            href="https://github.com/KareemAdelAwwad/youtube-downloader"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center h-9 w-9 rounded-lg bg-transparent hover:bg-muted/80 transition-colors"
            aria-label="View source on GitHub"
          >
            <svg
              className="h-4 w-4"
              fill="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                clipRule="evenodd"
              />
            </svg>
          </Link>
          <ModeToggle />
        </div>
      </div>
    </header>
  )
}
