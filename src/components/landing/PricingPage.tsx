"use client";

import { useState } from "react";
import {
  Zap, Rocket, Building2, Users, Check, Minus,
  ArrowRight, Shield, Star, BadgeCheck,
} from "lucide-react";

interface Plan {
  id: string; name: string; Icon: React.ElementType;
  monthlyPrice: number | null; annualPrice: number | null;
  tagline: string; accent: string; accentPale: string;
  featured: boolean; badge?: string;
  features: { text: string; included: boolean }[];
  cta: string;
}

const PLANS: Plan[] = [
  {
    id: "starter", name: "Starter", Icon: Zap,
    monthlyPrice: 49, annualPrice: 39,
    tagline: "For small teams getting started",
    accent: "#0F6E56", accentPale: "#E1F5EE", featured: false,
    features: [
      { text: "Up to 25 seats",      included: true  },
      { text: "All 6 request types", included: true  },
      { text: "3 workflow rules",    included: true  },
      { text: "Email notifications", included: true  },
      { text: "30-day audit log",    included: true  },
      { text: "Analytics dashboard", included: false },
      { text: "SSO / SAML",         included: false },
    ],
    cta: "Start free trial",
  },
  {
    id: "growth", name: "Growth", Icon: Rocket,
    monthlyPrice: 149, annualPrice: 119,
    tagline: "For scaling teams that need full control",
    accent: "#0F6E56", accentPale: "#E1F5EE", featured: true, badge: "Most popular",
    features: [
      { text: "Up to 100 seats",          included: true },
      { text: "All 6 request types",      included: true },
      { text: "Unlimited workflow rules", included: true },
      { text: "Email + Slack + in-app",   included: true },
      { text: "1-year audit log",         included: true },
      { text: "Analytics dashboard",      included: true },
      { text: "Manager delegation",       included: true },
    ],
    cta: "Start free trial",
  },
  {
    id: "business", name: "Business", Icon: Building2,
    monthlyPrice: 399, annualPrice: 319,
    tagline: "For compliance-focused organisations",
    accent: "#185FA5", accentPale: "#E6F1FB", featured: false,
    features: [
      { text: "Up to 500 seats",          included: true },
      { text: "All 6 request types",      included: true },
      { text: "Unlimited workflow rules", included: true },
      { text: "Email + Slack + in-app",   included: true },
      { text: "Unlimited audit log",      included: true },
      { text: "Analytics dashboard",      included: true },
      { text: "SSO / SAML + REST API",    included: true },
    ],
    cta: "Start free trial",
  },
  {
    id: "enterprise", name: "Enterprise", Icon: Users,
    monthlyPrice: null, annualPrice: null,
    tagline: "Custom contracts, on-prem, white-label",
    accent: "#534AB7", accentPale: "#EEEDFE", featured: false,
    features: [
      { text: "Unlimited seats",           included: true },
      { text: "Custom request types",      included: true },
      { text: "Dedicated SLA support",     included: true },
      { text: "On-premise deployment",     included: true },
      { text: "Compliance review package", included: true },
      { text: "White-label branding",      included: true },
      { text: "Volume pricing discounts",  included: true },
    ],
    cta: "Contact sales",
  },
];

const COMPARISON = [
  { label: "Seats",             values: ["25",      "100",       "500",       "Unlimited"]  },
  { label: "Request types",     values: ["6",       "6",         "6",         "6 + custom"] },
  { label: "Workflow rules",    values: ["3",       "Unlimited", "Unlimited", "Unlimited"]  },
  { label: "Audit log",         values: ["30 days", "1 year",    "Unlimited", "Unlimited"]  },
  { label: "Notifications",     values: ["Email",   "Email+Slack","Email+Slack","Custom"]   },
  { label: "Analytics",         values: ["—",       "✓",         "✓",         "✓"]         },
  { label: "SSO / SAML",        values: ["—",       "—",         "✓",         "✓"]         },
  { label: "REST API",          values: ["—",       "—",         "✓",         "✓"]         },
  { label: "On-premise",        values: ["—",       "—",         "—",         "✓"]         },
  { label: "Dedicated support", values: ["—",       "—",         "—",         "✓"]         },
];

