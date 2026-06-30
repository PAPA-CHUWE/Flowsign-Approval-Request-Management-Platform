"use client"

import { useState } from "react"
import { AlertCircle, Loader2, Plus, Trash2 } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  createRequestType,
  type OrganizationRequestType,
  type RequestTypeField,
} from "@/lib/api/request-types"

type FieldDraft = RequestTypeField & { id: string }

interface CreateRequestTypeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated: (requestType: OrganizationRequestType) => void
}

const FIELD_TYPES = ["string", "number", "date"]

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
}

function createFieldDraft(): FieldDraft {
  return {
    id: crypto.randomUUID(),
    key: "",
    label: "",
    type: "string",
    required: true,
    helpText: "",
  }
}

function toField(field: FieldDraft): RequestTypeField {
  return {
    key: slugify(field.key),
    label: field.label.trim(),
    type: field.type,
    required: field.required,
    ...(field.helpText?.trim() ? { helpText: field.helpText.trim() } : {}),
  }
}

export function CreateRequestTypeDialog({
  open,
  onOpenChange,
  onCreated,
}: CreateRequestTypeDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [form, setForm] = useState({
    key: "",
    name: "",
    category: "custom",
    description: "",
    active: true,
  })
  const [fields, setFields] = useState<FieldDraft[]>([createFieldDraft()])

  const normalizedFields = fields.map(toField)
  const isValid =
    slugify(form.key).length > 0 &&
    form.name.trim().length > 0 &&
    form.category.trim().length > 0 &&
    normalizedFields.every(
      (field) => field.key.length > 0 && field.label.length > 0
    )

  function reset() {
    setForm({
      key: "",
      name: "",
      category: "custom",
      description: "",
      active: true,
    })
    setFields([createFieldDraft()])
    setError("")
  }

  function setFormField(
    field: keyof typeof form,
    value: string | boolean
  ) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  function setFieldValue(
    id: string,
    field: keyof Omit<FieldDraft, "id">,
    value: string | boolean
  ) {
    setFields((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              [field]: field === "key" && typeof value === "string"
                ? slugify(value)
                : value,
            }
          : item
      )
    )
  }

  function addField() {
    setFields((current) => [...current, createFieldDraft()])
  }

  function removeField(id: string) {
    setFields((current) =>
      current.length === 1 ? current : current.filter((field) => field.id !== id)
    )
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault()

    if (!isValid || isSubmitting) return

    const cleanFields = normalizedFields
    const required = cleanFields
      .filter((field) => field.required)
      .map((field) => field.key)

    setIsSubmitting(true)
    setError("")

    try {
      const response = await createRequestType({
        key: slugify(form.key),
        name: form.name.trim(),
        category: form.category.trim() || "custom",
        description: form.description.trim(),
        fields: cleanFields,
        schema: {
          version: 1,
          fields: cleanFields,
          required,
        },
        active: form.active,
      })

      onCreated(response.responseBody.requestType)
      toast.success("Request type created", {
        description: `${response.responseBody.requestType.name} is ready to use.`,
      })
      reset()
      onOpenChange(false)
    } catch (reason) {
      const message =
        reason instanceof Error ? reason.message : "Could not create request type."

      setError(message)
      toast.error("Request type not created", {
        description: message,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen && !isSubmitting) {
          reset()
        }
        onOpenChange(nextOpen)
      }}
    >
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl" >
        <DialogHeader>
          <DialogTitle>Create request type</DialogTitle>
          <DialogDescription>
            Define a custom request category and the fields users must complete.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-4">
          {error ? (
            <div className="flex items-start gap-2.5 rounded-[10px] border border-[#F5C6C6] bg-[#FCEBEB] px-4 py-3 text-[13px] font-medium text-[#A32D2D]">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          ) : null}

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="grid gap-1.5 text-[12px] font-semibold text-[#5F5E5A]">
              Name
              <Input
                value={form.name}
                onChange={(event) => {
                  const name = event.target.value
                  setForm((current) => ({
                    ...current,
                    name,
                    key: current.key || slugify(name),
                  }))
                }}
                placeholder="Vehicle Request"
                className="h-9 rounded-[8px] border-[#E8E6DE] text-[13px]"
              />
            </label>
            <label className="grid gap-1.5 text-[12px] font-semibold text-[#5F5E5A]">
              Key
              <Input
                value={form.key}
                onChange={(event) => setFormField("key", slugify(event.target.value))}
                placeholder="vehicle"
                className="h-9 rounded-[8px] border-[#E8E6DE] text-[13px]"
              />
            </label>
          </div>

          <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
            <label className="grid gap-1.5 text-[12px] font-semibold text-[#5F5E5A]">
              Category
              <Input
                value={form.category}
                onChange={(event) => setFormField("category", event.target.value)}
                placeholder="custom"
                className="h-9 rounded-[8px] border-[#E8E6DE] text-[13px]"
              />
            </label>
            <label className="flex items-center gap-2 self-end rounded-[8px] border border-[#E8E6DE] px-3 py-2 text-[12px] font-semibold text-[#2C2C2A]">
              <Checkbox
                checked={form.active}
                onCheckedChange={(checked) => setFormField("active", checked === true)}
              />
              Active
            </label>
          </div>

          <label className="grid gap-1.5 text-[12px] font-semibold text-[#5F5E5A]">
            Description
            <Textarea
              value={form.description}
              onChange={(event) => setFormField("description", event.target.value)}
              placeholder="Vehicle booking and fuel approval requests."
              rows={3}
              className="rounded-[8px] border-[#E8E6DE] text-[13px]"
            />
          </label>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-[13px] font-semibold text-[#2C2C2A]">Fields</p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addField}
                className="h-8 rounded-[8px] border-[#E8E6DE] px-3 text-[12px] font-semibold"
              >
                <Plus size={14} />
                Add field
              </Button>
            </div>

            {fields.map((field, index) => (
              <div
                key={field.id}
                className="grid gap-3 rounded-[8px] border border-[#E8E6DE] p-3"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-[12px] font-semibold text-[#5F5E5A]">
                    Field {index + 1}
                  </p>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    disabled={fields.length === 1}
                    onClick={() => removeField(field.id)}
                    className="text-[#A32D2D] hover:bg-[#FCEBEB]"
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="grid gap-1.5 text-[12px] font-semibold text-[#5F5E5A]">
                    Label
                    <Input
                      value={field.label}
                      onChange={(event) => {
                        const label = event.target.value
                        setFields((current) =>
                          current.map((item) =>
                            item.id === field.id
                              ? {
                                  ...item,
                                  label,
                                  key: item.key || slugify(label),
                                }
                              : item
                          )
                        )
                      }}
                      placeholder="Vehicle type"
                      className="h-9 rounded-[8px] border-[#E8E6DE] text-[13px]"
                    />
                  </label>
                  <label className="grid gap-1.5 text-[12px] font-semibold text-[#5F5E5A]">
                    Key
                    <Input
                      value={field.key}
                      onChange={(event) =>
                        setFieldValue(field.id, "key", event.target.value)
                      }
                      placeholder="vehicleType"
                      className="h-9 rounded-[8px] border-[#E8E6DE] text-[13px]"
                    />
                  </label>
                </div>
                <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
                  <label className="grid gap-1.5 text-[12px] font-semibold text-[#5F5E5A]">
                    Type
                    <select
                      value={field.type}
                      onChange={(event) =>
                        setFieldValue(field.id, "type", event.target.value)
                      }
                      className="h-9 rounded-[8px] border border-[#E8E6DE] bg-background px-3 text-[13px]"
                    >
                      {FIELD_TYPES.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="flex items-center gap-2 self-end rounded-[8px] border border-[#E8E6DE] px-3 py-2 text-[12px] font-semibold text-[#2C2C2A]">
                    <Checkbox
                      checked={field.required}
                      onCheckedChange={(checked) =>
                        setFieldValue(field.id, "required", checked === true)
                      }
                    />
                    Required
                  </label>
                </div>
                <label className="grid gap-1.5 text-[12px] font-semibold text-[#5F5E5A]">
                  Help text
                  <Input
                    value={field.helpText ?? ""}
                    onChange={(event) =>
                      setFieldValue(field.id, "helpText", event.target.value)
                    }
                    placeholder="Choose the vehicle category needed."
                    className="h-9 rounded-[8px] border-[#E8E6DE] text-[13px]"
                  />
                </label>
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              disabled={isSubmitting}
              onClick={() => onOpenChange(false)}
              className="h-9 rounded-[8px] border-[#E8E6DE] px-4 text-[12px] font-semibold"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!isValid || isSubmitting}
              className="h-9 rounded-[8px] bg-brand-teal px-4 text-[12px] font-semibold text-white"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Creating
                </>
              ) : (
                <>
                  <Plus size={14} />
                  Create type
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
