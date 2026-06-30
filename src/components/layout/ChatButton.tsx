"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { MessageCircle, Sparkles, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Loader } from "@/components/loader-ui/loader"
import { aiSynthesize } from "@/lib/api/modelApi"
import type { SynthesizeResult } from "@/lib/api/modelApi"

export function ChatButton() {
  const [open, setOpen] = useState(false)
  const [text, setText] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const router = useRouter()

  useEffect(() => {
    if (open) {
      setText("")
      setError("")
      setTimeout(() => textareaRef.current?.focus(), 150)
    }
  }, [open])

  async function handleSubmit() {
    if (!text.trim()) return
    setLoading(true)
    setError("")
    try {
      const result = await aiSynthesize({ text: text.trim() })
      if (result && result.title) {
        sessionStorage.setItem("flowsign_synthesized", JSON.stringify(result))
        setOpen(false)
        router.push("/requests")
      } else {
        setError("Could not understand your request. Try being more specific.")
      }
    } catch {
      setError("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      void handleSubmit()
    }
  }

  return (
    <>
      <button
        aria-label={open ? "Close chat" : "Open chat"}
        onClick={() => setOpen(!open)}
        className="fixed bottom-4 right-4 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-brand-teal text-white shadow-lg transition-transform hover:scale-105 active:scale-95"
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>
      {open && (
        <div className="fixed bottom-20 right-4 z-50 flex w-80 flex-col gap-3 rounded-xl border border-[#E8E6DE] bg-white p-4 shadow-xl">
          <div className="flex items-center gap-2">
            <Sparkles size={15} className="text-brand-teal" />
            <span className="text-[13px] font-semibold text-[#2C2C2A]">Describe your request</span>
          </div>
          <p className="text-[11px] text-[#B4B2A9]">
            Tell us what you need in plain English. We&apos;ll pre-fill the form.
          </p>
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder='e.g. "I need $200 for office supplies"'
            disabled={loading}
            rows={3}
            className="min-h-[72px] w-full resize-y rounded-[8px] border border-[#D3D1C7] bg-white px-3 py-2 text-[13px] text-[#2C2C2A] placeholder:text-[#B4B2A9] outline-none transition-colors focus:border-brand-teal-mid focus:ring-2 focus:ring-brand-teal-pale disabled:cursor-not-allowed disabled:bg-[#F6F4EF]"
          />
          {error && (
            <p className="text-[11px] font-medium text-brand-danger-text">{error}</p>
          )}
          <div className="flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setOpen(false)}
              disabled={loading}
              className="h-8 rounded-[8px] border-[#E8E6DE] text-[11px]"
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleSubmit}
              disabled={!text.trim() || loading}
              className="h-8 rounded-[8px] bg-brand-teal px-3 text-[11px] font-semibold text-white hover:bg-[#0c5e49]"
            >
              {loading ? (
                <><Loader className="mr-1 h-3 w-3" /> Generating…</>
              ) : (
                <><Sparkles size={12} className="mr-1" /> Generate</>
              )}
            </Button>
          </div>
        </div>
      )}
    </>
  )
}
