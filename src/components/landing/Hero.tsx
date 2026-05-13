"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const SIGNATURE_PATH =
  "M 40 90 C 55 60, 65 45, 80 55 C 95 65, 85 85, 100 75 C 115 65, 120 45, 140 50 C 160 55, 155 80, 170 70 C 185 60, 195 40, 215 48 C 235 56, 228 78, 245 68 C 258 60, 265 42, 280 50";

function ApprovalCard({
  delay,
  type,
  amount,
  status,
  name,
  top,
  left,
  right,
}: {
  delay: number;
  type: string;
  amount: string;
  status: "approved" | "pending";
  name: string;
  top?: string;
  left?: string;
  right?: string;
}) {
  return (
    <div
      className="absolute z-10 animate-float-card"
      style={{ top, left, right, animationDelay: `${delay}s` }}
    >
      <div className="bg-white/[0.92] backdrop-blur-[12px] rounded-[14px] px-4 py-3 shadow-[0_8px_32px_rgba(15,110,86,0.12),0_2px_8px_rgba(0,0,0,0.06)] border border-white/80 min-w-[180px] font-dm-sans">
        <div className="flex items-center gap-2 mb-1.5">
          <div
            className={[
              "w-7 h-7 rounded-lg flex items-center justify-center text-[13px]",
              status === "approved" ? "bg-brand-success-bg" : "bg-brand-amber-pale",
            ].join(" ")}
          >
            {status === "approved" ? "✓" : "⏱"}
          </div>
          <div>
            <div className="text-[11px] text-brand-neutral-mid font-medium">{type}</div>
            <div className="text-[13px] text-brand-neutral-dark font-semibold">{amount}</div>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-[#888780]">{name}</span>
          <span
            className={[
              "text-[10px] px-2 py-0.5 rounded-full font-semibold",
              status === "approved"
                ? "bg-brand-success-bg text-brand-success-text"
                : "bg-brand-amber-pale text-brand-amber",
            ].join(" ")}
          >
            {status === "approved" ? "Approved" : "Pending"}
          </span>
        </div>
      </div>
    </div>
  );
}

function SigningIllustration() {
  const [signed, setSigned] = useState(false);
  const [signing, setSigning] = useState(false);
  const [pathLength, setPathLength] = useState(0);
  const pathRef = useRef<SVGPathElement>(null);

  const triggerSign = useCallback(() => {
    if (signing) return;
    setSigned(false);
    setSigning(true);
    setTimeout(() => {
      setSigning(false);
      setSigned(true);
    }, 1800);
  }, [signing]);

  useEffect(() => {
    if (pathRef.current) setPathLength(pathRef.current.getTotalLength());
    const t = setTimeout(() => {
      setSigned(false);
      setSigning(true);
      setTimeout(() => { setSigning(false); setSigned(true); }, 1800);
    }, 2000);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="relative w-full h-full">
      {/* Document card */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[52%] w-[min(340px,88%)] bg-white rounded-[20px] shadow-[0_24px_80px_rgba(15,110,86,0.18),0_4px_16px_rgba(0,0,0,0.08)] overflow-hidden border border-[rgba(15,110,86,0.1)]"
      >
        {/* Top bar */}
        <div className="bg-gradient-to-br from-[#0F6E56] to-[#1D9E75] px-5 py-4 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              <polyline points="14,2 14,8 20,8" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div>
            <div className="text-white text-[13px] font-bold font-dm-sans">Funds Request</div>
            <div className="text-white/70 text-[11px] font-dm-sans">REQ-2024-0847</div>
          </div>
          <div className="ml-auto bg-white/15 rounded-full px-2.5 py-1">
            <span className="text-white text-[11px] font-semibold font-dm-sans">$12,500</span>
          </div>
        </div>

        {/* Body */}
        <div className="px-5 pt-4">
          {[
            { label: "Requested by", value: "Amina Yusuf" },
            { label: "Department",   value: "Operations"  },
            { label: "Purpose",      value: "Q4 Equipment procurement" },
          ].map((row) => (
            <div key={row.label} className="flex justify-between mb-2.5">
              <span className="text-[11px] text-[#888780] font-dm-sans">{row.label}</span>
              <span className="text-[11px] text-brand-neutral-dark font-semibold font-dm-sans">{row.value}</span>
            </div>
          ))}

          {/* Approval chain */}
          <div className="bg-brand-neutral-pale rounded-[10px] px-3 py-2.5 my-1 mb-3.5">
            <div className="text-[10px] text-[#888780] mb-2 font-dm-sans font-semibold uppercase tracking-[0.05em]">
              Approval chain
            </div>
            <div className="flex items-center gap-1.5">
              {["LM", "FO", "CFO"].map((initials, i) => (
                <div key={initials} className="flex items-center gap-1">
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-[8px] font-bold text-white transition-colors duration-500 font-dm-sans"
                    style={{ background: i < 2 ? "#0F6E56" : signed ? "#0F6E56" : "#D3D1C7" }}
                  >
                    {initials}
                  </div>
                  {i < 2 && <div className="w-3.5 h-px bg-brand-neutral-light" />}
                </div>
              ))}
            </div>
          </div>

          {/* Signature area */}
          <div
            className={[
              "border-2 border-dashed rounded-xl px-3.5 pt-2.5 pb-2 mb-4 transition-all duration-400 cursor-pointer min-h-[72px] relative",
              signed ? "border-brand-teal-mid bg-[#F0FBF7]" : "border-brand-neutral-light bg-white",
            ].join(" ")}
            onClick={triggerSign}
          >
            <div className="text-[9px] text-[#888780] font-dm-sans font-semibold uppercase tracking-[0.06em] mb-1">
              CFO Signature
            </div>
            <svg width="100%" height="44" viewBox="0 0 320 100" style={{ overflow: "visible" }}>
              {pathLength > 0 && (
                <path
                  d={SIGNATURE_PATH}
                  fill="none"
                  stroke="#0F6E56"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray={pathLength}
                  strokeDashoffset={signing ? pathLength : signed ? 0 : pathLength}
                  style={{ transition: signing ? "stroke-dashoffset 1.6s cubic-bezier(0.4,0,0.2,1)" : "none" }}
                />
              )}
              <path ref={pathRef} d={SIGNATURE_PATH} fill="none" stroke="transparent" strokeWidth="2.5" />
            </svg>
            {!signed && !signing && (
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                <div className="text-[10px] text-[#B4B2A9] font-dm-sans">Click to sign</div>
              </div>
            )}
            {signed && (
              <div className="absolute bottom-2 right-3 flex items-center gap-1">
                <div className="w-3.5 h-3.5 rounded-full bg-brand-success-bg flex items-center justify-center">
                  <svg width="8" height="8" viewBox="0 0 12 12">
                    <path d="M2 6l3 3 5-5" stroke="#3B6D11" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <span className="text-[9px] text-brand-success-text font-semibold font-dm-sans">
                  Signed · {new Date().toLocaleDateString()}
                </span>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 pb-4">
            <button
              onClick={triggerSign}
              className={[
                "flex-1 py-2.5 rounded-[10px] border-none cursor-pointer text-[12px] font-bold font-dm-sans transition-all duration-300 flex items-center justify-center gap-1.5",
                signed
                  ? "bg-brand-success-bg text-brand-success-text"
                  : "bg-gradient-to-br from-[#0F6E56] to-[#1D9E75] text-white",
              ].join(" ")}
            >
              {signed ? <><span>✓</span> Approved</> : <><span>✍</span> Sign & Approve</>}
            </button>
            <button className="px-3.5 py-2.5 rounded-[10px] bg-brand-danger-bg border-none cursor-pointer text-brand-danger-text text-[12px] font-bold font-dm-sans">
              Reject
            </button>
          </div>
        </div>
      </div>

      {/* Floating cards */}
      <ApprovalCard delay={0}   type="Travel" amount="$3,450" status="approved" name="David O."  top="6%"  right="4%" />
      <ApprovalCard delay={1.2} type="Asset"  amount="$1,800" status="pending"  name="Lena M."   top="12%" left="2%"  />
      <ApprovalCard delay={0.6} type="Access" amount="CRM"    status="approved" name="Fatou D."  top="75%" right="2%" />

      {/* Decorative orbs */}
      <div className="absolute top-[8%] left-[8%] w-[180px] h-[180px] rounded-full bg-[radial-gradient(circle,rgba(29,158,117,0.12)_0%,transparent_70%)] pointer-events-none" />
      <div className="absolute bottom-[10%] right-[6%] w-[140px] h-[140px] rounded-full bg-[radial-gradient(circle,rgba(15,110,86,0.1)_0%,transparent_70%)] pointer-events-none" />
    </div>
  );
}

const Home = () => {
  return (
    <div className="min-h-screen bg-[#FAFAF8] font-dm-sans overflow-hidden ">
      {/* Hero — 2 columns */}
      <section className="min-h-screen pt-16 grid grid-cols-2 max-w-[1280px] mx-auto px-[clamp(24px,5vw,80px)] gap-10 items-center">
        {/* LEFT: Copy */}
        <div className="animate-fade-slide-up">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-brand-teal-pale border border-brand-teal-light rounded-full px-3.5 py-[5px] mb-7">
            <div className="relative w-2 h-2">
              <div className="absolute inset-0 rounded-full bg-brand-teal-mid animate-pulse-ring" />
              <div className="w-2 h-2 rounded-full bg-brand-teal" />
            </div>
            <span className="text-[12px] font-semibold text-brand-teal">Now live — Flowsign v1.0</span>
          </div>

          {/* Headline */}
          <h1 className="font-dm-serif text-[clamp(42px,4.5vw,62px)] font-normal leading-[1.08] text-brand-neutral-dark mb-6 tracking-[-0.02em]">
            Approvals that
            <br />
            <span className="text-brand-teal italic">move</span> at the
            <br />
            speed of work.
          </h1>

          {/* Subheading */}
          <p className="text-[17px] text-brand-neutral-mid leading-[1.65] mb-10 max-w-[440px]">
            Flowsign routes every request — funds, travel, assets, access —
            through the right approvers, automatically. No chasing, no lost emails,
            full audit trail.
          </p>

          {/* CTAs */}
          <div className="flex gap-3 mb-[52px] flex-wrap">
            <button className="cta-primary flex items-center gap-2 px-7 py-3.5 rounded-[10px] bg-gradient-to-br from-[#0F6E56] to-[#1D9E75] border-none cursor-pointer text-white text-[15px] font-bold shadow-[0_4px_20px_rgba(15,110,86,0.25)] transition-all duration-200">
              Start for free
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M5 12h14M12 5l7 7-7 7" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <button className="cta-secondary flex items-center gap-2 px-6 py-3.5 rounded-[10px] bg-[rgba(15,110,86,0.06)] border border-[rgba(15,110,86,0.2)] cursor-pointer text-brand-teal text-[15px] font-semibold transition-all duration-200">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <polygon points="5,3 19,12 5,21" fill="#0F6E56"/>
              </svg>
              Watch demo
            </button>
          </div>

          {/* Stats */}
          <div className="flex gap-3 flex-wrap">
            {[
              { value: "3.2min", label: "Avg. approval time" },
              { value: "98%",    label: "Audit compliance"   },
              { value: "40+",    label: "Org templates"      },
            ].map((stat) => (
              <div
                key={stat.value}
                className="hero-stat bg-white border border-[#E8E6DE] rounded-xl px-[18px] py-3 transition-all duration-200 cursor-default"
              >
                <div className="text-[20px] font-bold text-brand-teal leading-[1.2]">{stat.value}</div>
                <div className="text-[11px] text-[#888780] font-medium mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Social proof */}
          <div className="mt-10 flex items-center gap-4 flex-wrap">
            <span className="text-[11px] text-[#B4B2A9] font-semibold uppercase tracking-[0.08em]">Trusted by</span>
            {["Acme Corp", "Meridian", "NovaTech", "Vela Group"].map((org) => (
              <div
                key={org}
                className="text-[12px] font-bold text-[#B4B2A9] px-3 py-1 border border-[#E8E6DE] rounded-md tracking-[0.02em]"
              >
                {org}
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT: Signing illustration */}
        <div className="relative h-[clamp(500px,65vh,720px)] animate-fade-in">
          {/* Background shape */}
          <div className="absolute top-[5%] left-[5%] right-[5%] bottom-[5%] bg-gradient-to-br from-brand-teal-pale to-[#B5D4F4] rounded-[32px] opacity-35" />
          {/* Dot grid */}
          <div
            className="absolute inset-0 rounded-[32px] opacity-[0.05]"
            style={{ backgroundImage: "radial-gradient(circle, #0F6E56 1px, transparent 1px)", backgroundSize: "24px 24px" }}
          />
          <SigningIllustration />
        </div>
      </section>
    </div>
  );
};

export default Home;
