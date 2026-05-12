"use client";

import { useState } from "react";
import Link from "next/link";
import { Button }   from "@/components/ui/button";
import { Input }    from "@/components/ui/input";
import { Label }    from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { Eye, EyeOff, Mail, Lock, User, Building2 } from "lucide-react";
import { FaGoogle, FaMicrosoft } from "react-icons/fa6";

// ─── Design tokens ────────────────────────────────────────────────────────────
const T = {
  tealDark:    "#0F6E56",
  tealMid:     "#1D9E75",
  tealLight:   "#9FE1CB",
  tealPale:    "#E1F5EE",
  neutralDark: "#2C2C2A",
  neutralMid:  "#5F5E5A",
  neutralLight:"#D3D1C7",
  neutralPale: "#F1EFE8",
  white:       "#FFFFFF",
} as const;

// ─── Shared input className ───────────────────────────────────────────────────
const inputCn =
  "h-11 pl-10 rounded-[10px] border-[#D3D1C7] bg-[#F1EFE8] " +
  "text-[14px] text-[#2C2C2A] placeholder:text-[#B4B2A9] " +
  "focus-visible:border-[#1D9E75] focus-visible:ring-[3px] " +
  "focus-visible:ring-[#E1F5EE] focus-visible:bg-white " +
  "transition-all duration-150";

