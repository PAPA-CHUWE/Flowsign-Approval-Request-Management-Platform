"use client"

import { useState, useRef, useEffect } from "react"
import { MessageSquare, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { aiSynthesize } from "@/lib/api/modelApi"
import type { SynthesizeResult } from "@/lib/api/modelApi"
import { Loader } from "@/components/loader-ui/loader"

interface SynthesizeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onComplete: (result: SynthesizeResult) => void
}

const MOCK_SYNTHESIZE_PATTERNS: Array<{ pattern: RegExp; type: string; approver: string }> = [
  { pattern: /(leave|vacation|pto|sick|time.?off)/i, type: "leave", approver: "hr" },
  { pattern: /(procure|purchase|buy|order|vendor|quote)/i, type: "procurement", approver: "manager" },
  { pattern: /(laptop|macbook|monitor|equipment|hardware|software|computer)/i, type: "it_equipment", approver: "it_admin" },
  { pattern: /(budget|fund|finance|payment|invoice|expense)/i, type: "finance", approver: "finance" },
  { pattern: /(facility|office|desk|maintenance|repair|cleaning)/i, type: "facilities", approver: "manager" },
  { pattern: /(hiring|recruit|onboard|contract|employee)/i, type: "hr", approver: "hr" },
  { pattern: /(travel|flight|hotel|trip|conference|site\s*visit|bulawayo|harare)/i, type: "travel", approver: "manager" },
]

const extractAmount = (text: string): number | null => {
  const patterns = [
    /\$(\d+(?:,\d{3})*(?:\.\d{2})?)/,
    /(\d+)\s*(dollars|usd)/i,
    /(?<![a-zA-Z0-9])(\d{3,})(?![a-zA-Z0-9])/,
  ]
  for (const p of patterns) {
    const m = text.match(p)
    if (m) return parseFloat(m[1].replace(/,/g, ""))
  }
  return null
}

const extractLocation = (text: string): string | null => {
  const m = text.match(/\b(in|at|to)\s+(bulawayo|harare|mutare|gweru|kwekwe|kadoma|chinhoyi|masvingo)\b/i)
  return m ? m[2] : null
}

function mockSynthesize(text: string): SynthesizeResult {
  const match = MOCK_SYNTHESIZE_PATTERNS.find((p) => p.pattern.test(text)) ?? MOCK_SYNTHESIZE_PATTERNS[MOCK_SYNTHESIZE_PATTERNS.length - 1]
  const amount = extractAmount(text)
  const location = extractLocation(text)
  const hasFinance = /finance|payment|budget|invoice|expense|for\s+\d+/i.test(text) || amount !== null

  const suggestedFields: Record<string, string | number> = {}
  if (amount) suggestedFields.amount = amount
  if (location) suggestedFields.location = location

  return {
    title: text.length > 40 ? text.slice(0, 40) + "…" : text,
    description: `I am requesting approval for ${text.toLowerCase()}. This request is being submitted to support ongoing operational activities within the organization.`,
    request_type_key: hasFinance ? "finance" : match.type,
    priority: /urgent|asap|immediately|critical|emergency/i.test(text) ? "urgent" : "normal",
    department: null,
    suggested_fields: suggestedFields,
    recommended_approver: hasFinance ? "finance" : match.approver,
    backup_approver: "manager",
  }
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
      // eslint-disable-next-line @eslint-react/hooks/set-state-in-effect
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
        const mock = mockSynthesize(text.trim())
        onComplete(mock)
        onOpenChange(false)
      }
    } catch {
      const mock = mockSynthesize(text.trim())
      onComplete(mock)
      onOpenChange(false)
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
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder='e.g. "I need $200 for office supplies" or "Requesting a MacBook Pro for the new backend engineer starting Monday"'
            disabled={loading}
            rows={4}
            className="min-h-[100px] w-full resize-y rounded-[8px] border border-[#D3D1C7] bg-white px-3 py-2.5 text-[13px] text-[#2C2C2A] placeholder:text-[#B4B2A9] outline-none transition-colors focus:border-brand-teal-mid focus:ring-2 focus:ring-brand-teal-pale disabled:cursor-not-allowed disabled:bg-[#F6F4EF] disabled:opacity-60"
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