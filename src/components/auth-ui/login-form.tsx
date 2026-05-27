"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button }   from "@/components/ui/button";
import { Input }    from "@/components/ui/input";
import { Label }    from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { ApiError } from "@/lib/api/client";
import { login as loginUser, storeAuthSession } from "@/lib/api/auth";
import { AlertCircle, Building2, Eye, EyeOff, Loader2, Mail, Lock } from "lucide-react";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  "https://flowsign-approval-request-management-2ss4.onrender.com";
function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}
function MicrosoftIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
      <path d="M11.4 2H2v9.4h9.4V2z" fill="#F25022"/>
      <path d="M22 2h-9.4v9.4H22V2z" fill="#7FBA00"/>
      <path d="M11.4 12.6H2V22h9.4v-9.4z" fill="#00A4EF"/>
      <path d="M22 12.6h-9.4V22H22v-9.4z" fill="#FFB900"/>
    </svg>
  );
}

// ─── Shared input className ───────────────────────────────────────────────────
const inputCn =
  "h-11 pl-10 rounded-[10px] border-[#D3D1C7] bg-[#F1EFE8] " +
  "text-[14px] text-[#2C2C2A] placeholder:text-[#B4B2A9] " +
  "focus-visible:border-[#1D9E75] focus-visible:ring-[3px] " +
  "focus-visible:ring-[#E1F5EE] focus-visible:bg-white " +
  "transition-all duration-150";

// ─── Field wrapper ────────────────────────────────────────────────────────────
function Field({ label, children }: { label: string; children: React.ReactNode }) {
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
  Icon,
  label,
  onClick,
  disabled,
}: {
  Icon: React.ElementType;
  label: string;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={`Sign in with ${label}`}
      onClick={onClick}
      disabled={disabled}
      className="flex items-center justify-center gap-2 h-11 flex-1 rounded-[10px] border border-[#D3D1C7] bg-white text-[13px] font-medium text-[#5F5E5A] hover:border-[#1D9E75] hover:bg-[#E1F5EE] hover:text-[#0F6E56] transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <Icon size={16} />
      {label}
    </button>
  );
}

