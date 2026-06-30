"use client"

import { useState, useRef, useEffect } from "react"
import { MessageSquare, Send, Sparkles, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { aiSynthesize } from "@/lib/api/modelApi"
import type { SynthesizeResult } from "@/lib/api/modelApi"
import { Loader } from "@/components/loader-ui/loader"

interface SynthesizeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onComplete: (result: SynthesizeResult) => void
}

export function SynthesizeDialog({ open, onOpenChange, onComplete }: SynthesizeDialogProps) {
  const [text, setText] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (open) {
      setText("")
      setError("")
      setTimeout(() => textareaRef.current?.focus(), 100)
    }
  }, [open])

  async function handleSubmit() {
    if (!text.trim()) return
    setLoading(true)
    setError("")
    try {
      const result = await aiSynthesize({ text: text.trim() })
      if (result && result.title) {
        onComplete(result)
        onOpenChange(false)
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-[15px]">
            <MessageSquare size={16} className="text-brand-teal" />
            Describe your request
          </DialogTitle>
          <DialogDescription className="text-[13px]">
            Tell us what you need in plain English. The AI will pre-fill the
            form for you.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3">
          <Textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder='e.g. "I need $200 for office supplies" or "Requesting a MacBook Pro for the new backend engineer starting Monday"'
            disabled={loading}
            rows={4}
            className="min-h-[100px] rounded-[8px] border-[#E8E6DE] bg-[#FAFAF8] text-[13px] placeholder:text-[#B4B2A9] focus-visible:border-brand-teal-mid focus-visible:bg-white focus-visible:ring-2 focus-visible:ring-brand-teal-pale resize-y"
          />

          {error && (
            <p className="text-[12px] font-medium text-brand-danger-text">{error}</p>
          )}

          <div className="flex items-center justify-between">
            <p className="text-[11px] text-[#B4B2A9]">
              Press <kbd className="rounded border border-[#E8E6DE] bg-[#FAFAF8] px-1.5 py-0.5 font-mono text-[10px]">Enter</kbd> to submit
            </p>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
                className="h-9 rounded-[8px] border-[#E8E6DE] text-[12px]"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={!text.trim() || loading}
                className="h-9 rounded-[8px] bg-brand-teal px-4 text-[12px] font-semibold text-white hover:bg-[#0c5e49]"
              >
                {loading ? (
                  <>
                    <Loader className="mr-1.5 h-3.5 w-3.5" />
                    Synthesizing…
                  </>
                ) : (
                  <>
                    <Sparkles size={14} className="mr-1.5" />
                    Generate
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
