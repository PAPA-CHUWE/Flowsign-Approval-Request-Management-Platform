"use client"

import { useEffect, useState } from "react"
import { ArrowUp } from "lucide-react"

import { cn } from "@/lib/utils"

const SHOW_AFTER_PX = 360

function getDashboardScroller() {
  return document.querySelector<HTMLElement>("[data-lenis-prevent]")
}

function getScrollTop() {
  const dashboardScroller = getDashboardScroller()
  return Math.max(window.scrollY, dashboardScroller?.scrollTop ?? 0)
}

export function ButtonToTop() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const dashboardScroller = getDashboardScroller()

    const updateVisibility = () => {
      setVisible(getScrollTop() > SHOW_AFTER_PX)
    }

    updateVisibility()
    window.addEventListener("scroll", updateVisibility, { passive: true })
    dashboardScroller?.addEventListener("scroll", updateVisibility, { passive: true })

    return () => {
      window.removeEventListener("scroll", updateVisibility)
      dashboardScroller?.removeEventListener("scroll", updateVisibility)
    }
  }, [])

  const scrollToTop = () => {
    getDashboardScroller()?.scrollTo({ top: 0, behavior: "smooth" })
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <button
      type="button"
      aria-label="Back to top"
      onClick={scrollToTop}
      className={cn(
        "fixed bottom-24 right-4 z-50 flex h-11 w-11 items-center justify-center rounded-full",
        "border border-[#9FE1CB] bg-[#0F6E56] text-white shadow-[0_10px_28px_rgba(15,110,86,0.28)]",
        "transition-all duration-200 hover:bg-[#1D9E75] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0F6E56] focus-visible:ring-offset-2",
        "md:bottom-6 md:right-6",
        visible
          ? "translate-y-0 opacity-100"
          : "pointer-events-none translate-y-3 opacity-0",
      )}
    >
      <ArrowUp size={20} strokeWidth={2.5} aria-hidden="true" />
    </button>
  )
}
