"use client";

import { ThemeProvider } from "@/hooks/use-theme";
import { OrganizationBrandingProvider } from "@/hooks/use-organization-branding";
import { AppToaster } from "@/components/toast-ui/toaster";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider >
      <OrganizationBrandingProvider>
        {children}
      </OrganizationBrandingProvider>
      <AppToaster />
    </ThemeProvider>
  );
}
