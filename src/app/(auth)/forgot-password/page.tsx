"use client"

import { useState } from "react"
import Link from "next/link"
import { AlertCircle, BadgeCheck, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { forgotPassword } from "@/lib/api/auth"

export default function ForgotPasswordPage() {
  const [email,       setEmail]       = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error,       setError]       = useState("")
  const [sent,        setSent]        = useState(false)

  const valid = email.includes("@") && email.includes(".")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!valid || isSubmitting) return

    setIsSubmitting(true)
    setError("")

    try {
      await forgotPassword({ email: email.trim().toLowerCase() })
      setSent(true)
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not send reset link. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#F1EFE8] px-5 py-10">
      <div className="mx-auto flex min-h-[calc(100vh-80px)] w-full max-w-md items-center">
        <section className="w-full rounded-[18px] border border-[#E8E6DE] bg-white p-6 shadow-[0_8px_36px_rgba(0,0,0,0.06)] sm:p-8">

          <Link href="/" className="mb-8 flex items-center gap-2.5 no-underline">
            <div className="flex h-8 w-8 items-center justify-center rounded-[9px] bg-gradient-to-br from-[#0F6E56] to-[#1D9E75]">
              <span className="text-sm font-bold text-white">F</span>
            </div>
            <span className="text-[16px] font-bold tracking-[-0.02em] text-[#2C2C2A]">
              Flow<span className="text-[#0F6E56]">sign</span>
            </span>
          </Link>

          {sent ? (
            /* ── Success state ── */
            <div className="flex flex-col items-center gap-4 py-4 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#E1F5EE]">
                <BadgeCheck size={28} className="text-[#0F6E56]" strokeWidth={2} />
              </div>
              <div>
                <h1 className="font-dm-serif text-[24px] font-normal tracking-[-0.02em] text-[#2C2C2A]">
                  Check your inbox
                </h1>
                <p className="mt-2 text-[14px] leading-6 text-[#5F5E5A]">
                  We&apos;ve sent reset instructions to{" "}
                  <span className="font-semibold text-[#2C2C2A]">{email}</span>.
                  Check your spam folder if it doesn&apos;t arrive within a few minutes.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={() => { setSent(false); setEmail("") }}
                className="mt-2 h-10 rounded-[10px] border-[#D3D1C7] text-[13px] font-semibold"
              >
                Use a different email
              </Button>
            </div>
          ) : (
            /* ── Form state ── */
            <>
              <div className="mb-6">
                <h1 className="font-dm-serif text-[28px] font-normal tracking-[-0.02em] text-[#2C2C2A]">
                  Reset your password
                </h1>
                <p className="mt-2 text-[14px] leading-6 text-[#5F5E5A]">
                  Enter your work email and we will send password reset instructions.
                </p>
              </div>

              {error && (
                <div className="mb-4 flex items-start gap-2.5 rounded-[10px] border border-[#F5C6C6] bg-[#FCEBEB] px-4 py-3 text-[13px] font-medium text-[#A32D2D]">
                  <AlertCircle size={16} className="mt-0.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="grid gap-4">
                <Input
                  type="email"
                  autoComplete="email"
                  placeholder="you@organisation.com"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError("") }}
                  disabled={isSubmitting}
                  className="h-11 rounded-[10px] border-[#D3D1C7] bg-[#F1EFE8] text-[14px]"
                />
                <Button
                  type="submit"
                  disabled={!valid || isSubmitting}
                  className="h-11 rounded-[10px] bg-[#0F6E56] text-[14px] font-bold text-white hover:bg-[#1D9E75] disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Sending…
                    </>
                  ) : (
                    "Send reset link"
                  )}
                </Button>
              </form>

              <p className="mt-6 text-center text-[13px] text-[#5F5E5A]">
                Remembered it?{" "}
                <Link href="/login" className="font-semibold text-[#0F6E56] hover:underline">
                  Back to sign in
                </Link>
              </p>
            </>
          )}

        </section>
      </div>
    </main>
  )
}
