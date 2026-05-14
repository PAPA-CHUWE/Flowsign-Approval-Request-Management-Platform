import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function ForgotPasswordPage() {
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

          <div className="mb-6">
            <h1 className="font-dm-serif text-[28px] font-normal tracking-[-0.02em] text-[#2C2C2A]">
              Reset your password
            </h1>
            <p className="mt-2 text-[14px] leading-6 text-[#5F5E5A]">
              Enter your work email and we will send password reset instructions.
            </p>
          </div>

          <form className="grid gap-4">
            <Input
              type="email"
              autoComplete="email"
              placeholder="you@organisation.com"
              className="h-11 rounded-[10px] border-[#D3D1C7] bg-[#F1EFE8] text-[14px]"
            />
            <Button className="h-11 rounded-[10px] bg-[#0F6E56] text-[14px] font-bold text-white hover:bg-[#1D9E75]">
              Send reset link
            </Button>
          </form>

          <p className="mt-6 text-center text-[13px] text-[#5F5E5A]">
            Remembered it?{" "}
            <Link href="/login" className="font-semibold text-[#0F6E56] hover:underline">
              Back to sign in
            </Link>
          </p>
        </section>
      </div>
    </main>
  )
}
