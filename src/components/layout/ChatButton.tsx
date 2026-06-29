"use client"

import { useState } from "react"
import { MessageCircle, X } from "lucide-react"

export function ChatButton() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        aria-label={open ? "Close chat" : "Open chat"}
        onClick={() => setOpen(!open)}
        className="fixed bottom-4 right-4 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105 active:scale-95"
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>
      {open && (
        <div className="fixed bottom-20 right-4 z-50 h-96 w-80 rounded-lg border bg-background shadow-xl">
          {/* Chat content */}
        </div>
      )}
    </>
  )
}
