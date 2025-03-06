"use client"

import { Chatbot } from "../components/ai-assistant"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

export default function Home() {
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()
  const [isOpen, setIsOpen] = useState(false)


  // Only show UI after mounting to avoid hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  // Add a manual theme toggle for testing
  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  if (!mounted) {
    return null
  }

  return (
    <main className="flex min-h-screen flex-col p-4">
      <div className="flex flex-col items-center justify-center flex-1 w-full">
        <div className="w-full max-w-3xl mx-auto mb-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Asistente de IA</h1>
        </div>
        <Chatbot onClose={() => setIsOpen(false)} />
      </div>
    </main>
  )
}

