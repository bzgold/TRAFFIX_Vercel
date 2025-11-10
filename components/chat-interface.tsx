"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Send, Navigation, User, Briefcase, FlaskConical } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { sendChatMessage } from "@/lib/api-client"
import { useTraffixContext } from "@/lib/traffix-context"

type Persona = "executive" | "manager" | "analyst"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
}

export function ChatInterface() {
  const { region, timePeriod, customDateRange } = useTraffixContext()
  const [inputValue, setInputValue] = useState("")
  const [persona, setPersona] = useState<Persona>("manager")
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (inputValue.trim() && !isLoading) {
      const userMessage: Message = {
        id: Date.now().toString(),
        role: "user",
        content: inputValue
      }
      
      setMessages(prev => [...prev, userMessage])
      setInputValue("")
      setIsLoading(true)

      try {
        const response = await sendChatMessage(
          inputValue,
          persona,
          region,
          timePeriod,
          timePeriod === 'CUSTOM' ? customDateRange.start : undefined,
          timePeriod === 'CUSTOM' ? customDateRange.end : undefined
        )

        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: response.response
        }

        setMessages(prev => [...prev, assistantMessage])
      } catch (error) {
        console.error('Chat error:', error)
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "I apologize, but I encountered an error. Please try again."
        }
        setMessages(prev => [...prev, errorMessage])
      } finally {
        setIsLoading(false)
      }
    }
  }

  const quickQuestions = [
    "Why are total trips below forecast?",
    "What is the worst event type right now?",
    "What is changing traveler behavior this period?",
  ]

  const prefetchQuestions = [
    "Why are total trips below forecast?",
    "What is the worst event type right now?",
    "What is changing traveler behavior this period?"
  ]

  const prefetchedKeys = useRef<Set<string>>(new Set())

  useEffect(() => {
    const startDate = timePeriod === "CUSTOM" ? customDateRange.start : undefined
    const endDate = timePeriod === "CUSTOM" ? customDateRange.end : undefined
    const keyParts = [region, timePeriod, startDate ?? "", endDate ?? ""]
    const cacheKey = keyParts.join("|")

    if (prefetchedKeys.current.has(cacheKey)) {
      return
    }

    let isCancelled = false

    async function prefetch() {
      try {
        for (const question of prefetchQuestions) {
          if (isCancelled) break
          await sendChatMessage(
            question,
            "analyst",
            region,
            timePeriod,
            startDate,
            endDate
          )
        }
        if (!isCancelled) {
          prefetchedKeys.current.add(cacheKey)
        }
      } catch (error) {
        console.warn("Prefetch chat cache failed:", error)
      }
    }

    prefetch()

    return () => {
      isCancelled = true
    }
  }, [region, timePeriod, customDateRange.start, customDateRange.end])

  const personas = [
    { id: "executive" as Persona, label: "Quick & High Level", icon: Briefcase, desc: "2-4 sentence summaries" },
    { id: "manager" as Persona, label: "Quick Insights", icon: User, desc: "Bullets & paragraphs" },
    { id: "analyst" as Persona, label: "Deep Research", icon: FlaskConical, desc: "Comprehensive analysis" },
  ]

  return (
    <div className="flex flex-col h-full">
      <div className="mb-6 space-y-4">
        <div className="flex items-center gap-4 mb-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/80 shadow-lg shadow-primary/20">
            <Navigation className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-foreground">Ask the Analyst</h2>
            <p className="text-sm text-muted-foreground">AI-powered intelligence</p>
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-sm font-semibold text-foreground">Detail Level</label>
          <div className="grid grid-cols-3 gap-3">
            {personas.map((p) => {
              const Icon = p.icon
              return (
                <button
                  key={p.id}
                  onClick={() => setPersona(p.id)}
                  className={`flex flex-col items-center gap-2 rounded-lg border p-3 transition-all ${
                    persona === p.id
                      ? "bg-primary text-primary-foreground border-primary shadow-md"
                      : "bg-background hover:bg-accent hover:text-accent-foreground"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-xs font-medium">{p.label}</span>
                  <span className="text-[10px] opacity-70">{p.desc}</span>
                </button>
              )
            })}
          </div>
        </div>

        <div className="text-xs text-muted-foreground bg-muted/30 p-3 rounded-lg">
          <strong>Context:</strong> {region} • {timePeriod}
        </div>
      </div>

      <div className="flex-1 mb-6 space-y-4 overflow-y-auto max-h-[400px]">
        {messages.length === 0 ? (
          <div className="flex flex-col py-6">
            <p className="mb-5 text-sm text-muted-foreground">
              Ask questions about traffic patterns, incidents, and road conditions.
            </p>
            <div className="space-y-3">
              <p className="text-sm font-semibold text-foreground mb-3">Try asking:</p>
              {quickQuestions.map((question, i) => (
                <button
                  key={i}
                  onClick={() => setInputValue(question)}
                  className="w-full text-left rounded-lg border bg-background px-4 py-3 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`rounded-lg px-4 py-3 max-w-[90%] ${
                  message.role === "user"
                    ? "bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-md"
                    : "bg-muted text-foreground border"
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              </div>
            </div>
          ))
        )}
        {isLoading && (
          <div className="flex justify-start">
            <div className="rounded-lg bg-muted border px-4 py-3">
              <div className="flex gap-1">
                <div className="h-2 w-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="h-2 w-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="h-2 w-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-3">
        <Textarea
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Ask about traffic..."
          className="min-h-[90px] resize-none text-sm"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault()
              handleSubmit(e)
            }
          }}
          disabled={isLoading}
        />
        <Button
          type="submit"
          size="icon"
          className="h-[90px] w-[70px] shrink-0 bg-gradient-to-br from-primary to-primary/80 shadow-lg shadow-primary/20"
          disabled={!inputValue.trim() || isLoading}
        >
          <Send className="h-5 w-5" />
        </Button>
      </form>
    </div>
  )
}
