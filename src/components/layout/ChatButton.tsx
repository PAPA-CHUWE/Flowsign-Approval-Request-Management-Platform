"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { MessageCircle, Sparkles, FileText, BarChart3, Ticket, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Loader } from "@/components/loader-ui/loader"
import { aiSynthesize } from "@/lib/api/modelApi"
import type { SynthesizeResult } from "@/lib/api/modelApi"

const QUICK_ACTIONS = [
  { id: "create", label: "Create request", icon: Ticket, prompt: "I need to create a new approval request" },
  { id: "summary", label: "Get summary", icon: BarChart3, prompt: "Give me a summary of all my requests" },
  { id: "approvals", label: "My approvals", icon: Users, prompt: "Show me approvals waiting for me" },
  { id: "tickets", label: "View tickets", icon: FileText, prompt: "Show me all my tickets" },
]

// Backend request types: general, funds, finance, travel, asset, access, hr, vehicle
const MOCK_SYNTHESIZE_PATTERNS: Array<{ pattern: RegExp; type: string; approver: string }> = [
  { pattern: /(leave|vacation|pto|sick|time.?off)/i, type: "hr", approver: "hr" },
  { pattern: /(procure|purchase|buy|order|vendor|quote|supplies|office\s+supplies|merchandise)/i, type: "general", approver: "manager" },
  { pattern: /(laptop|macbook|monitor|hardware|software|computer|desktop|server|printer)/i, type: "asset", approver: "it_admin" },
  { pattern: /(budget|fund|finance|payment|invoice|expense|reimburse|billing|cost|usd|\$|zwg|rtgs)/i, type: "finance", approver: "finance" },
  { pattern: /(facility|office\s+space|desk|maintenance|repair|cleaning|furniture|workspace)/i, type: "general", approver: "manager" },
  { pattern: /(hiring|recruit|onboard|contract|employee|training)/i, type: "hr", approver: "hr" },
  { pattern: /(travel|flight|hotel|trip|conference|site\s*visit|bulawayo|harare)/i, type: "travel", approver: "manager" },
]

const cleanText = (text: string): string => {
  return text
    .replace(/\bvisiti\b/gi, "visit")
    .replace(/\breciept\b/gi, "receipt")
    .replace(/\breimbusement\b/gi, "reimbursement")
    .replace(/\bexpences\b/gi, "expenses")
    .replace(/\blaptp\b/gi, "laptop")
    .replace(/\bto\s+th\b/gi, "to")
}

const extractAmount = (text: string): number | null => {
  const patterns = [
    /\$(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/,
    /(\d{1,3}(?:,\d{3})*)\s*(dollars|usd)/i,
    /(\d{1,3}(?:,\d{3})*)\s*usd/i,
    /(\d{1,3}(?:,\d{3})*)\s*USD/i,
    /(\d+)\s*(zwg|rtgs)/i,
    /(\d+zwg|rtgs)/i,
    /(?<![a-zA-Z0-9])(\d{3,})(?![a-zA-Z0-9])/,
  ]
  for (const p of patterns) {
    const m = text.match(p)
    if (m) return parseFloat(m[1].replace(/[,zwgrtgsZWGRTGS]/g, ""))
  }
  return null
}

const extractLocation = (text: string): string | null => {
  const m = text.match(/\b(in|at|to)\s+(bulawayo|harare|mutare|gweru|kwekwe|kadoma|chinhoyi|masvingo)\b/i)
  return m ? m[2] : null
}

const mockSynthesize = (text: string): SynthesizeResult => {
  const cleaned = cleanText(text)
  const match = MOCK_SYNTHESIZE_PATTERNS.find((p) => p.pattern.test(cleaned)) ?? { pattern: /.*/, type: "general", approver: "manager" }
  const amount = extractAmount(cleaned)
  const location = extractLocation(cleaned)
  const hasFinance = /finance|payment|budget|invoice|expense|usd|\$|\s*zwg|\s*rtgs/i.test(cleaned) || amount !== null

  const suggestedFields: Record<string, string | number> = {}
  if (amount) suggestedFields.amount = amount
  if (location) suggestedFields.location = location

  // Build a cleaner title from the input
  const shortTitle = cleaned.length > 60 ? cleaned.slice(0, 60).replace(/\s+\S*$/, "") : cleaned

  return {
    title: shortTitle,
    description: `I am requesting approval for ${cleaned}. Please review and approve this request to facilitate the outlined business activities.`,
    request_type_key: hasFinance ? "finance" : match.type,
    priority: /urgent|asap|immediately|critical|emergency/i.test(cleaned) ? "urgent" : "normal",
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

  function handleQuickAction(actionId: string) {
    const action = QUICK_ACTIONS.find((a) => a.id === actionId)
    if (!action) return

    if (action.id === "summary") {
      setOpen(false)
      router.push("/dashboard")
      return
    }
    if (action.id === "approvals") {
      setOpen(false)
      router.push("/approvals")
      return
    }
    if (action.id === "tickets") {
      setOpen(false)
      router.push("/tickets")
      return
    }

    setText(action.prompt)
    textareaRef.current?.focus()
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
              What do you need help with?
            </DialogTitle>
            <DialogDescription className="text-[13px]">
              Pick a quick action or describe your request in plain English.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap gap-2">
              {QUICK_ACTIONS.map((action) => (
                <button
                  key={action.id}
                  type="button"
                  onClick={() => handleQuickAction(action.id)}
                  disabled={loading}
                  className="flex items-center gap-1.5 rounded-full border border-[#E8E6DE] bg-white px-3 py-1.5 text-[12px] font-medium text-[#5F5E5A] transition-colors hover:bg-[#F7F6F2] disabled:opacity-50"
                >
                  <action.icon size={13} />
                  {action.label}
                </button>
              ))}
            </div>

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