// ─── Field wrapper ────────────────────────────────────────────────────────────
function Field({
  label, children,
}: {
  label: string; children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-[12px] font-semibold text-[#5F5E5A] tracking-wide">
        {label}
      </Label>
      {children}
    </div>
  );
}

// ─── Social button ────────────────────────────────────────────────────────────
function SocialBtn({
  Icon, label,
}: {
  Icon: React.ElementType; label: string;
}) {
  return (
    <button
      type="button"
      aria-label={`Sign up with ${label}`}
      className="flex items-center justify-center gap-2
                 h-11 flex-1 rounded-[10px]
                 border border-[#D3D1C7] bg-white
                 text-[13px] font-medium text-[#5F5E5A]
                 hover:border-[#1D9E75] hover:bg-[#E1F5EE] hover:text-[#0F6E56]
                 transition-all duration-150 cursor-pointer"
    >
      <Icon size={16} />
      {label}
    </button>
  );
}

// ─── Left decorative panel ────────────────────────────────────────────────────
function LeftPanel() {
  return (
    <div className="relative hidden md:flex flex-col justify-between
                    bg-gradient-to-br from-[#0F6E56] via-[#0D5E49] to-[#085041]
                    p-10 overflow-hidden">

      {/* Dot grid top-left — inspired by the dot pattern in the reference */}
      <div className="absolute top-6 left-6 grid grid-cols-5 gap-[6px] opacity-30">
        {Array.from({ length: 25 }).map((_, i) => (
          <div key={i} className="w-[3px] h-[3px] rounded-full bg-white" />
        ))}
      </div>

      {/* Abstract floating shapes — inspired by the geometric blobs */}
      <div className="absolute top-8 right-8 w-20 h-20 rounded-full
                      bg-white/10 border border-white/20" />
      <div className="absolute top-16 right-20 w-8 h-8 rounded-full
                      bg-[#9FE1CB]/40" />
      <div className="absolute bottom-24 left-8 w-5 h-5 rounded-full
                      bg-white/20" />
      <div className="absolute bottom-32 right-10
                      w-32 h-32 rounded-full
                      bg-gradient-to-br from-[#9FE1CB]/30 to-[#1D9E75]/20
                      border border-white/10" />
      {/* Arc shape bottom — like the semicircle in the reference */}
      <div className="absolute -bottom-10 -left-10
                      w-48 h-48 rounded-full
                      border-[3px] border-[#9FE1CB]/30" />
      <div className="absolute -bottom-16 -left-4
                      w-36 h-36 rounded-full
                      bg-gradient-to-tr from-[#9FE1CB]/20 to-transparent" />

      {/* Dot grid bottom-right */}
      <div className="absolute bottom-6 right-6 grid grid-cols-5 gap-[6px] opacity-20">
        {Array.from({ length: 25 }).map((_, i) => (
          <div key={i} className="w-[3px] h-[3px] rounded-full bg-white" />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 mt-8">
        {/* Logo mark */}
        <div className="w-12 h-12 rounded-[14px]
                        bg-white/15 border border-white/25
                        flex items-center justify-center mb-10">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M9 12l2 2 4-4"
              stroke="white" strokeWidth="2.5"
              strokeLinecap="round" strokeLinejoin="round" />
            <path d="M21 12c0 4.97-4.03 9-9 9S3 16.97 3 12 7.03 3 12 3s9 4.03 9 9z"
              stroke="white" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>

        {/* Headline — "Adventure starts here" equivalent */}
        <h2 className="font-serif text-[clamp(28px,3vw,38px)] font-normal
                       text-white leading-[1.15] tracking-[-0.02em] mb-4">
          Your approvals
          <br />
          <span className="text-[#9FE1CB] italic">start here.</span>
        </h2>

        <p className="text-[14px] text-white/65 leading-[1.65] max-w-[260px]">
          Create an account and join organisations that have replaced
          email chains with structured, signed approvals.
        </p>
      </div>

      {/* Bottom perks */}
      <div className="relative z-10 flex flex-col gap-3 mt-8">
        {[
          "Free 14-day trial — no credit card",
          "Setup in under 10 minutes",
          "Cancel any time",
        ].map((perk) => (
          <div key={perk} className="flex items-center gap-2.5">
            <div className="w-4 h-4 rounded-full bg-[#9FE1CB]/30
                            border border-[#9FE1CB]/60
                            flex items-center justify-center shrink-0">
              <svg width="8" height="8" viewBox="0 0 12 12">
                <path d="M2 6l3 3 5-5"
                  stroke="#9FE1CB" strokeWidth="1.8" fill="none"
                  strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span className="text-[12px] text-white/70">{perk}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── SignupForm ───────────────────────────────────────────────────────────────
const SignupForm = () => {
  const [showPassword, setShowPassword]   = useState(false);
  const [agreed, setAgreed]               = useState(false);
  const [form, setForm]                   = useState({
    name: "", org: "", email: "", password: "",
  });

  const set = (key: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((p) => ({ ...p, [key]: e.target.value }));

  const valid =
    form.name.trim() &&
    form.email.includes("@") &&
    form.password.length >= 8 &&
    agreed;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid) return;
    // TODO: wire up to auth
  };

  return (
    <div className="w-screen h-screen bg-[#F1EFE8]
                    flex items-center justify-center">

      {/* ── Two-column card ── */}
      <div className="w-full h-full
                      grid grid-cols-1 md:grid-cols-2
                      bg-white overflow-hidden">

        {/* Left panel */}
        <LeftPanel />

        {/* ── Right: form ── */}
        <div className="px-8 py-10 md:px-10 mb-8 flex flex-col justify-center overflow-y-auto">

          {/* Logo — visible on mobile only (left panel hidden on mobile) */}
          <div className="flex md:hidden items-center gap-2.5 mb-8">
            <div className="w-[30px] h-[30px] rounded-[8px]
                            bg-gradient-to-br from-[#0F6E56] to-[#1D9E75]
                            flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M9 12l2 2 4-4" stroke="white" strokeWidth="2.5"
                  strokeLinecap="round" strokeLinejoin="round" />
                <path d="M21 12c0 4.97-4.03 9-9 9S3 16.97 3 12 7.03 3 12 3s9 4.03 9 9z"
                  stroke="white" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <span className="text-[16px] font-bold text-[#2C2C2A] tracking-[-0.02em]">
              Flow<span className="text-[#0F6E56]">sign</span>
            </span>
          </div>

          {/* Heading — "Hello! Welcome back" equivalent */}
          <div className="mb-7">
            <h1 className="font-serif text-[26px] font-normal
                           text-[#2C2C2A] tracking-[-0.02em] mb-1">
              Hello! Welcome.
            </h1>
            <p className="text-[13px] text-[#5F5E5A]">
              Create your Flowsign account — it takes 60 seconds.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">

            {/* Full name */}
            <Field label="Full name">
              <div className="relative">
                <User
                  size={15} color="#B4B2A9" strokeWidth={2}
                  className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                />
                <Input
                  placeholder="Jane Smith"
                  value={form.name}
                  onChange={set("name")}
                  className={inputCn}
                />
              </div>
            </Field>

            {/* Organisation + Work email — side by side */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Field label="Organisation name">
                  <div className="relative">
                    <Building2
                      size={15} color="#B4B2A9" strokeWidth={2}
                      className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                    />
                    <Input
                      placeholder="Meridian Capital"
                      value={form.org}
                      onChange={set("org")}
                      className={inputCn}
                    />
                  </div>
                </Field>
              </div>

              <div className="flex-1">
                <Field label="Work email">
                  <div className="relative">
                    <Mail
                      size={15} color="#B4B2A9" strokeWidth={2}
                      className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                    />
                    <Input
                      type="email"
                      placeholder="jane@organisation.com"
                      value={form.email}
                      onChange={set("email")}
                      className={inputCn}
                    />
                  </div>
                </Field>
              </div>
            </div>

            {/* Password */}
            <Field label="Password">
              <div className="relative">
                <Lock
                  size={15} color="#B4B2A9" strokeWidth={2}
                  className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Min. 8 characters"
                  value={form.password}
                  onChange={set("password")}
                  className={cn(inputCn, "pr-10")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2
                             text-[#B4B2A9] hover:text-[#0F6E56]
                             transition-colors duration-150
                             border-none bg-transparent cursor-pointer p-0"
                >
                  {showPassword
                    ? <EyeOff size={15} strokeWidth={2} />
                    : <Eye    size={15} strokeWidth={2} />
                  }
                </button>
              </div>
            </Field>

            {/* Terms checkbox */}
            <div className="flex items-start gap-2.5 mt-1">
              <Checkbox
                id="terms"
                checked={agreed}
                onCheckedChange={(v) => setAgreed(!!v)}
                className="mt-0.5 border-[#D3D1C7] data-[state=checked]:bg-[#0F6E56]
                           data-[state=checked]:border-[#0F6E56]"
              />
              <label
                htmlFor="terms"
                className="text-[12px] text-[#5F5E5A] leading-[1.5] cursor-pointer"
              >
                I agree to Flowsign's{" "}
                <Link href="/terms"
                  className="text-[#0F6E56] font-semibold hover:underline">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/privacy"
                  className="text-[#0F6E56] font-semibold hover:underline">
                  Privacy Policy
                </Link>
              </label>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              disabled={!valid}
              className={cn(
                "w-full h-11 rounded-[10px] mt-1",
                "text-[14px] font-bold transition-all duration-200",
                valid
                  ? "bg-gradient-to-r from-[#0F6E56] to-[#1D9E75] text-white " +
                    "hover:opacity-90 shadow-[0_4px_20px_rgba(15,110,86,0.25)] cursor-pointer"
                  : "bg-[#D3D1C7] text-[#5F5E5A] cursor-not-allowed",
              )}
            >
              Create account
            </Button>
          </form>

          {/* OR divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-[#E8E6DE]" />
            <span className="text-[11px] text-[#B4B2A9] font-medium">or</span>
            <div className="flex-1 h-px bg-[#E8E6DE]" />
          </div>

          {/* Social sign-up — Google + Microsoft like the reference */}
          <div className="flex gap-3">
            <SocialBtn Icon={FaGoogle}    label="Google"    />
            <SocialBtn Icon={FaMicrosoft} label="Microsoft" />
          </div>

          {/* Sign in link — "Don't have an account? Create Account" equivalent */}
          <p className="text-center text-[13px] text-[#5F5E5A] mt-6">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-[#0F6E56] font-semibold hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupForm;