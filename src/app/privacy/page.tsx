import Link from "next/link"

const PRIVACY_POINTS = [
  "Flowsign stores the information required to route, approve, and audit requests.",
  "Approval history is treated as workspace data and should only be accessed by authorised users.",
  "Contact form and account details are used to respond to enquiries and operate the service.",
  "Your organisation should replace this placeholder with its reviewed privacy notice before launch.",
]

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#FAFAF8] px-5 py-10 sm:px-8">
      <article className="mx-auto max-w-3xl rounded-[18px] border border-[#E8E6DE] bg-white p-6 shadow-[0_8px_36px_rgba(0,0,0,0.05)] sm:p-10">
        <Link href="/" className="text-[13px] font-semibold text-[#0F6E56] no-underline hover:underline">
          Back to Flowsign
        </Link>
        <h1 className="mt-8 font-dm-serif text-[34px] font-normal tracking-[-0.02em] text-[#2C2C2A] sm:text-[42px]">
          Privacy Policy
        </h1>
        <p className="mt-4 text-[15px] leading-7 text-[#5F5E5A]">
          This page outlines the expected privacy posture for the current product prototype.
        </p>
        <div className="mt-8 grid gap-4">
          {PRIVACY_POINTS.map((point) => (
            <div key={point} className="rounded-[12px] border border-[#E8E6DE] bg-[#FAFAF8] p-4">
              <p className="text-[14px] leading-6 text-[#2C2C2A]">{point}</p>
            </div>
          ))}
        </div>
      </article>
    </main>
  )
}