// ─── Left decorative panel ────────────────────────────────────────────────────
function LeftPanel() {
  return (
    <div className="relative hidden md:flex flex-col justify-between bg-gradient-to-br from-[#0F6E56] via-[#0D5E49] to-[#085041] p-10 overflow-hidden">

      {/* Dot grid — top left */}
      <div className="absolute top-6 left-6 grid grid-cols-5 gap-[6px] opacity-30">
        {Array.from({ length: 25 }).map((_, i) => (
          <div key={i} className="w-[3px] h-[3px] rounded-full bg-white" />
        ))}
      </div>

      {/* Floating shapes */}
      <div className="absolute top-8 right-8 w-20 h-20 rounded-full bg-white/10 border border-white/20" />
      <div className="absolute top-16 right-20 w-8 h-8 rounded-full bg-[#9FE1CB]/40" />
      <div className="absolute bottom-24 left-8 w-5 h-5 rounded-full bg-white/20" />
      <div className="absolute bottom-32 right-10 w-32 h-32 rounded-full bg-gradient-to-br from-[#9FE1CB]/30 to-[#1D9E75]/20 border border-white/10" />

      {/* Arc shape — bottom left */}
      <div className="absolute -bottom-10 -left-10 w-48 h-48 rounded-full border-[3px] border-[#9FE1CB]/30" />
      <div className="absolute -bottom-16 -left-4 w-36 h-36 rounded-full bg-gradient-to-tr from-[#9FE1CB]/20 to-transparent" />

      {/* Dot grid — bottom right */}
      <div className="absolute bottom-6 right-6 grid grid-cols-5 gap-[6px] opacity-20">
        {Array.from({ length: 25 }).map((_, i) => (
          <div key={i} className="w-[3px] h-[3px] rounded-full bg-white" />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 mt-8">
        {/* Logo mark */}
        <div className="w-12 h-12 rounded-[14px] bg-white/15 border border-white/25 flex items-center justify-center mb-10">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M9 12l2 2 4-4" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M21 12c0 4.97-4.03 9-9 9S3 16.97 3 12 7.03 3 12 3s9 4.03 9 9z" stroke="white" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>

        <h2 className="font-serif text-[clamp(28px,3vw,38px)] font-normal text-white leading-[1.15] tracking-[-0.02em] mb-4">
          Welcome
          <br />
          <span className="text-[#9FE1CB] italic">back.</span>
        </h2>

        <p className="text-[14px] text-white/65 leading-[1.65] max-w-[260px]">
          Sign back in and pick up right where you left off.
          Your approval queue is waiting.
        </p>
      </div>

      {/* Bottom trust items */}
      <div className="relative z-10 flex flex-col gap-3 mt-8">
        {[
          "End-to-end encrypted",
          "Immutable audit trail",
          "SOC 2 ready",
        ].map((item) => (
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
  );
}

// ─── LoginForm ────────────────────────────────────────────────────────────────
function slugify(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function getLoginErrorMessage(error: unknown) {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error) return error.message;
  return "Could not sign you in. Please try again.";
}

const OAUTH_ERROR_MESSAGES: Record<string, string> = {
  account_not_found: "No account found for your email in this organisation. Ask your admin to invite you first, then sign in with Google.",
  invalid_state: "Sign-in request expired. Please try again.",
  access_denied: "You cancelled the Google sign-in. You can try again below.",
  oauth_failed: "Google sign-in failed. Please try again or use your password.",
};

const LoginForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember]         = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm]                 = useState({ organizationSlug: "", email: "", password: "" });
  const [error, setError]               = useState("");
  const [oauthSlugError, setOauthSlugError] = useState(false);

  useEffect(() => {
    const errorCode = searchParams.get("error");
    if (errorCode) {
      setError(OAUTH_ERROR_MESSAGES[errorCode] ?? `Sign-in error: ${errorCode}`);
      // Pre-fill org slug hint from ?email= if backend sent it
      // (clean the URL so the error doesn't persist on refresh)
      window.history.replaceState(null, "", window.location.pathname);
    }
  }, [searchParams]);

  const handleOAuth = (provider: "google" | "microsoft") => {
    if (!form.organizationSlug) {
      setOauthSlugError(true);
      return;
    }
    setOauthSlugError(false);
    const url = `${API_BASE_URL}/api/v1/auth/oauth/${provider}?orgSlug=${encodeURIComponent(form.organizationSlug)}`;
    window.location.href = url;
  };

  const set = (key: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = key === "organizationSlug" ? slugify(e.target.value) : e.target.value;
      setForm((p) => ({ ...p, [key]: value }));
    };

  const valid =
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(form.organizationSlug) &&
    form.email.includes("@") &&
    form.password.length >= 6;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid || isSubmitting) return;
    setError("");
    setIsSubmitting(true);
    try {
      const response = await loginUser({
        organizationSlug: form.organizationSlug,
        email: form.email.trim().toLowerCase(),
        password: form.password,
      });
      storeAuthSession(response);
      router.push("/dashboard");
      router.refresh();
    } catch (reason) {
      setError(getLoginErrorMessage(reason));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#F1EFE8] flex items-center justify-center">
      <div className="min-h-screen w-full grid grid-cols-1 md:grid-cols-2 bg-white overflow-hidden">

        {/* Left decorative panel */}
        <LeftPanel />

        {/* Right: login form */}
        <div className="flex flex-col justify-center overflow-y-auto px-6 py-10 sm:px-8 md:px-10">

          {/* Mobile-only logo */}
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

          {/* Heading */}
          <div className="mb-7">
            <h1 className="font-serif text-[26px] font-normal text-[#2C2C2A] tracking-[-0.02em] mb-1">
              Hello! Welcome back.
            </h1>
            <p className="text-[13px] text-[#5F5E5A]">Sign in to your Flowsign account.</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">

            {error && (
              <div className="flex items-start gap-2.5 rounded-[10px] border border-[#F5C6C6] bg-[#FCEBEB] px-4 py-3 text-[13px] font-medium text-[#A32D2D]">
                <AlertCircle size={16} className="mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Organisation slug */}
            <Field label="Organisation slug">
              <div className="relative">
                <Building2 size={15} color="#B4B2A9" strokeWidth={2} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <Input
                  placeholder="solvify-technologies"
                  value={form.organizationSlug}
                  onChange={(e) => { setOauthSlugError(false); set("organizationSlug")(e); }}
                  autoComplete="organization"
                  className={cn(inputCn, oauthSlugError && "border-[#F5C6C6] focus-visible:border-[#A32D2D] focus-visible:ring-[#FCEBEB]")}
                />
              </div>
              {oauthSlugError && (
                <p className="text-[11px] text-[#A32D2D] flex items-center gap-1 mt-0.5">
                  <AlertCircle size={11} />
                  Enter your organisation slug before signing in with Google or Microsoft.
                </p>
              )}
            </Field>

            {/* Email */}
            <Field label="Email">
              <div className="relative">
                <Mail size={15} color="#B4B2A9" strokeWidth={2} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <Input type="email" placeholder="Enter your email address" value={form.email} onChange={set("email")} autoComplete="email" className={inputCn} />
              </div>
            </Field>

            {/* Password */}
            <Field label="Password">
              <div className="relative">
                <Lock size={15} color="#B4B2A9" strokeWidth={2} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <Input type={showPassword ? "text" : "password"} placeholder="••••••••••••" value={form.password} onChange={set("password")} autoComplete="current-password" className={cn(inputCn, "pr-10")} />
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

            {/* Remember me + Reset password */}
            <div className="flex items-center justify-between mt-0.5">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="remember"
                  checked={remember}
                  onCheckedChange={(v) => setRemember(!!v)}
                  className="border-[#D3D1C7] data-[state=checked]:bg-[#0F6E56] data-[state=checked]:border-[#0F6E56]"
                />
                <label htmlFor="remember" className="text-[12px] text-[#5F5E5A] cursor-pointer select-none">
                  Remember me
                </label>
              </div>
              <Link href="/forgot-password" className="text-[12px] font-semibold text-[#0F6E56] hover:underline transition-colors duration-150">
                Reset Password?
              </Link>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              disabled={!valid || isSubmitting}
              className={cn(
                "w-full h-11 rounded-[10px] mt-1 text-[14px] font-bold transition-all duration-200 border-none",
                valid && !isSubmitting
                  ? "bg-gradient-to-r from-[#0F6E56] to-[#1D9E75] text-white hover:opacity-90 shadow-[0_4px_20px_rgba(15,110,86,0.25)] cursor-pointer"
                  : "bg-[#D3D1C7] text-[#5F5E5A] cursor-not-allowed",
              )}
            >
              {isSubmitting ? (
                <><Loader2 size={16} className="animate-spin" />Signing in</>
              ) : "Login"}
            </Button>
          </form>

          {/* OR divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-[#E8E6DE]" />
            <span className="text-[11px] text-[#B4B2A9] font-medium">or</span>
            <div className="flex-1 h-px bg-[#E8E6DE]" />
          </div>

          {/* Social login */}
          <div className="flex gap-3">
            <SocialBtn Icon={GoogleIcon}    label="Google"    onClick={() => handleOAuth("google")}    disabled={isSubmitting} />
            <SocialBtn Icon={MicrosoftIcon} label="Microsoft" onClick={() => handleOAuth("microsoft")} disabled={isSubmitting} />
          </div>

          {/* Sign up link */}
          <p className="text-center text-[13px] text-[#5F5E5A] mt-6">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-[#0F6E56] font-semibold hover:underline">
              Create Account
            </Link>
          </p>

          {/* Legal links */}
          <div className="flex items-center justify-center gap-4 mt-4">
            <Link href="/terms" className="text-[11px] text-[#B4B2A9] hover:text-[#0F6E56] hover:underline transition-colors duration-150">
              Terms of Service
            </Link>
            <span className="w-[3px] h-[3px] rounded-full bg-[#D3D1C7]" />
            <Link href="/privacy" className="text-[11px] text-[#B4B2A9] hover:text-[#0F6E56] hover:underline transition-colors duration-150">
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
