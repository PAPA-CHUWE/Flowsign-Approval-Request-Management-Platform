"use client"

import { AlertCircle, Loader2, MailX } from "lucide-react"
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

interface RevokeInviteDialogProps {
  user: OrganizationUser | null
  isRevoking: boolean
  onCancel: () => void
  onConfirm: () => void
}

export function RevokeInviteDialog({
  user,
  isRevoking,
  onCancel,
  onConfirm,
}: RevokeInviteDialogProps) {
  return (
    <Dialog
      open={!!user}
      onOpenChange={(open) => {
        if (!open && !isRevoking) onCancel()
      }}
    >
      <DialogContent
        showCloseButton={!isRevoking}
        className="max-w-lg border border-slate-100 bg-white p-4 shadow-lg md:p-6"
      >
        <DialogHeader className="items-center text-center">
          <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-500">
            <MailX size={24} strokeWidth={2.4} />
          </div>
          <DialogTitle className="text-base font-semibold text-slate-900">
            Revoke invite{user ? ` for ${getDisplayName(user)}?` : "?"}
          </DialogTitle>
          <DialogDescription className="max-w-sm text-sm leading-relaxed text-slate-600">
            This will permanently remove the invite. The link in their email will stop working.
            You can re-invite them later.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="-mx-4 -mb-4 mt-2 flex flex-col-reverse gap-3 border-t bg-[#FAFAF8] p-4 sm:flex-row sm:justify-end md:-mx-6 md:-mb-6">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isRevoking}
            className="h-9 w-full rounded-md border-slate-300 bg-white px-3.5 text-sm font-semibold text-slate-900 hover:bg-slate-50 sm:w-auto sm:min-w-32"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={onConfirm}
            disabled={isRevoking}
            className="h-9 w-full rounded-md border-red-600 bg-red-600 px-3.5 text-sm font-semibold text-white hover:bg-red-700 sm:w-auto sm:min-w-32"
          >
            {isRevoking ? (
              <><Loader2 size={15} className="animate-spin" /> Revoking…</>
            ) : (
              "Revoke Invite"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
