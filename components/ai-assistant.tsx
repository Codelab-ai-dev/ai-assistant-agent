"use client"

import { useState, useEffect, useRef, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send } from "lucide-react"
import { bot } from "../actions/bot-actions"
import { useActionState } from "react"
import { useTheme } from "next-themes"
import { ThemeToggle } from "./theme-toggle"

interface ChatbotProps {
  onClose: () => void
}

export function Chatbot({ onClose }: ChatbotProps) {
  const [messages, setMessages] = useState<{ role: "user" | "bot"; content: string }[]>([])
  const [state, dispatch] = useActionState(bot, { errors: [], success: "" })
  const scrollRef = useRef<HTMLDivElement>(null)
  const [isPending, startTransition] = useTransition()
  const { theme } = useTheme()


  // Cuando se recibe una nueva respuesta, se agrega al historial
  useEffect(() => {
    if (state.success) {
      setMessages((prev) => [...prev, { role: "bot", content: state.success }])
    }
  }, [state.success])

  // Scroll automático al final del chat cuando hay nuevos mensajes
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isPending]) // Agregar `isPending` para actualizar el scroll también cuando está pensando

  // Manejar el envío del formulario manualmente
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const message = formData.get("message") as string

    if (!message.trim()) return // Evitar mensajes vacíos

    setMessages((prev) => [...prev, { role: "user", content: message }])
    event.currentTarget.reset() // Limpiar el input después de enviar

    startTransition(() => {
      dispatch(formData)
    })
  }

  return (
    <Card className="w-full max-w-3xl mx-auto shadow-lg">
      <CardHeader className="border-b bg-primary/5">
      <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div>
              <CardTitle className="text-xl">Asistente Virtual</CardTitle>
              <CardDescription>Información en tiempo real sobre productos y servicios</CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-sm text-muted-foreground">Tema actual: {theme}</div>
            <ThemeToggle />
          </div>
        </div>
      </CardHeader>
      <ScrollArea className="h-[500px] p-4">
      <CardContent className="flex-grow">
        
          <div className="flex flex-col space-y-2">
            {messages.map((m, index) => (
              <div
                key={index}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <span
                  className={`inline-block p-2 rounded-lg max-w-xs ${
                    m.role === "user"
                      ? "bg-primary/5 text-current self-end"
                      : "bg-primary/20 self-start"
                  }`}
                >
                  {m.content}
                </span>
              </div>
            ))}
            {isPending && (
              <div className="flex justify-start">
                <span className="inline-block p-2 rounded-lg bg-gray-700 text-gray-100">
                  Pensando...
                </span>
              </div>
            )}
            <div ref={scrollRef} /> {/* Elemento invisible para forzar el scroll hacia abajo */}
          </div>
      </CardContent>
      </ScrollArea>
      <CardFooter>
        <form onSubmit={handleSubmit} className="flex w-full space-x-2">
          <Input
            name="message"
            placeholder="Escribe un mensaje..."
            className="flex-1"
            autoComplete="off"
          />
          <Button type="submit" size="icon" disabled={isPending}>
            {/*{isPending ? "..." : "Enviar"}*/}
            <Send className="h-4 w-4" />
            <span className="sr-only">Enviar mensaje</span>
          </Button>
        </form>
      </CardFooter>
    </Card>
  )
}