"use client"

import { useRef, useState } from "react"
import { Paperclip, Upload, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export interface Attachment {
  id: string
  name: string
  size: string
}

interface AttachmentsSectionProps {
  files: Attachment[]
  onChange: (f: Attachment[]) => void
  disabled?: boolean
}

export function AttachmentsSection({ files, onChange, disabled }: AttachmentsSectionProps) {
  const inputRef        = useRef<HTMLInputElement>(null)
  const [drag, setDrag] = useState(false)

  const addFiles = (fl: FileList | null) => {
    if (!fl) return
    const next: Attachment[] = Array.from(fl).map((f) => ({
      id:   Math.random().toString(36).slice(2),
      name: f.name,
      size: f.size > 1024 * 1024
        ? `${(f.size / 1024 / 1024).toFixed(1)} MB`
        : `${(f.size / 1024).toFixed(0)} KB`,
    }))
    onChange([...files, ...next])
  }

  return (
    <div className="flex flex-col gap-3">
      <div
        onDragOver={(e) => { e.preventDefault(); setDrag(true) }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => { e.preventDefault(); setDrag(false); addFiles(e.dataTransfer.files) }}
        onClick={() => !disabled && inputRef.current?.click()}
        className={cn(
          "flex flex-col items-center justify-center gap-2 h-24 rounded-[10px]",
          "border-2 border-dashed cursor-pointer transition-all duration-150",
          drag ? "border-[#1D9E75] bg-[#E1F5EE]"
               : "border-[#D3D1C7] bg-[#FAFAF8] hover:border-[#9FE1CB] hover:bg-[#F1EFE8]",
          disabled && "opacity-50 cursor-not-allowed"
        )}
      >
        <Upload size={18} color={drag ? "#0F6E56" : "#B4B2A9"} strokeWidth={1.5} />
        <p className="text-[12px] text-[#888780]">
          Drop files here or{" "}
          <span className="text-[#0F6E56] font-semibold">browse</span>
        </p>
        <p className="text-[11px] text-[#B4B2A9]">PDF, DOCX, XLSX, PNG, JPG — max 10MB</p>
      </div>

      <input
        ref={inputRef}
        type="file"
        multiple
        className="hidden"
        onChange={(e) => addFiles(e.target.files)}
        disabled={disabled}
      />

      {files.length > 0 && (
        <div className="flex flex-col gap-1.5">
          {files.map((f) => (
            <div key={f.id}
              className="flex items-center justify-between h-9 px-3 rounded-[8px] bg-[#F1EFE8] border border-[#E8E6DE]">
              <div className="flex items-center gap-2">
                <Paperclip size={12} color="#888780" strokeWidth={2} />
                <span className="text-[12px] font-medium text-[#2C2C2A]">{f.name}</span>
                <span className="text-[11px] text-[#B4B2A9]">{f.size}</span>
              </div>
              {!disabled && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => onChange(files.filter((x) => x.id !== f.id))}
                  className="text-[#B4B2A9] hover:text-[#A32D2D] h-auto w-auto p-0 cursor-pointer"
                >
                  <X size={13} strokeWidth={2} />
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
