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

// Backend request types: general, funds, finance, travel, asset, access, hr, vehicle
const MOCK_SYNTHESIZE_PATTERNS: Array<{ pattern: RegExp; type: string; approver: string }> = [
  { pattern: /(leave|vacation|pto|sick|time.?off)/i, type: "hr", approver: "hr" },
  { pattern: /(procure|purchase|buy|order|vendor|quote)/i, type: "general", approver: "manager" },
  { pattern: /(laptop|macbook|monitor|equipment|hardware|software|computer)/i, type: "asset", approver: "it_admin" },
  { pattern: /(budget|fund|finance|payment|invoice|expense)/i, type: "finance", approver: "finance" },
  { pattern: /(facility|office|desk|maintenance|repair|cleaning)/i, type: "general", approver: "manager" },
  { pattern: /(hiring|recruit|onboard|contract|employee)/i, type: "hr", approver: "hr" },
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

const DESCRIPTION_TEMPLATES: Record<string, string> = {
  travel: "This request is for {title}. The purpose of this travel is to conduct business activities that require an on-site presence, including stakeholder meetings, operational assessments, or client engagement. Approval is requested to authorize travel arrangements and associated expenses in accordance with the organisation's travel policy. This travel is expected to support business continuity and operational objectives.",
  finance: "This request pertains to {title}. The funds are required to support operational financial commitments within the organisation. Approval is requested to facilitate the processing of this financial obligation in accordance with the organisation's financial governance framework. Timely approval will ensure continued operational stability.",
  asset: "This request is for {title}. The item is required to support operational effectiveness and maintain productivity within the team. Approval is requested to authorise the acquisition or allocation of this resource. This will enable the team to perform their duties efficiently.",
  hr: "This request concerns {title}. The purpose of this request is to facilitate personnel-related administration in line with organisational policy. Approval is requested to ensure compliance with established human resource procedures. Timely processing will support workforce planning and operational requirements.",
  access: "This request is for {title}. The access or permission is required to enable the individual to perform their job responsibilities effectively. Approval is requested to authorise this access in accordance with the organisation's security and access control policies. This will support operational workflow and role-based requirements.",
  general: "This request concerns {title}. The purpose of this request is to address an operational requirement within the organisation. Approval is requested to proceed with the outlined activity in accordance with standard operating procedures. This will support the organisation's ongoing business activities and service delivery.",
  funds: "This request is for {title}. The funds are required to support operational expenditure within the approved budget framework. Approval is requested to release the necessary funds in accordance with financial controls. This will enable the organisation to meet its operational commitments.",
  vehicle: "This request concerns {title}. The vehicle or transport resource is required to support operational mobility and field-based activities. Approval is requested to authorise the allocation or use of this resource. This will support the organisation's logistical and operational requirements.",
}

function makeDescription(title: string, typeKey: string): string {
  const template = DESCRIPTION_TEMPLATES[typeKey] ?? DESCRIPTION_TEMPLATES.general
  return template.replace("{title}", title.toLowerCase())
}

function mockSynthesize(text: string): SynthesizeResult {
  const cleaned = cleanText(text)
  const match = MOCK_SYNTHESIZE_PATTERNS.find((p) => p.pattern.test(cleaned)) ?? { pattern: /.*/, type: "general", approver: "manager" }
  const amount = extractAmount(cleaned)
  const location = extractLocation(cleaned)
  const hasFinance = /finance|payment|budget|invoice|expense|for\s+\d+/i.test(cleaned) || amount !== null

  const suggestedFields: Record<string, string | number> = {}
  if (amount) suggestedFields.amount = amount
  if (location) suggestedFields.location = location

  const shortTitle = cleaned.length > 60 ? cleaned.slice(0, 60).replace(/\s+\S*$/, "") : cleaned

  const typeKey = hasFinance ? "finance" : match.type

  return {
    title: shortTitle,
    description: makeDescription(shortTitle, typeKey),
    request_type_key: typeKey,
    priority: /urgent|asap|immediately|critical|emergency/i.test(cleaned) ? "urgent" : "normal",
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