// ─── Billing toggle ───────────────────────────────────────────────────────────
function Toggle({ annual, onChange }: { annual: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="inline-flex bg-brand-neutral-pale rounded-[30px] p-1 gap-1 border border-brand-neutral-light">
      {(["Monthly", "Annual"] as const).map((label) => {
        const active = (label === "Annual") === annual;
        return (
          <button
            key={label}
            onClick={() => onChange(label === "Annual")}
            className={[
              "flex items-center gap-2 px-6 py-[9px] rounded-[26px] border-none cursor-pointer text-[13px] font-bold font-dm-sans tracking-[0.05em] transition-all duration-200",
              active ? "bg-brand-teal text-white" : "bg-transparent text-brand-neutral-mid",
            ].join(" ")}
          >
            {label}
            {label === "Annual" && (
              <span className={["text-[10px] px-[7px] py-0.5 rounded-[10px] font-bold", active ? "bg-white/20 text-white" : "bg-brand-teal-pale text-brand-teal"].join(" ")}>
                −20%
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

// ─── Plan card ────────────────────────────────────────────────────────────────
function PlanCard({ plan, annual }: { plan: Plan; annual: boolean }) {
  const [hov, setHov] = useState(false);
  const price = annual ? plan.annualPrice : plan.monthlyPrice;
  const { Icon, accent, accentPale, featured } = plan;

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      className="relative rounded-[20px] transition-transform duration-200"
      style={{
        background: featured
          ? `linear-gradient(160deg, #1D9E75, #0F6E56 60%, #9FE1CB)`
          : `linear-gradient(160deg, #D3D1C7, #F1EFE8)`,
        padding: featured ? "2px" : "1px",
        transform: featured ? "scale(1.03)" : hov ? "translateY(-4px)" : "none",
        zIndex: featured ? 2 : 1,
        boxShadow: featured
          ? "0 20px 60px rgba(15,110,86,0.18), 0 4px 16px rgba(15,110,86,0.1)"
          : hov ? "0 16px 40px rgba(0,0,0,0.08)" : "0 2px 12px rgba(0,0,0,0.04)",
      }}
    >
      {plan.badge && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-10 bg-gradient-to-r from-brand-teal to-brand-teal-mid text-white text-[10px] font-bold px-4 py-[5px] rounded-full font-dm-sans tracking-[0.08em] whitespace-nowrap shadow-[0_4px_12px_rgba(15,110,86,0.3)]">
          ★ {plan.badge}
        </div>
      )}

      <div className="bg-white rounded-[18px] px-[26px] py-8 flex flex-col h-full">
        {/* Icon */}
        <div
          className="w-[52px] h-[52px] rounded-[14px] flex items-center justify-center mb-[18px] border-[1.5px]"
          style={{
            background: featured ? "#E1F5EE" : accentPale,
            borderColor: featured ? "#9FE1CB" : "#D3D1C7",
          }}
        >
          <Icon size={22} color={featured ? "#0F6E56" : accent} strokeWidth={1.8} />
        </div>

        {/* Plan name pill */}
        <div
          className="inline-flex self-start rounded-full px-3 py-[3px] mb-[18px] border"
          style={{
            borderColor: featured ? "#9FE1CB" : "#D3D1C7",
            background: featured ? "#E1F5EE" : "transparent",
          }}
        >
          <span
            className="text-[11px] font-bold tracking-[0.07em] uppercase font-dm-sans"
            style={{ color: featured ? "#0F6E56" : "#5F5E5A" }}
          >
            {plan.name}
          </span>
        </div>

        {/* Price */}
        <div className="flex items-start gap-[3px] mb-1.5">
          {price !== null ? (
            <>
              <span className="text-[15px] font-bold mt-[9px] font-dm-sans" style={{ color: featured ? "#0F6E56" : "#5F5E5A" }}>$</span>
              <span className="text-[54px] font-extrabold leading-none tracking-[-0.03em] font-dm-sans" style={{ color: featured ? "#0F6E56" : "#2C2C2A" }}>
                {price}
              </span>
              <span className="text-[12px] text-brand-neutral-mid self-end mb-2 font-dm-sans">/mo</span>
            </>
          ) : (
            <span className="text-[40px] font-extrabold leading-none text-brand-neutral-dark font-dm-sans">Custom</span>
          )}
        </div>

        {annual && price !== null && (
          <p className="text-[11px] text-brand-teal-mid mb-2.5 font-dm-sans font-semibold">
            Billed annually · saves ${((plan.monthlyPrice! - price) * 12).toLocaleString()}/yr
          </p>
        )}

        <p className="text-[13px] text-brand-neutral-mid leading-[1.5] mb-[22px] font-dm-sans">{plan.tagline}</p>

        <div className="h-px bg-brand-neutral-pale mb-5" />

        <ul className="list-none p-0 mb-7 flex flex-col gap-2.5 flex-1">
          {plan.features.map((f) => (
            <li key={f.text} className="flex items-center gap-2.5">
              <div
                className="w-[18px] h-[18px] rounded-full shrink-0 flex items-center justify-center"
                style={{
                  background: f.included ? (featured ? "#E1F5EE" : accentPale) : "transparent",
                  border: f.included ? "none" : "1px solid #D3D1C7",
                }}
              >
                {f.included
                  ? <Check size={10} color={featured ? "#0F6E56" : accent} strokeWidth={3} />
                  : <Minus size={10} color="#D3D1C7" strokeWidth={2} />
                }
              </div>
              <span className="text-[13px] font-dm-sans" style={{ color: f.included ? "#2C2C2A" : "#D3D1C7" }}>
                {f.text}
              </span>
            </li>
          ))}
        </ul>

        <button
          className="w-full py-[13px] px-5 rounded-xl cursor-pointer text-[13px] font-bold tracking-[0.04em] font-dm-sans flex items-center justify-center gap-2 transition-all duration-200"
          style={{
            border: featured ? "none" : `1.5px solid ${accent === "#0F6E56" ? "#9FE1CB" : "#D3D1C7"}`,
            background: featured ? `linear-gradient(135deg, #0F6E56, #1D9E75)` : "transparent",
            color: featured ? "#ffffff" : accent,
            boxShadow: featured ? "0 4px 20px rgba(15,110,86,0.25)" : "none",
          }}
        >
          <Icon size={14} strokeWidth={2} />
          {plan.cta}
          <ArrowRight size={14} strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}

// ─── Comparison table ─────────────────────────────────────────────────────────
function ComparisonTable() {
  return (
    <div className="rounded-[16px] border border-brand-neutral-light overflow-hidden">
      <div className="grid grid-cols-[2fr_repeat(4,1fr)] bg-brand-teal px-6 py-3.5">
        <span className="text-[12px] text-white/60 font-semibold font-dm-sans">Feature</span>
        {PLANS.map((p) => (
          <span key={p.id} className="text-[12px] font-bold text-center font-dm-sans" style={{ color: p.featured ? "#9FE1CB" : "rgba(255,255,255,0.75)" }}>
            {p.name}
          </span>
        ))}
      </div>
      {COMPARISON.map((row, i) => (
        <div
          key={row.label}
          className={["grid grid-cols-[2fr_repeat(4,1fr)] px-6 py-[13px]", i < COMPARISON.length - 1 ? "border-b border-brand-neutral-pale" : "", i % 2 === 0 ? "bg-white" : "bg-brand-neutral-pale"].join(" ")}
        >
          <span className="text-[13px] text-brand-neutral-mid font-dm-sans">{row.label}</span>
          {row.values.map((v, vi) => (
            <div key={vi} className="flex justify-center items-center">
              {v === "✓" ? (
                <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: PLANS[vi].featured ? "#E1F5EE" : "#EAF3DE" }}>
                  <Check size={11} color={PLANS[vi].featured ? "#0F6E56" : "#27500A"} strokeWidth={3} />
                </div>
              ) : (
                <span
                  className="text-[13px] font-dm-sans"
                  style={{
                    color: v === "—" ? "#D3D1C7" : PLANS[vi].featured ? "#0F6E56" : "#2C2C2A",
                    fontWeight: v !== "—" ? 600 : 400,
                  }}
                >
                  {v}
                </span>
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

// ─── FAQ ──────────────────────────────────────────────────────────────────────
function FAQ() {
  const [open, setOpen] = useState<number | null>(null);
  const items = [
    { q: "Is there a free trial?",                       a: "Yes — every plan starts with a 14-day free trial, full access, no credit card required." },
    { q: "Can I change plan later?",                     a: "Absolutely. Upgrade or downgrade at any time. Upgrades are prorated; downgrades take effect at the next billing cycle." },
    { q: "How does annual billing work?",                a: "Billed once a year at the annual rate — 20% less than monthly. Switch between billing cycles at any renewal date." },
    { q: "What counts as a seat?",                       a: "Any user who can log in — employees, managers, admins. Approvers who only receive email links do not use a seat." },
    { q: "Do you offer NGO or public-sector discounts?", a: "Yes — 30% off for registered non-profits, NGOs, and government bodies. Contact us with your organisation details." },
  ];
  return (
    <div className="max-w-[660px] mx-auto">
      {items.map((item, i) => (
        <div key={item.q} className="border-b border-brand-neutral-light">
          <button
            onClick={() => setOpen(open === i ? null : i)}
            className="w-full bg-none border-none cursor-pointer py-5 flex justify-between items-center gap-4"
          >
            <span className="text-[15px] font-semibold text-brand-neutral-dark text-left font-dm-sans">{item.q}</span>
            <div
              className="w-[26px] h-[26px] rounded-full shrink-0 flex items-center justify-center border transition-all duration-200"
              style={{
                background: open === i ? "#E1F5EE" : "#F1EFE8",
                borderColor: open === i ? "#9FE1CB" : "#D3D1C7",
              }}
            >
              <span className="text-[16px] leading-none" style={{ color: open === i ? "#0F6E56" : "#5F5E5A" }}>
                {open === i ? "−" : "+"}
              </span>
            </div>
          </button>
          {open === i && (
            <p className="text-[14px] text-brand-neutral-mid leading-[1.7] mb-5 font-dm-sans">{item.a}</p>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── PricingPage ──────────────────────────────────────────────────────────────
const PricingPage = () => {
  const [annual, setAnnual] = useState(false);

  return (
    <div className="bg-white min-h-screen font-dm-sans" id="pricing">

      {/* Hero */}
      <div
        className="text-center px-[clamp(24px,6vw,100px)] pt-20 pb-[60px] border-b border-brand-neutral-light"
        style={{ background: "linear-gradient(180deg, rgba(225,245,238,0.7) 0%, #ffffff 100%)" }}
        data-aos="fade-up"
      >
        <div className="inline-flex items-center gap-1.5 bg-brand-teal-pale border border-brand-teal-light rounded-full px-3.5 py-[5px] mb-6">
          <Star size={12} color="#0F6E56" strokeWidth={2.5} />
          <span className="text-[12px] font-bold text-brand-teal font-dm-sans">Simple, transparent pricing</span>
        </div>
        <h1 className="font-dm-serif text-[clamp(36px,5vw,60px)] font-normal text-brand-neutral-dark leading-[1.08] tracking-[-0.02em] mb-[18px]">
          Flexible pricing for{" "}
          <span className="text-brand-teal italic">teams of all sizes.</span>
        </h1>
        <p className="text-[17px] text-brand-neutral-mid leading-[1.65] max-w-[500px] mx-auto mb-10 font-dm-sans">
          Start free, scale when you&apos;re ready. Every plan includes a 14-day trial with no credit card required.
        </p>
        <Toggle annual={annual} onChange={setAnnual} />
      </div>

      {/* Cards */}
      <div className="max-w-[1180px] mx-auto px-[clamp(24px,5vw,60px)] pt-[60px] pb-20 grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-5 items-center">
        {PLANS.map((plan, i) => (
          <div key={plan.id} data-aos="fade-up" data-aos-delay={i * 75}>
            <PlanCard plan={plan} annual={annual} />
          </div>
        ))}
      </div>

      {/* Trust strip */}
      <div className="flex justify-center gap-9 flex-wrap px-6 pb-20 border-b border-brand-neutral-pale" data-aos="fade-up">
        {[
          { Icon: Shield,     text: "SOC 2 ready"      },
          { Icon: BadgeCheck, text: "GDPR compliant"   },
          { Icon: Star,       text: "99.9% uptime SLA" },
          { Icon: Check,      text: "Cancel anytime"   },
        ].map(({ Icon, text }) => (
          <div key={text} className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-brand-teal-pale flex items-center justify-center">
              <Icon size={14} color="#0F6E56" strokeWidth={2} />
            </div>
            <span className="text-[13px] text-brand-neutral-mid font-dm-sans">{text}</span>
          </div>
        ))}
      </div>

      {/* Comparison table */}
      <div className="max-w-[960px] mx-auto px-[clamp(24px,5vw,60px)] py-20" data-aos="fade-up">
        <div className="text-center mb-12">
          <h2 className="font-dm-serif text-[clamp(28px,3vw,40px)] font-normal text-brand-neutral-dark tracking-[-0.02em] mb-3">
            Compare all plans
          </h2>
          <p className="text-[15px] text-brand-neutral-mid font-dm-sans">Everything you need to make the right call.</p>
        </div>
        <ComparisonTable />
      </div>

      {/* FAQ */}
      <div className="bg-brand-neutral-pale px-[clamp(24px,6vw,100px)] py-20 border-t border-brand-neutral-light" data-aos="fade-up">
        <div className="text-center mb-12">
          <h2 className="font-dm-serif text-[clamp(28px,3vw,40px)] font-normal text-brand-neutral-dark tracking-[-0.02em]">
            Frequently asked questions
          </h2>
        </div>
        <FAQ />
      </div>

      {/* CTA band */}
      <div className="bg-gradient-to-br from-brand-teal to-[#085041] px-[clamp(24px,6vw,100px)] py-20 text-center relative overflow-hidden" data-aos="fade-up">
        <div className="absolute -top-[60px] -right-[40px] w-[260px] h-[260px] rounded-full bg-white/[0.04] pointer-events-none" />
        <div className="absolute -bottom-[80px] -left-[50px] w-[220px] h-[220px] rounded-full bg-white/[0.03] pointer-events-none" />
        <h2 className="font-dm-serif text-[clamp(28px,3.5vw,46px)] font-normal text-white mb-4 tracking-[-0.02em]">
        Ready to stop chasing signatures and start hitting deadlines?
        </h2>
        <p className="text-[16px] text-white/65 mb-9 font-dm-sans">
          14-day free trial. No credit card. Setup in 10 minutes.
        </p>
        <div className="flex gap-3 justify-center flex-wrap">
          <button className="flex items-center gap-2 px-8 py-3.5 rounded-xl bg-white border-none cursor-pointer text-brand-teal text-[15px] font-bold font-dm-sans">
            <Rocket size={16} color="#0F6E56" strokeWidth={2} />
            Start free trial
          </button>
          <button className="flex items-center gap-2 px-7 py-3.5 rounded-xl bg-white/10 border border-white/25 cursor-pointer text-white text-[15px] font-semibold font-dm-sans">
            <Users size={16} color="white" strokeWidth={2} />
            Talk to sales
          </button>
        </div>
      </div>

    </div>
  );
};

export default PricingPage;
