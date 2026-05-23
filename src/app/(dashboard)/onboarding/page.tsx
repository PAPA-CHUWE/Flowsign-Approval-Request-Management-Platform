import { PageHeader } from "@/components/layout/PageHeader"
import { OnboardingPageContent } from "@/components/onboarding/OnboardingPageContent"

export default function OnboardingPage() {
  return (
    <div className="flex w-full flex-col gap-6">
      <PageHeader
        title="Onboarding"
        description="Configure how employees join your organisation — via domain or direct invite."
      />
      <OnboardingPageContent />
    </div>
  )
}
