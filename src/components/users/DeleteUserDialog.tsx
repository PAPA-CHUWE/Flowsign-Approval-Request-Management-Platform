"use client"

import { AlertCircle, Loader2, Trash2 } from "lucide-react"

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

function getDisplayName(user: OrganizationUser) {
  return `${user.firstName} ${user.lastName}`.trim() || user.email
}

interface DeleteUserDialogProps {
  user: OrganizationUser | null
  isDeleting: boolean
  error?: string
  onCancel: () => void
  onConfirm: () => void
}

export function DeleteUserDialog({
  user,
  isDeleting,
  error = "",
  onCancel,
  onConfirm,
}: DeleteUserDialogProps) {
  return (
    <Dialog
      open={!!user}
      onOpenChange={(open) => {
        if (!open && !isDeleting) {
          onCancel()
        }
      }}
    >
      <DialogContent
        showCloseButton={!isDeleting}
        className="max-w-lg border border-slate-100 bg-white p-4 shadow-lg md:p-6"
      >
        <DialogHeader className="items-center text-center">
          <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-500">
            <Trash2 size={24} strokeWidth={2.4} />
          </div>
          <DialogTitle className="text-base font-semibold text-slate-900">
            Delete user?
          </DialogTitle>
          <DialogDescription className="max-w-sm text-sm leading-relaxed text-slate-600">
            {user
              ? `${getDisplayName(user)} will be soft-deleted from this organisation.`
              : "This user will be soft-deleted from this organisation."}
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
            disabled={isDeleting}
            className="h-9 w-full rounded-md border-slate-300 bg-white px-3.5 text-sm font-semibold text-slate-900 hover:bg-slate-50 sm:w-auto sm:min-w-32"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={onConfirm}
            disabled={isDeleting}
            className="h-9 w-full rounded-md border-red-600 bg-red-600 px-3.5 text-sm font-semibold text-white hover:bg-red-700 sm:w-auto sm:min-w-32"
          >
            {isDeleting ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                Deleting
              </>
            ) : (
              "Delete user"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
