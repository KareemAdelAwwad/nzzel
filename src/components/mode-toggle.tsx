"use client"

import * as React from "react"
import { Moon, Sun, Monitor } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"

export function ModeToggle() {
  const { theme, setTheme } = useTheme()

  const cycleTheme = () => {
    switch (theme) {
      case "light":
        setTheme("dark")
        break
      case "dark":
        setTheme("system")
        break
      case "system":
      default:
        setTheme("light")
        break
    }
  }

  const getThemeLabel = () => {
    switch (theme) {
      case "light":
        return "Light mode"
      case "dark":
        return "Dark mode"
      case "system":
        return "System mode"
      default:
        return "Toggle theme"
    }
  }
  return (
    <Button
      variant="outline"
      size="icon"
      onClick={cycleTheme}
      className="relative overflow-hidden transition-all duration-300 hover:scale-105 active:scale-95 bg-background/60 backdrop-blur-sm border-border/50 hover:bg-muted/80"
      title={getThemeLabel()}
    >
      {/* Light theme icon */}
      <Sun className={`h-[1.2rem] w-[1.2rem] absolute transition-all duration-500 ease-in-out ${theme === "light"
        ? "rotate-0 scale-100 opacity-100"
        : "rotate-90 scale-0 opacity-0"
        }`} />

      {/* Dark theme icon */}
      <Moon className={`h-[1.2rem] w-[1.2rem] absolute transition-all duration-500 ease-in-out ${theme === "dark"
        ? "rotate-0 scale-100 opacity-100"
        : "-rotate-90 scale-0 opacity-0"
        }`} />

      {/* System theme icon */}
      <Monitor className={`h-[1.2rem] w-[1.2rem] absolute transition-all duration-500 ease-in-out ${theme === "system"
        ? "rotate-0 scale-100 opacity-100"
        : "rotate-180 scale-0 opacity-0"
        }`} />

      <span className="sr-only">{getThemeLabel()}</span>
    </Button>
  )
}
