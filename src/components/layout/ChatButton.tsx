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
  let t = text
  // Common typos
  t = t.replace(/\bvisiti\b/gi, "visit")
  t = t.replace(/\breciept\b/gi, "receipt")
  t = t.replace(/\breimbusement\b/gi, "reimbursement")
  t = t.replace(/\bexpences\b/gi, "expenses")
  t = t.replace(/\blaptp\b/gi, "laptop")
  t = t.replace(/\bbulawayoo\b/gi, "Bulawayo")
  t = t.replace(/\bbulwayo\b/gi, "Bulawayo")
  // Capitalize cities
  t = t.replace(/\bharare\b/gi, "Harare")
  t = t.replace(/\bgweru\b/gi, "Gweru")
  t = t.replace(/\bkwekwe\b/gi, "Kwekwe")
  t = t.replace(/\bmasvingo\b/gi, "Masvingo")
  t = t.replace(/\bmutare\b/gi, "Mutare")
  t = t.replace(/\bkadoma\b/gi, "Kadoma")
  t = t.replace(/\bchinhoyi\b/gi, "Chinhoyi")
  // Capitalize months
  t = t.replace(/\bjanuary\b/gi, "January")
  t = t.replace(/\bfebruary\b/gi, "February")
  t = t.replace(/\bmarch\b/gi, "March")
  t = t.replace(/\bapril\b/gi, "April")
  t = t.replace(/\bjune\b/gi, "June")
  t = t.replace(/\bjuly\b/gi, "July")
  t = t.replace(/\baugust\b/gi, "August")
  t = t.replace(/\bseptember\b/gi, "September")
  t = t.replace(/\boctober\b/gi, "October")
  t = t.replace(/\bnovember\b/gi, "November")
  t = t.replace(/\bdecember\b/gi, "December")
  // Clean up date artifacts
  t = t.replace(/\bto\s+th\b/gi, "to")
  t = t.replace(/\bth\s+(\d)/gi, "$1")
  return t.trim()
}

const makeTitle = (text: string, typeKey: string): string => {
  const cleaned = cleanText(text)

  // Travel: "Site Visit to {City} ({dates})"
  if (typeKey === "travel") {
    const hasSiteVisit = /\bsite\s*visit\b/i.test(cleaned)
    const location = cleaned.match(/\b(?:to|in|at)\s+(Harare|Bulawayo|Gweru|Kwekwe|Masvingo|Mutare|Kadoma|Chinhoyi)(?:\s+(?:and|to|,\s*)\s+(Harare|Bulawayo|Gweru|Kwekwe|Masvingo|Mutare|Kadoma|Chinhoyi))?/)
    const dates = cleaned.match(/(\d{1,2}(?:st|nd|rd|th)?\s+(?:January|February|March|April|June|July|August|September|October|November|December)(?:\s+to\s+\d{1,2}(?:st|nd|rd|th)?(?:\s+(?:January|February|March|April|June|July|August|September|October|November|December))?)?)/)
    if (hasSiteVisit && location) {
      const cities = location[0].replace(/^(?:to|in|at)\s+/i, "")
      const dateStr = dates ? ` (${dates[1]})` : ""
      return `Site Visit to ${cities}${dateStr}`
    }
    if (location) {
      const cities = location[0].replace(/^(?:to|in|at)\s+/i, "")
      const dateStr = dates ? ` (${dates[1]})` : ""
      return `Business Travel to ${cities}${dateStr}`
    }
    if (hasSiteVisit) return "Site Visit"
    return "Business Travel Request"
  }

  // Asset: Request/Purchase for equipment
  if (typeKey === "asset") {
    const isPurchase = /\b(buy|purchase|order|procure)\b/i.test(cleaned)
    const item = cleaned.match(/\b((?:new\s+)?(?:laptop|macbook|computer|monitor|printer|software|license|keyboard|hardware|equipment))\b/i)
    const action = isPurchase ? "Purchase" : "Request"
    const what = item ? item[1].replace(/^new\s+/i, "").replace(/\b\w/g, (c) => c.toUpperCase()) : "Equipment"
    return `${action}: ${what}`
  }

  // HR: Leave / Recruitment request
  if (typeKey === "hr") {
    const isLeave = /\b(leave|vacation|pto|time\s*off|holiday)\b/i.test(cleaned)
    if (isLeave) {
    const dates = cleaned.match(/(\d{1,2}(?:st|nd|rd|th)?\s+(?:January|February|March|April|June|July|August|September|October|November|December)(?:\s+to\s+\d{1,2}(?:st|nd|rd|th)?(?:\s+(?:January|February|March|April|June|July|August|September|October|November|December))?)?)/)
      return `Leave Request${dates ? ` (${dates[1]})` : ""}`
    }
    return "HR Request"
  }

  // Finance: Budget / reimbursement
  if (typeKey === "finance") {
    const isReimbursement = /\b(reimburse|expense|receipt)\b/i.test(cleaned)
    const isBudget = /\b(budget|fund|budgetary)\b/i.test(cleaned)
    if (isReimbursement) return "Expense Reimbursement Request"
    if (isBudget) return "Budget Allocation Request"
    return "Finance Request"
  }

  // Default: first 8 cleaned words as a proper title
  const words = cleaned.split(/\s+/).filter(Boolean)
  const titleWords = words.slice(0, 8)
  const title = titleWords.join(" ")
  if (title.length > 70) return title.slice(0, 70).replace(/\s+\S*$/, "")
  return title || "General Request"
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

const makeDescription = (title: string, typeKey: string): string => {
  const template = DESCRIPTION_TEMPLATES[typeKey] ?? DESCRIPTION_TEMPLATES.general
  return template.replace("{title}", title.toLowerCase())
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

  const typeKey = hasFinance ? "finance" : match.type
  const title = makeTitle(cleaned, typeKey)

  return {
    title,
    description: makeDescription(title, typeKey),
    request_type_key: typeKey,
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