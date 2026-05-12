"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

// ─── Nav items ────────────────────────────────────────────────────────────────
const NAV_LINKS = [
  { label: "Product",    href: "/product"   },
  { label: "Pricing",    href: "/pricing"   },
  { label: "Customers",  href: "/customers" },
  { label: "Contact Us", href: "/contact"   },
];

// ─── Navbar ───────────────────────────────────────────────────────────────────
export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef                     = useRef<HTMLDivElement>(null);
  const lastFocusedElementRef       = useRef<HTMLElement | null>(null);

  // ── Open ──────────────────────────────────────────────────────────────────
  const openMenu = () => {
    const el = document.activeElement;
    lastFocusedElementRef.current = el instanceof HTMLElement ? el : null;
    setIsMenuOpen(true);
    setTimeout(() => menuRef.current?.focus(), 0);
  };

  // ── Close ─────────────────────────────────────────────────────────────────
  const closeMenu = useCallback(() => {
    setIsMenuOpen(false);
    setTimeout(() => lastFocusedElementRef.current?.focus(), 0);
  }, []);

  // ── Escape key ────────────────────────────────────────────────────────────
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isMenuOpen) closeMenu();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [closeMenu, isMenuOpen]);

  // ── Lock body scroll ──────────────────────────────────────────────────────
  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isMenuOpen]);

  // ── Drawer slide class (avoids template-literal escape issues) ────────────
  const drawerClass = isMenuOpen
    ? "translate-x-0 pointer-events-auto"
    : "translate-x-full pointer-events-none";

  return (
    <>
      {/* ════════════════════════════════════════
          NAV BAR
      ════════════════════════════════════════ */}
      <nav
        className="fixed top-0 left-0 right-0 z-50
                   h-[68px] min-h-[68px]
                   bg-[rgba(250,250,248,0.88)] backdrop-blur-[16px]
                   border-b border-[rgba(211,209,199,0.5)]
                   px-[clamp(20px,5vw,80px)]
                   flex items-center justify-between
                   gap-4"
        aria-label="Main navigation"
      >

        {/* ── Logo ── */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0 no-underline">
          <div className="w-[34px] h-[34px] rounded-[9px]
                          bg-gradient-to-br from-[#0F6E56] to-[#1D9E75]
                          flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M9 12l2 2 4-4"
                stroke="white" strokeWidth="2.5"
                strokeLinecap="round" strokeLinejoin="round" />
              <path d="M21 12c0 4.97-4.03 9-9 9S3 16.97 3 12 7.03 3 12 3s9 4.03 9 9z"
                stroke="white" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          <span className="text-[17px] font-bold text-[#2C2C2A] tracking-[-0.02em]">
            Flow<span className="text-[#0F6E56]">sign</span>
          </span>
        </Link>

        {/* ── Desktop nav links — lg+ ── */}
        <div className="hidden lg:flex items-center gap-8">
          {NAV_LINKS.map(({ label, href }) => (
            <Link
              key={label}
              href={href}
              className="text-[14px] font-medium text-[#5F5E5A] no-underline
                         hover:text-[#0F6E56] transition-colors duration-200"
            >
              {label}
            </Link>
          ))}
        </div>

        {/* ── Right side: CTAs + hamburger ── */}
        <div className="flex items-center gap-2.5">

          {/* Sign in — always visible md+ */}
          <Link
            href="/login"
            className="hidden md:inline-flex text-[14px] font-medium text-[#5F5E5A]
                       no-underline hover:text-[#0F6E56] transition-colors duration-200 px-2"
          >
            Sign in
          </Link>

          {/* Get started — always visible md+ */}
          <Button
            className="hidden md:inline-flex px-[18px] h-9 rounded-[8px]
                       bg-[#0F6E56] hover:bg-[#1D9E75]
                       text-white text-[14px] font-semibold
                       transition-colors duration-200 cursor-pointer
                       border-none shadow-none"
          >
            Get started free
          </Button>

          {/* ── Hamburger — below lg only ── */}
          <button
            type="button"
            onClick={isMenuOpen ? closeMenu : openMenu}
            aria-controls="collapseMenu"
            aria-expanded={isMenuOpen}
            aria-haspopup="true"
            aria-label={isMenuOpen ? "Close main menu" : "Open main menu"}
            className="lg:hidden flex items-center justify-center
                       w-10 h-10 rounded-xl border-none bg-transparent cursor-pointer
                       text-[#5F5E5A] hover:text-[#0F6E56] hover:bg-[#E1F5EE]
                       transition-all duration-200
                       focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0F6E56]"
          >
            <span className="sr-only">
              {isMenuOpen ? "Close main menu" : "Open main menu"}
            </span>
            {isMenuOpen
              ? <X    size={22} strokeWidth={2} aria-hidden="true" />
              : <Menu size={22} strokeWidth={2} aria-hidden="true" />
            }
          </button>
        </div>
      </nav>

      {/* ════════════════════════════════════════
          BACKDROP — click to close
      ════════════════════════════════════════ */}
      <div
        aria-hidden="true"
        onClick={closeMenu}
        className={[
          "fixed inset-0 z-40 bg-black/25 backdrop-blur-[2px] lg:hidden",
          "transition-opacity duration-300",
          isMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none",
        ].join(" ")}
      />

      {/* ════════════════════════════════════════
          RIGHT-SIDE DRAWER
          Borrowed from inspiration:
          - slides in from the right (translate-x)
          - fixed top-0 to bottom-0 (full height)
          - border-l like the reference's border-l border-slate-300
          - w-1/2 on tablet, full width on small phones
          - sticky header row mirrors the inspiration's logo + close button
      ════════════════════════════════════════ */}
      <div
        id="collapseMenu"
        ref={menuRef}
        tabIndex={-1}
        aria-hidden={!isMenuOpen}
        className={[
          // Position — right-side drawer
          "fixed top-0 right-0 bottom-0 z-50",
          // Width: full on mobile, half on sm, fixed on md
          "w-full sm:w-1/2 md:w-80",
          // Surface
          "bg-[rgba(250,250,248,0.98)]",
          "border-l border-[rgba(211,209,199,0.6)]",
          "shadow-[-8px_0_32px_rgba(0,0,0,0.1)]",
          // Scroll
          "overflow-y-auto",
          // Accessibility
          "outline-none",
          // Animation — slide from right
          "transition-transform duration-300 ease-in-out",
          drawerClass,
        ].join(" ")}
      >

        {/* ── Drawer header — sticky, mirrors inspiration's logo + close row ── */}
        <div className="sticky top-0 z-10
                        flex items-center justify-between
                        px-5 min-h-[68px]
                        bg-[rgba(250,250,248,0.98)]
                        border-b border-[rgba(211,209,199,0.5)]">

          {/* Logo repeated in drawer (same as inspiration) */}
          <Link
            href="/"
            onClick={closeMenu}
            className="flex items-center gap-2.5 no-underline"
          >
            <div className="w-[30px] h-[30px] rounded-[8px]
                            bg-gradient-to-br from-[#0F6E56] to-[#1D9E75]
                            flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M9 12l2 2 4-4"
                  stroke="white" strokeWidth="2.5"
                  strokeLinecap="round" strokeLinejoin="round" />
                <path d="M21 12c0 4.97-4.03 9-9 9S3 16.97 3 12 7.03 3 12 3s9 4.03 9 9z"
                  stroke="white" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <span className="text-[16px] font-bold text-[#2C2C2A] tracking-[-0.02em]">
              Flow<span className="text-[#0F6E56]">sign</span>
            </span>
          </Link>

          {/* Close button */}
          <button
            type="button"
            onClick={closeMenu}
            aria-controls="collapseMenu"
            aria-label="Close main menu"
            className="flex items-center justify-center
                       w-9 h-9 rounded-xl border-none bg-transparent cursor-pointer
                       text-[#5F5E5A] hover:text-[#0F6E56] hover:bg-[#E1F5EE]
                       transition-all duration-200
                       focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0F6E56]"
          >
            <span className="sr-only">Close main menu</span>
            <X size={20} strokeWidth={2} aria-hidden="true" />
          </button>
        </div>

        {/* ── Drawer nav content ── */}
        <ul className="flex flex-col gap-1 p-5 list-none m-0">

          {/* Nav links */}
          {NAV_LINKS.map(({ label, href }) => (
            <li key={label}>
              <Link
                href={href}
                onClick={closeMenu}
                className="flex items-center h-12 px-3 rounded-xl
                           text-[15px] font-semibold text-[#2C2C2A] no-underline
                           hover:text-[#0F6E56] hover:bg-[#E1F5EE]
                           transition-all duration-150
                           focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0F6E56]"
              >
                {label}
              </Link>
            </li>
          ))}

          {/* Divider */}
          <li aria-hidden="true">
            <div className="h-px bg-[#E8E6DE] my-3" />
          </li>

          {/* Sign in */}
          <li>
            <Link
              href="/login"
              onClick={closeMenu}
              className="flex items-center h-12 px-3 rounded-xl
                         text-[15px] font-semibold text-[#5F5E5A] no-underline
                         hover:text-[#0F6E56] hover:bg-[#E1F5EE]
                         transition-all duration-150
                         focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0F6E56]"
            >
              Sign in
            </Link>
          </li>

          {/* Get started — full-width shadcn Button */}
          <li className="mt-2">
            <Button
              onClick={closeMenu}
              className="w-full h-12 rounded-xl
                         bg-gradient-to-r from-[#0F6E56] to-[#1D9E75]
                         text-white text-[15px] font-semibold
                         hover:opacity-90 active:opacity-80
                         transition-opacity duration-150
                         cursor-pointer shadow-none border-none
                         focus-visible:ring-2 focus-visible:ring-[#0F6E56]"
            >
              Get started free
            </Button>
          </li>
        </ul>
      </div>
    </>
  );
}