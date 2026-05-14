import Link from "next/link"

const TERMS = [
  "Use Flowsign only for lawful approval and request-management workflows.",
  "Keep account credentials secure and notify your workspace admin if access is compromised.",
  "Workspace owners are responsible for configuring approval rules, roles, and data retention.",
  "Flowsign may update these terms as the product evolves; material changes should be reviewed by your organisation.",
]

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#FAFAF8] px-5 py-10 sm:px-8">
      <article className="mx-auto max-w-3xl rounded-[18px] border border-[#E8E6DE] bg-white p-6 shadow-[0_8px_36px_rgba(0,0,0,0.05)] sm:p-10">
        <Link href="/" className="text-[13px] font-semibold text-[#0F6E56] no-underline hover:underline">
          Back to Flowsign
        </Link>
        <h1 className="mt-8 font-dm-serif text-[34px] font-normal tracking-[-0.02em] text-[#2C2C2A] sm:text-[42px]">
          Terms of Service
        </h1>
        <p className="mt-4 text-[15px] leading-7 text-[#5F5E5A]">
          These starter terms give teams a clear placeholder until final legal copy is approved.
        </p>
        <div className="mt-8 grid gap-4">
          {TERMS.map((term) => (
            <div key={term} className="rounded-[12px] border border-[#E8E6DE] bg-[#FAFAF8] p-4">
              <p className="text-[14px] leading-6 text-[#2C2C2A]">{term}</p>
            </div>
          ))}
        </div>
      </article>
    </main>
  )
}
