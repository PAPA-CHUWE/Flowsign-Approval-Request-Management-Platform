"use client";

import { useState } from "react";
import { BadgeCheck, Shield, Lock, Star, ArrowRight, Heart } from "lucide-react";
import { FaXTwitter, FaLinkedinIn, FaGithub, FaYoutube } from "react-icons/fa6";

const NAV = [
  {
    heading: "Product",
    links: [
      { label: "Features",     href: "#" },
      { label: "How it works", href: "#" },
      { label: "Pricing",      href: "#" },
      { label: "Changelog",    href: "#" },
      { label: "Roadmap",      href: "#" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About us",  href: "#" },
      { label: "Customers", href: "#" },
      { label: "Blog",      href: "#" },
      { label: "Press kit", href: "#" },
      { label: "Contact",   href: "#" },
    ],
  },
  {
    heading: "Resources",
    links: [
      { label: "Documentation", href: "#" },
      { label: "Help centre",   href: "#" },
      { label: "API reference", href: "#" },
      { label: "Integrations",  href: "#" },
      { label: "Status",        href: "#" },
    ],
  },
  {
    heading: "Legal",
    links: [
      { label: "Privacy policy", href: "#" },
      { label: "Terms of use",   href: "#" },
      { label: "Security",       href: "#" },
      { label: "Cookies",        href: "#" },
      { label: "Compliance",     href: "#" },
    ],
  },
];

const SOCIALS = [
  { Icon: FaXTwitter,   href: "#", label: "X / Twitter" },
  { Icon: FaLinkedinIn, href: "#", label: "LinkedIn"     },
  { Icon: FaGithub,     href: "#", label: "GitHub"       },
  { Icon: FaYoutube,    href: "#", label: "YouTube"      },
];

const TRUST_BADGES = [
  { Icon: Shield, text: "SOC 2 ready"    },
  { Icon: Lock,   text: "GDPR compliant" },
  { Icon: Star,   text: "4.9 / 5 rating" },
];

const Footer = () => {
  const [email, setEmail]           = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = () => {
    if (email.includes("@")) setSubscribed(true);
  };

  return (
    <div className="bg-brand-neutral-pale px-[clamp(20px,5vw,60px)] pt-10 pb-8">
      <div className="bg-gradient-to-br from-brand-neutral-dark to-[#085041] rounded-[20px] overflow-hidden max-w-[1180px] mx-auto" data-aos="fade-up">

        {/* Top section */}
        <div className="px-11 pt-11 pb-9 grid grid-cols-[220px_repeat(4,1fr)] gap-8 border-b border-brand-card-border">
          {/* Brand */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-[9px]">
              <div className="w-8 h-8 rounded-[9px] bg-gradient-to-br from-brand-teal to-brand-teal-mid flex items-center justify-center shrink-0">
                <BadgeCheck size={16} color="#ffffff" strokeWidth={2.5} />
              </div>
              <span className="text-[16px] font-bold text-white tracking-[-0.02em] font-dm-sans">
                Flow<span className="text-brand-teal-light">sign</span>
              </span>
            </div>
            <p className="text-[13px] text-brand-card-text leading-[1.6] font-dm-sans m-0">
              Every request routed right. Every approval signed fast. Trusted by forward-thinking organisations worldwide.
            </p>
            <div className="flex gap-2 mt-1">
              {SOCIALS.map(({ Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-[34px] h-[34px] rounded-[9px] bg-brand-card-surface border border-brand-card-border flex items-center justify-center cursor-pointer transition-all duration-150 hover:bg-brand-teal hover:border-brand-teal no-underline"
                >
                  <Icon size={15} color="#A8C4B8" />
                </a>
              ))}
            </div>
          </div>

          {/* Nav columns */}
          {NAV.map((col) => (
            <div key={col.heading}>
              <p className="text-[12px] font-bold text-white tracking-[0.07em] uppercase mb-4 font-dm-sans">
                {col.heading}
              </p>
              <div className="flex flex-col gap-[11px]">
                {col.links.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    className="text-[13px] text-brand-card-text no-underline font-dm-sans transition-colors duration-150 leading-none hover:text-brand-teal-light"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Trust + newsletter strip */}
        <div className="px-11 py-5 border-b border-brand-card-border flex items-center justify-between gap-5 flex-wrap">
          <div className="flex gap-2.5 flex-wrap">
            {TRUST_BADGES.map(({ Icon, text }) => (
              <div
                key={text}
                className="flex items-center gap-[7px] bg-brand-card-surface border border-brand-card-border rounded-full px-3.5 py-1.5"
              >
                <Icon size={13} color="#9FE1CB" strokeWidth={2} />
                <span className="text-[12px] font-semibold text-brand-card-text font-dm-sans">{text}</span>
              </div>
            ))}
          </div>

          <div className="flex gap-2 items-center min-w-[300px] flex-[0_1_380px]">
            {!subscribed ? (
              <>
                <input
                  type="email"
                  placeholder="Get product updates…"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSubscribe()}
                  className="flex-1 min-w-0 bg-brand-card-surface border border-brand-card-border rounded-[9px] px-3.5 py-2.5 text-[13px] text-white font-dm-sans outline-none transition-colors duration-150 focus:border-brand-teal-mid placeholder:text-brand-card-muted"
                />
                <button
                  onClick={handleSubscribe}
                  className="px-[18px] py-2.5 rounded-[9px] bg-brand-teal border-none cursor-pointer text-white text-[13px] font-bold font-dm-sans flex items-center gap-1.5 whitespace-nowrap transition-colors duration-150 hover:bg-brand-teal-mid shrink-0"
                >
                  Subscribe <ArrowRight size={13} strokeWidth={2.5} />
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2 bg-brand-card-surface border border-brand-teal rounded-[9px] px-4 py-2.5 flex-1">
                <BadgeCheck size={15} color="#9FE1CB" strokeWidth={2.5} />
                <span className="text-[13px] text-brand-teal-light font-dm-sans font-semibold">You&apos;re subscribed — thanks!</span>
              </div>
            )}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="px-11 py-4 flex items-center justify-between gap-4 flex-wrap">
          <p className="text-[12px] text-brand-card-text font-dm-sans m-0 flex items-center gap-[5px]">
            © {new Date().getFullYear()} Flowsign. Made with
            <Heart size={11} color="#9FE1CB" strokeWidth={0} fill="#9FE1CB" />
            in Harare &amp; Zimbabwe.
          </p>
          <div className="flex items-center gap-4">
            {["Status", "Sitemap", "Accessibility"].map((label, i) => (
              <span key={label} className="flex items-center gap-4">
                <a
                  href="#"
                  className="text-[12px] text-brand-card-text no-underline font-dm-sans transition-colors duration-150 hover:text-brand-teal-light"
                >
                  {label}
                </a>
                {i < 2 && <span className="w-[3px] h-[3px] rounded-full bg-brand-card-text inline-block" />}
              </span>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Footer;
