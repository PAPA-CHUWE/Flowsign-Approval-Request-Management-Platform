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
  errors?: Record<string, string>
}

const CURRENCY_KEYS = ["amount", "estimatedcost", "costestimate", "estimatedbudget", "budget"]

function isCurrencyField(key: string) {
  return CURRENCY_KEYS.includes(key.toLowerCase())
}

function shouldUseTextarea(field: RequestTypeField) {
  const key   = field.key.toLowerCase()
  const label = field.label.toLowerCase()
  if (field.type === "textarea") return true
  const LONG_TEXT_KEYS = ["justification", "note", "purpose", "reason", "description"]
  return LONG_TEXT_KEYS.some((kw) => key.includes(kw) || label.includes(kw))
}

export function DynamicRequestFields({
  fields,
  values,
  onChange,
  disabled,
  errors,
}: DynamicRequestFieldsProps) {
  if (!fields.length) return null

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {fields.map((field) => {
        const error = errors?.[field.key]

        // ── Boolean / checkbox ──────────────────────────────────────────────
        if (field.type === "boolean") {
          return (
            <FormField key={field.key} label="" hint={field.helpText} error={error}>
              <label className="flex cursor-pointer items-center gap-2.5">
                <input
                  type="checkbox"
                  checked={values[field.key] === "true"}
                  onChange={(e) => onChange(field.key, e.target.checked ? "true" : "false")}
                  disabled={disabled}
                  className="h-4 w-4 rounded border-[#D3D1C7] accent-[#0F6E56]"
                />
                <span className="text-[13px] font-medium text-[#2C2C2A]">
                  {field.label}
                  {field.required && <span className="ml-0.5 text-red-400">*</span>}
                </span>
              </label>
            </FormField>
          )
        }

        // ── Textarea ───────────────────────────────────────────────────────
        if (shouldUseTextarea(field)) {
          return (
            <FormField
              key={field.key}
              label={field.label}
              required={field.required}
              hint={field.helpText}
              error={error}
            >
              <Textarea
                name={field.key}
                value={values[field.key] ?? ""}
                onChange={(e) => onChange(field.key, e.target.value)}
                disabled={disabled}
                rows={4}
                className="min-h-[104px] rounded-[8px] border-[#E8E6DE] bg-[#FAFAF8] text-[13px] text-brand-neutral-dark placeholder:text-[#B4B2A9] focus-visible:border-brand-teal-mid focus-visible:bg-white focus-visible:ring-2 focus-visible:ring-brand-teal-pale md:col-span-2"
              />
            </FormField>
          )
        }

        // ── Currency number ────────────────────────────────────────────────
        if (field.type === "number" && isCurrencyField(field.key)) {
          return (
            <FormField
              key={field.key}
              label={field.label}
              required={field.required}
              hint={field.helpText}
              error={error}
            >
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[13px] text-[#B4B2A9]">
                  $
                </span>
                <Input
                  name={field.key}
                  type="number"
                  min={0}
                  step="0.01"
                  value={values[field.key] ?? ""}
                  onChange={(e) => onChange(field.key, e.target.value)}
                  disabled={disabled}
                  className={`${inputCn} pl-7`}
                />
              </div>
            </FormField>
          )
        }

        // ── Default input (text, number, date) ─────────────────────────────
        return (
          <FormField
            key={field.key}
            label={field.label}
            required={field.required}
            hint={field.helpText}
            error={error}
          >
            <Input
              name={field.key}
              type={field.type === "number" ? "number" : field.type === "date" ? "date" : "text"}
              min={field.type === "number" ? 0 : undefined}
              step={field.type === "number" ? "0.01" : undefined}
              value={values[field.key] ?? ""}
              onChange={(e) => onChange(field.key, e.target.value)}
              disabled={disabled}
              className={inputCn}
            />
          </FormField>
        )
      })}
    </div>
  )
}
