"use client";

import { Toaster } from "@/components/ui/sonner";

export function AppToaster() {
  return (
    <Toaster
      position="top-right"
      richColors
      closeButton
      toastOptions={{
        duration: 3500,
        classNames: {
          toast: "rounded-[8px] border-border shadow-lg",
          title: "text-[13px] font-semibold",
          description: "text-[12px]",
        },
      }}
    />
  );
}
