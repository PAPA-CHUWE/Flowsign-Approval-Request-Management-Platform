"use client"

import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import type { RequestTypeField } from "@/lib/api/request-types"

import { FormField } from "./FormField"
import { inputCn } from "./inputCn"

interface DynamicRequestFieldsProps {
  fields: RequestTypeField[]
  values: Record<string, string>
  onChange: (key: string, value: string) => void
  disabled?: boolean
}

function inputType(type: string) {
  if (type === "number" || type === "date") {
    return type
  }

  return "text"
}

function shouldUseTextarea(field: RequestTypeField) {
  const key = field.key.toLowerCase()
  const label = field.label.toLowerCase()

  return (
    typeIsLongText(field.type) ||
    key.includes("justification") ||
    key.includes("note") ||
    key.includes("purpose") ||
    label.includes("justification") ||
    label.includes("note") ||
    label.includes("purpose")
  )
}

function typeIsLongText(type: string) {
  return type === "textarea" || type === "text"
}

export function DynamicRequestFields({
  fields,
  values,
  onChange,
  disabled,
}: DynamicRequestFieldsProps) {
  if (!fields.length) {
    return null
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {fields.map((field) => (
        <FormField
          key={field.key}
          label={field.label}
          required={field.required}
          hint={field.helpText}
        >
          {shouldUseTextarea(field) ? (
            <Textarea
              name={field.key}
              value={values[field.key] ?? ""}
              onChange={(event) => onChange(field.key, event.target.value)}
              disabled={disabled}
              rows={4}
              className="min-h-[104px] rounded-[8px] border-[#E8E6DE] bg-[#FAFAF8] text-[13px] text-brand-neutral-dark placeholder:text-[#B4B2A9] focus-visible:border-brand-teal-mid focus-visible:bg-white focus-visible:ring-2 focus-visible:ring-brand-teal-pale md:col-span-2"
            />
          ) : (
            <Input
              name={field.key}
              type={inputType(field.type)}
              value={values[field.key] ?? ""}
              onChange={(event) => onChange(field.key, event.target.value)}
              disabled={disabled}
              className={inputCn}
            />
          )}
        </FormField>
      ))}
    </div>
  )
}
