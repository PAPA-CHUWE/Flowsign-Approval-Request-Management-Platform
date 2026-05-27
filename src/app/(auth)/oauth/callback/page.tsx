"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getCurrentUser, storeAuthSession, AUTH_TOKEN_KEY } from "@/lib/api/auth";

const ERROR_MESSAGES: Record<string, string> = {
  account_not_found: "No FlowSign account was found for your email in this organisation. Ask your admin to invite you first.",
  invalid_state: "The sign-in request expired or was tampered with. Please try again.",
  access_denied: "You cancelled the sign-in. Please try again.",
  oauth_failed: "Something went wrong during sign-in. Please try again.",
  unsupported_provider: "That sign-in method is not supported.",
  missing_org: "Organisation slug is required to sign in with Google.",
};

function getErrorMessage(code: string | null): string {
  if (!code) return "An unexpected error occurred. Please try again.";
  return ERROR_MESSAGES[code] ?? `Sign-in failed (${code}). Please try again.`;
}

// ─── Spinner ──────────────────────────────────────────────────────────────────
function Spinner() {
  return (
    <svg
      className="animate-spin h-8 w-8 text-[#1D9E75]"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function OAuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    // Check for provider-side error redirected via query param
    const errorCode = searchParams.get("error");
    if (errorCode) {
      setErrorMessage(getErrorMessage(errorCode));
      setStatus("error");
      return;
    }

    // Extract JWT from URL hash: /auth/oauth/callback#token=<jwt>
    const hash = window.location.hash.slice(1); // remove leading "#"
    const params = new URLSearchParams(hash);
    const token = params.get("token");

    if (!token) {
      setErrorMessage(getErrorMessage("oauth_failed"));
      setStatus("error");
      return;
    }

    // Immediately wipe the hash from the browser history
    window.history.replaceState(null, "", window.location.pathname);

    // Store the token so apiClient can use it as a Bearer header
    window.localStorage.setItem(AUTH_TOKEN_KEY, token);

    // Fetch the full user profile
    getCurrentUser()
      .then((res) => {
        // Reconstruct an AuthResponse-compatible shape so storeAuthSession works
        storeAuthSession({
          statusCode: "200",
          message: "ok",
          responseBody: { token, user: res.responseBody.user },
        });
        router.replace("/dashboard");
      })
      .catch(() => {
        window.localStorage.removeItem(AUTH_TOKEN_KEY);
        setErrorMessage(getErrorMessage("oauth_failed"));
        setStatus("error");
      });
  }, [router, searchParams]);

  if (status === "error") {
    return (
      <div className="min-h-screen w-full bg-[#F1EFE8] flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-[#E8E6DE] p-8 text-center">
          {/* Error icon */}
          <div className="w-14 h-14 rounded-full bg-[#FCEBEB] border border-[#F5C6C6] flex items-center justify-center mx-auto mb-5">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="#A32D2D" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          <h1 className="font-serif text-[22px] font-normal text-[#2C2C2A] tracking-[-0.02em] mb-2">
            Sign-in failed
          </h1>
          <p className="text-[13px] text-[#5F5E5A] leading-relaxed mb-6">
            {errorMessage}
          </p>

          <button
            onClick={() => router.push("/login")}
            className="w-full h-11 rounded-[10px] bg-gradient-to-r from-[#0F6E56] to-[#1D9E75] text-white text-[14px] font-bold hover:opacity-90 transition-opacity cursor-pointer border-none"
          >
            Back to login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#F1EFE8] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Spinner />
        <p className="text-[14px] text-[#5F5E5A] font-medium">Signing you in&hellip;</p>
      </div>
    </div>
  );
}
