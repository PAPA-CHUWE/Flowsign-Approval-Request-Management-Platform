"use client"

import { useCallback, useState } from "react"
import { RefreshCw, Copy, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { FormField } from "./FormField"

function generateRequestKey(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ0123456789"
  return "FSG" + Array.from(
    { length: 12 },
    () => chars[Math.floor(Math.random() * chars.length)]
  ).join("")
}

export { generateRequestKey }

interface RequestKeyFieldProps {
  value: string
  onRegenerate: () => void
  disabled?: boolean
}

export function RequestKeyField({ value, onRegenerate, disabled }: RequestKeyFieldProps) {
  const [copied, setCopied] = useState(false)

  const copyKey = useCallback(() => {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }, [value])

  return (
    <FormField label="Request key" hint="Auto-generated reference ID — copy or regenerate">
      <div className="flex items-center gap-2">
        <div className="flex-1 flex items-center h-10 px-3 rounded-[8px] border border-[#E8E6DE] bg-[#F1EFE8] min-w-0">
          <span className="font-mono text-[13px] font-semibold text-[#0F6E56] tracking-widest truncate">
            {value}
          </span>
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={copyKey}
          title="Copy key"
          className="flex h-10 w-10 items-center justify-center rounded-[8px] shrink-0 p-0 hover:bg-[#E1F5EE] hover:border-[#9FE1CB] transition-all duration-150 cursor-pointer"
        >
          {copied
            ? <Check  size={14} color="#0F6E56" strokeWidth={2.5} />
            : <Copy   size={14} color="#888780" strokeWidth={2}   />
          }
        </Button>

        <Button
          type="button"
          variant="outline"
          onClick={onRegenerate}
          disabled={disabled}
          title="Regenerate"
          className="flex h-10 w-10 items-center justify-center rounded-[8px] shrink-0 p-0 hover:bg-[#E1F5EE] hover:border-[#9FE1CB] transition-all duration-150 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <RefreshCw size={14} color="#888780" strokeWidth={2} />
        </Button>
      </div>
    </FormField>
  )
}
