"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import AOS from "aos";
import { ReactLenis } from "lenis/react";

export function ScrollAnimations({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current) {
      AOS.init({
        anchorPlacement: "top-bottom",
        delay: 0,
        disable: () =>
          window.matchMedia("(prefers-reduced-motion: reduce)").matches,
        duration: 650,
        easing: "ease-out-cubic",
        offset: 80,
        once: true,
      });

      initialized.current = true;
      return;
    }

    AOS.refreshHard();
  }, [pathname]);

      return <ReactLenis root options={{ anchors: true, duration: 1.1, lerp: 0.08, smoothWheel: true, }}>{children}</ReactLenis>;
}
