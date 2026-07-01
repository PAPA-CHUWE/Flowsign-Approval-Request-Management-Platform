"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { MessageCircle, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Loader } from "@/components/loader-ui/loader"
import { aiSynthesize } from "@/lib/api/modelApi"
import type { SynthesizeResult } from "@/lib/api/modelApi"

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

const mockSynthesize = (text: string): SynthesizeResult => {
  const match = MOCK_SYNTHESIZE_PATTERNS.find((p) => p.pattern.test(text)) ?? MOCK_SYNTHESIZE_PATTERNS[MOCK_SYNTHESIZE_PATTERNS.length - 1]
  const amount = extractAmount(text)
  const location = extractLocation(text)
  const hasFinance = /finance|payment|budget|invoice|expense|for\s+\d+/i.test(text) || amount !== null

  const suggestedFields: Record<string, string | number> = {}
  if (amount) suggestedFields.amount = amount
  if (location) suggestedFields.location = location

  return {
    title: text,
    description: `I am requesting approval for ${text.toLowerCase()}. This request is being submitted to support ongoing operational activities within the organization.`,
    request_type_key: hasFinance ? "finance" : match.type,
    priority: /urgent|asap|immediately|critical|emergency/i.test(text) ? "urgent" : "normal",
    department: null,
    suggested_fields: suggestedFields,
    recommended_approver: hasFinance ? "finance" : match.approver,
    backup_approver: "manager",
  }
}

export function ChatButton() {
  const [open, setOpen] = useState(false)
  const [text, setText] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const router = useRouter()

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setText("")
      setError("")
      // eslint-disable-next-line @eslint-react/hooks/set-state-in-effect
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
        const mock = mockSynthesize(text.trim())
        sessionStorage.setItem("flowsign_synthesized", JSON.stringify(mock))
        setOpen(false)
        router.push("/requests")
      }
    } catch {
      const mock = mockSynthesize(text.trim())
      sessionStorage.setItem("flowsign_synthesized", JSON.stringify(mock))
      setOpen(false)
      router.push("/requests")
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
      <Button
        aria-label="Open chat"
        onClick={() => setOpen(true)}
        className="fixed bottom-4 right-4 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-brand-teal text-white shadow-lg transition-transform hover:scale-105 active:scale-95"
      >
        <MessageCircle className="h-6 w-6" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-[15px]">
              <Sparkles size={16} className="text-brand-teal" />
              Describe your request
            </DialogTitle>
            <DialogDescription className="text-[13px]">
              Tell us what you need in plain English. We&apos;ll pre-fill the form.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-3">
            <Textarea
              ref={textareaRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder='e.g. "I need $200 for office supplies"'
              disabled={loading}
              rows={4}
            />

            {error && (
              <p className="text-[12px] font-medium text-brand-danger-text">{error}</p>
            )}

            <div className="flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={!text.trim() || loading}
              >
                {loading ? (
                  <><Loader className="mr-1.5 h-4 w-4" /> Generating…</>
                ) : (
                  <><Sparkles size={14} className="mr-1.5" /> Generate</>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}