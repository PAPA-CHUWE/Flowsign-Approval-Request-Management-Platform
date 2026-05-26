import Link from "next/link"
import { getPrivacyPolicy } from "@/lib/api/legal"
import { LegalPageContent } from "@/components/legal/LegalPageContent"

export default async function PrivacyPage() {
  let doc
  try {
    doc = await getPrivacyPolicy()
  } catch {
    return (
      <main className="min-h-screen bg-[#FAFAF8] flex items-center justify-center px-5">
        <div className="text-center">
          <p className="text-[15px] text-[#5F5E5A] mb-4">Could not load Privacy Policy. Please try again later.</p>
          <Link href="/" className="text-[13px] font-semibold text-[#0F6E56] hover:underline">
            Back to Flowsign
          </Link>
        </div>
      </main>
    )
  }

  return <LegalPageContent doc={doc} />
}
