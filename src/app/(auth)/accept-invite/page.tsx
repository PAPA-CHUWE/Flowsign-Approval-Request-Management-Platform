"use client"

import { Suspense, useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { ApiError } from "@/lib/api/client"
import { acceptInvite } from "@/lib/api/auth"
import { AlertCircle, Eye, EyeOff, Loader2, Lock, User } from "lucide-react"

// ─── Shared styles ────────────────────────────────────────────────────────────

const inputCn =
  "h-11 pl-10 rounded-[10px] border-[#D3D1C7] bg-[#F1EFE8] " +
  "text-[14px] text-[#2C2C2A] placeholder:text-[#B4B2A9] " +
  "focus-visible:border-[#1D9E75] focus-visible:ring-[3px] " +
  "focus-visible:ring-[#E1F5EE] focus-visible:bg-white " +
  "transition-all duration-150"

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-[12px] font-semibold text-[#5F5E5A] tracking-wide">{label}</Label>
      {children}
      {error && (
        <p className="text-[11px] font-medium text-[#A32D2D]">{error}</p>
      )}
    </div>
  )
}

// ─── Left panel (reused from login) ──────────────────────────────────────────

function LeftPanel() {
  return (
    <div className="relative hidden md:flex flex-col justify-between bg-gradient-to-br from-[#0F6E56] via-[#0D5E49] to-[#085041] p-10 overflow-hidden">
      <div className="absolute top-6 left-6 grid grid-cols-5 gap-[6px] opacity-30">
        {Array.from({ length: 25 }).map((_, i) => (
          <div key={i} className="w-[3px] h-[3px] rounded-full bg-white" />
        ))}
      </div>
      <div className="absolute top-8 right-8 w-20 h-20 rounded-full bg-white/10 border border-white/20" />
      <div className="absolute top-16 right-20 w-8 h-8 rounded-full bg-[#9FE1CB]/40" />
      <div className="absolute bottom-24 left-8 w-5 h-5 rounded-full bg-white/20" />
      <div className="absolute bottom-32 right-10 w-32 h-32 rounded-full bg-gradient-to-br from-[#9FE1CB]/30 to-[#1D9E75]/20 border border-white/10" />
      <div className="absolute -bottom-10 -left-10 w-48 h-48 rounded-full border-[3px] border-[#9FE1CB]/30" />
      <div className="absolute -bottom-16 -left-4 w-36 h-36 rounded-full bg-gradient-to-tr from-[#9FE1CB]/20 to-transparent" />
      <div className="absolute bottom-6 right-6 grid grid-cols-5 gap-[6px] opacity-20">
        {Array.from({ length: 25 }).map((_, i) => (
          <div key={i} className="w-[3px] h-[3px] rounded-full bg-white" />
        ))}
      </div>

      <div className="relative z-10 mt-8">
        <div className="w-12 h-12 rounded-[14px] bg-white/15 border border-white/25 flex items-center justify-center mb-10">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M9 12l2 2 4-4" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M21 12c0 4.97-4.03 9-9 9S3 16.97 3 12 7.03 3 12 3s9 4.03 9 9z" stroke="white" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
        <h2 className="font-serif text-[clamp(28px,3vw,38px)] font-normal text-white leading-[1.15] tracking-[-0.02em] mb-4">
          You&apos;re
          <br />
          <span className="text-[#9FE1CB] italic">invited.</span>
        </h2>
        <p className="text-[14px] text-white/65 leading-[1.65] max-w-[260px]">
          Set your password and you&apos;re in. Your team is waiting for you on FlowSign.
        </p>
      </div>

      <div className="relative z-10 flex flex-col gap-3 mt-8">
        {["End-to-end encrypted", "Immutable audit trail", "SOC 2 ready"].map((item) => (
          <div key={item} className="flex items-center gap-2.5">
            <div className="w-4 h-4 rounded-full bg-[#9FE1CB]/30 border border-[#9FE1CB]/60 flex items-center justify-center shrink-0">
              <svg width="8" height="8" viewBox="0 0 12 12">
                <path d="M2 6l3 3 5-5" stroke="#9FE1CB" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span className="text-[12px] text-white/70">{item}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── No-token error state ─────────────────────────────────────────────────────

function InvalidLinkState() {
  return (
    <div className="flex flex-col items-center gap-4 py-6 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
        <AlertCircle size={22} className="text-red-400" />
      </div>
      <div>
        <p className="text-[15px] font-semibold text-[#2C2C2A]">This invite link is invalid.</p>
        <p className="mt-1 text-[13px] text-[#5F5E5A]">
          Please ask your admin to resend the invite.
        </p>
      </div>
      <Link
        href="/login"
        className="mt-1 text-[13px] font-semibold text-[#0F6E56] hover:underline"
      >
        Go to Login
      </Link>
    </div>
  )
}

// ─── Expired-token error state ────────────────────────────────────────────────

function ExpiredTokenState() {
  return (
    <div className="flex flex-col items-center gap-4 py-6 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-50">
        <AlertCircle size={22} className="text-amber-400" />
      </div>
      <div>
        <p className="text-[15px] font-semibold text-[#2C2C2A]">Invite link expired or invalid</p>
        <p className="mt-2 max-w-[340px] text-[13px] leading-relaxed text-[#5F5E5A]">
          This invite link has already been used or has expired (links expire after 7&nbsp;days).
          Please contact your organization admin to send a new invite.
        </p>
      </div>
      <Link
        href="/login"
        className="mt-1 inline-flex h-9 items-center rounded-[8px] bg-[#0F6E56] px-4 text-[13px] font-semibold text-white hover:bg-[#0c5e49]"
      >
        Go to Login
      </Link>
    </div>
  )
}

// ─── Accept-invite form ───────────────────────────────────────────────────────

type PageState = "form" | "submitting" | "expired"

interface FormValues {
  firstName: string
  lastName: string
  password: string
  confirmPassword: string
}

interface FormErrors {
  password?: string
  confirmPassword?: string
}

function AcceptInviteForm({ token }: { token: string }) {
  const router = useRouter()
  const [pageState, setPageState] = useState<PageState>("form")
  const [networkError, setNetworkError] = useState("")
  const [showPassword, setShowPassword]         = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [touched, setTouched] = useState<Partial<Record<keyof FormValues, boolean>>>({})
  const [form, setForm] = useState<FormValues>({
    firstName: "",
    lastName: "",
    password: "",
    confirmPassword: "",
  })

  function set(key: keyof FormValues) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((prev) => ({ ...prev, [key]: e.target.value }))
  }

  function blur(key: keyof FormValues) {
    return () => setTouched((prev) => ({ ...prev, [key]: true }))
  }

  function validate(): FormErrors {
    const errs: FormErrors = {}
    if (form.password.length < 10)
      errs.password = "Password must be at least 10 characters."
    if (form.confirmPassword !== form.password)
      errs.confirmPassword = "Passwords do not match."
    return errs
  }

  const errors = validate()
  const isValid = Object.keys(errors).length === 0

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setTouched({ password: true, confirmPassword: true })
    if (!isValid) return
    setNetworkError("")
    setPageState("submitting")

    const payload: Parameters<typeof acceptInvite>[0] = { token, password: form.password }
    if (form.firstName.trim()) payload.firstName = form.firstName.trim()
    if (form.lastName.trim())  payload.lastName  = form.lastName.trim()

    try {
      await acceptInvite(payload)
      router.push("/dashboard")
      router.refresh()
    } catch (err) {
      if (err instanceof ApiError && err.status === 400) {
        setPageState("expired")
      } else {
        setNetworkError(
          err instanceof Error ? err.message : "Something went wrong. Please try again."
        )
        setPageState("form")
      }
    }
  }

  if (pageState === "expired") return <ExpiredTokenState />

  const isSubmitting = pageState === "submitting"

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {networkError && (
        <div className="flex items-start gap-2.5 rounded-[10px] border border-[#F5C6C6] bg-[#FCEBEB] px-4 py-3 text-[13px] font-medium text-[#A32D2D]">
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          <span>{networkError}</span>
        </div>
      )}

      {/* Name row */}
      <div className="grid grid-cols-2 gap-3">
        <Field label="First name">
          <div className="relative">
            <User size={15} color="#B4B2A9" strokeWidth={2} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <Input
              placeholder="Jane"
              value={form.firstName}
              onChange={set("firstName")}
              autoComplete="given-name"
              className={inputCn}
            />
          </div>
        </Field>
        <Field label="Last name">
          <div className="relative">
            <User size={15} color="#B4B2A9" strokeWidth={2} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <Input
              placeholder="Doe"
              value={form.lastName}
              onChange={set("lastName")}
              autoComplete="family-name"
              className={inputCn}
            />
          </div>
        </Field>
      </div>

      {/* Password */}
      <Field label="Password" error={touched.password ? errors.password : undefined}>
        <div className="relative">
          <Lock size={15} color="#B4B2A9" strokeWidth={2} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <Input
            type={showPassword ? "text" : "password"}
            placeholder="Min. 10 characters"
            value={form.password}
            onChange={set("password")}
            onBlur={blur("password")}
            autoComplete="new-password"
            className={cn(inputCn, "pr-10")}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#B4B2A9] hover:text-[#0F6E56] transition-colors duration-150 border-none bg-transparent cursor-pointer p-0"
          >
            {showPassword ? <EyeOff size={15} strokeWidth={2} /> : <Eye size={15} strokeWidth={2} />}
          </button>
        </div>
      </Field>

      {/* Confirm password */}
      <Field label="Confirm password" error={touched.confirmPassword ? errors.confirmPassword : undefined}>
        <div className="relative">
          <Lock size={15} color="#B4B2A9" strokeWidth={2} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <Input
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Repeat your password"
            value={form.confirmPassword}
            onChange={set("confirmPassword")}
            onBlur={blur("confirmPassword")}
            autoComplete="new-password"
            className={cn(inputCn, "pr-10")}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword((v) => !v)}
            aria-label={showConfirmPassword ? "Hide password" : "Show password"}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#B4B2A9] hover:text-[#0F6E56] transition-colors duration-150 border-none bg-transparent cursor-pointer p-0"
          >
            {showConfirmPassword ? <EyeOff size={15} strokeWidth={2} /> : <Eye size={15} strokeWidth={2} />}
          </button>
        </div>
      </Field>

      <Button
        type="submit"
        disabled={isSubmitting}
        className={cn(
          "w-full h-11 rounded-[10px] mt-1 text-[14px] font-bold transition-all duration-200 border-none",
          !isSubmitting
            ? "bg-gradient-to-r from-[#0F6E56] to-[#1D9E75] text-white hover:opacity-90 shadow-[0_4px_20px_rgba(15,110,86,0.25)] cursor-pointer"
            : "bg-[#D3D1C7] text-[#5F5E5A] cursor-not-allowed",
        )}
      >
        {isSubmitting ? (
          <><Loader2 size={16} className="animate-spin" /> Activating…</>
        ) : (
          "Activate Account"
        )}
      </Button>
    </form>
  )
}

// ─── Inner page (uses useSearchParams — must be in Suspense) ──────────────────

function AcceptInviteInner() {
  const searchParams = useSearchParams()
  const token = searchParams.get("token")

  return (
    <div className="min-h-screen w-full grid grid-cols-1 md:grid-cols-2 bg-white overflow-hidden">
      <LeftPanel />

      <div className="flex flex-col justify-center overflow-y-auto px-6 py-10 sm:px-8 md:px-10">
        {/* Mobile logo */}
        <div className="flex md:hidden items-center gap-2.5 mb-8">
          <div className="w-[30px] h-[30px] rounded-[8px] bg-gradient-to-br from-[#0F6E56] to-[#1D9E75] flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M9 12l2 2 4-4" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M21 12c0 4.97-4.03 9-9 9S3 16.97 3 12 7.03 3 12 3s9 4.03 9 9z" stroke="white" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          <span className="text-[16px] font-bold text-[#2C2C2A] tracking-[-0.02em]">
            Flow<span className="text-[#0F6E56]">sign</span>
          </span>
        </div>

        {!token ? (
          <InvalidLinkState />
        ) : (
          <>
            <div className="mb-7">
              <h1 className="font-serif text-[26px] font-normal text-[#2C2C2A] tracking-[-0.02em] mb-1">
                You&apos;ve been invited to FlowSign
              </h1>
              <p className="text-[13px] text-[#5F5E5A]">
                Set your password to activate your account.
              </p>
            </div>
            <AcceptInviteForm token={token} />
          </>
        )}
      </div>
    </div>
  )
}

// ─── Page export ──────────────────────────────────────────────────────────────

export default function AcceptInvitePage() {
  return (
    <main className="min-h-screen w-full">
      <Suspense>
        <AcceptInviteInner />
      </Suspense>
    </main>
  )
}
