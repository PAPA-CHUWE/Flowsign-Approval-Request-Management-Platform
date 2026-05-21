"use client"

import { AlertCircle, Loader2, Power } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { OrganizationUser } from "@/lib/api/users"

type StatusAction = "activate" | "deactivate"

function getDisplayName(user: OrganizationUser) {
  return `${user.firstName} ${user.lastName}`.trim() || user.email
}

interface DeactivateUserDialogProps {
  user: OrganizationUser | null
  action: StatusAction
  isUpdating: boolean
  error?: string
  onCancel: () => void
  onConfirm: () => void
}

export function DeactivateUserDialog({
  user,
  action,
  isUpdating,
  error = "",
  onCancel,
  onConfirm,
}: DeactivateUserDialogProps) {
  const isActivation = action === "activate"

  return (
    <Dialog
      open={!!user}
      onOpenChange={(open) => {
        if (!open && !isUpdating) {
          onCancel()
        }
      }}
    >
      <DialogContent
        showCloseButton={!isUpdating}
        className="max-w-lg border border-slate-100 bg-white p-4 shadow-lg md:p-6"
      >
        <DialogHeader className="items-center text-center">
          <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-full bg-[#FAEEDA] text-[#854F0B]">
            <Power size={24} strokeWidth={2.4} />
          </div>
          <DialogTitle className="text-base font-semibold text-slate-900">
            {isActivation ? "Activate user?" : "Deactivate user?"}
          </DialogTitle>
          <DialogDescription className="max-w-sm text-sm leading-relaxed text-slate-600">
            {user
              ? isActivation
                ? `${getDisplayName(user)} will regain active access.`
                : `${getDisplayName(user)} will no longer have active access.`
              : isActivation
                ? "This user will regain active access."
                : "This user will no longer have active access."}
          </DialogDescription>
        </DialogHeader>

        {error ? (
          <div className="flex items-start gap-2.5 rounded-[10px] border border-[#F5C6C6] bg-[#FCEBEB] px-4 py-3 text-[13px] font-medium text-[#A32D2D]">
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        ) : null}

        <DialogFooter className="-mx-4 -mb-4 mt-2 flex flex-col-reverse gap-3 border-t bg-[#FAFAF8] p-4 sm:flex-row sm:justify-end md:-mx-6 md:-mb-6">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isUpdating}
            className="h-9 w-full rounded-md border-slate-300 bg-white px-3.5 text-sm font-semibold text-slate-900 hover:bg-slate-50 sm:w-auto sm:min-w-32"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={onConfirm}
            disabled={isUpdating}
            className="h-9 w-full rounded-md bg-[#854F0B] px-3.5 text-sm font-semibold text-white hover:bg-[#6f4109] sm:w-auto sm:min-w-32"
          >
            {isUpdating ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                Updating
              </>
            ) : (
              isActivation ? "Activate" : "Deactivate"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
