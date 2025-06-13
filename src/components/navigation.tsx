"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Download, History, Home } from 'lucide-react'
import { ModeToggle } from './mode-toggle'

export function Navigation() {
  const pathname = usePathname()

  const navigation = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Downloads', href: '/downloads', icon: Download },
    { name: 'History', href: '/history', icon: History },
  ]

  return (
    <header className="border-b">
      <div className="container flex h-16 items-center px-4">
        <div className="mr-4 flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <Download className="h-6 w-6" />
            <span className="font-bold">YouTube Downloader</span>
          </Link>
        </div>
        <nav className="flex items-center space-x-6 text-sm font-medium">
          {navigation.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center space-x-2 transition-colors hover:text-foreground/80 ${pathname === item.href
                    ? 'text-foreground'
                    : 'text-foreground/60'
                  }`}
              >
                <Icon className="h-4 w-4" />
                <span>{item.name}</span>
              </Link>
            )
          })}
        </nav>
        <div className="ml-auto flex items-center space-x-4">
          <ModeToggle />
        </div>
      </div>
    </header>
  )
}
