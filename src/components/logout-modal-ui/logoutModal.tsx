"use client"

import { Loader2, LogOut } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface LogoutModalProps {
  open: boolean
  isLoggingOut?: boolean
  onCancel: () => void
  onConfirm: () => void
}

export function LogoutModal({
  open,
  isLoggingOut = false,
  onCancel,
  onConfirm,
}: LogoutModalProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen && !isLoggingOut) {
          onCancel()
        }
      }}
    >
      <DialogContent
        showCloseButton={!isLoggingOut}
        className="max-w-lg border border-slate-100 bg-white p-4 shadow-lg md:p-6"
      >
        <DialogHeader className="items-center text-center">
          <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-500">
            <LogOut size={24} strokeWidth={2.4} />
          </div>
          <DialogTitle className="text-base font-semibold text-slate-900">
            Log out of FlowSign?
          </DialogTitle>
          <DialogDescription className="max-w-sm text-sm leading-relaxed text-slate-600">
            Your local session will be cleared and the server session cookie will be
            invalidated.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="-mx-4 -mb-4 mt-2 flex flex-col-reverse gap-3 border-t bg-[#FAFAF8] p-4 sm:flex-row sm:justify-end md:-mx-6 md:-mb-6">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoggingOut}
            className="h-9 w-full rounded-md border-slate-300 bg-white px-3.5 text-sm font-semibold text-slate-900 hover:bg-slate-50 sm:w-auto sm:min-w-32"
          >
            No, cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={onConfirm}
            disabled={isLoggingOut}
            className="h-9 w-full rounded-md border-red-600 bg-red-600 px-3.5 text-sm font-semibold text-white hover:bg-red-700 sm:w-auto sm:min-w-32"
          >
            {isLoggingOut ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                Logging out
              </>
            ) : (
              "Yes, log out"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default LogoutModal
