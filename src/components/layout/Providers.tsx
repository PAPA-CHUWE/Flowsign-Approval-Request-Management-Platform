"use client";

import { ThemeProvider } from "@/hooks/use-theme";
import { AppToaster } from "@/components/toast-ui/toaster";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      {children}
      <AppToaster />
    </ThemeProvider>
  );
}
