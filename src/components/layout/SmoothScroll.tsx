"use client";

import { ReactLenis } from "lenis/react";

export function SmoothScroll({ children }: { children: React.ReactNode }) {
  return (
    <ReactLenis root options={{ anchors: true, duration: 1.1, lerp: 0.08, smoothWheel: true, }}>{children}</ReactLenis>
  )
}
