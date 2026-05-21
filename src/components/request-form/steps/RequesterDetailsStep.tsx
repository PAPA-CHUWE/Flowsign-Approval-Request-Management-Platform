"use client"

import { Input } from "@/components/ui/input"
import { getUserDisplayName, useCurrentUser } from "@/hooks/use-current-user"
import { inputCn } from "../inputCn"

interface RequesterDetailsStepProps {
  disabled?: boolean
}

export function RequesterDetailsStep({ disabled }: RequesterDetailsStepProps) {
  const { user, isLoading } = useCurrentUser()
  const requesterName = user ? getUserDisplayName(user) : ""
  const requesterEmail = user?.email ?? ""
  const readonly = disabled || isLoading

  return (
    <div className="grid gap-3">
      <Input
        name="requesterName"
        placeholder={isLoading ? "Loading requester..." : "Name"}
        value={requesterName}
        readOnly
        disabled={disabled}
        className={inputCn}
        aria-busy={readonly}
      />
      <Input
        name="requesterEmail"
        placeholder={isLoading ? "Loading requester..." : "Email"}
        type="email"
        value={requesterEmail}
        readOnly
        disabled={disabled}
        className={inputCn}
        aria-busy={readonly}
      />
    </div>
  )
}
