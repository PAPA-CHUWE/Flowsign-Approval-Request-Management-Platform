"use client"

import { useId } from "react"

import { cn } from "@/lib/utils"

interface LoaderProps {
  className?: string
  label?: string
  size?: "sm" | "md" | "lg"
}

const SIZE_CLASS = {
  sm: "scale-[0.58]",
  md: "scale-75",
  lg: "scale-100",
}

export function Loader({
  className,
  label = "Loading",
  size = "md",
}: LoaderProps) {
  const maskId = useId().replaceAll(":", "")

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={label}
      className={cn(
        "flex min-h-28 w-full items-center justify-center",
        className
      )}
    >
      <div className={cn("flowsign-loader", SIZE_CLASS[size])}>
        <svg
          width="100"
          height="100"
          viewBox="0 0 100 100"
          aria-hidden="true"
          focusable="false"
        >
          <defs>
            <mask id={maskId}>
              <polygon points="0,0 100,0 100,100 0,100" fill="black" />
              <polygon points="25,25 75,25 50,75" fill="white" />
              <polygon points="50,25 75,75 25,75" fill="white" />
              <polygon points="35,35 65,35 50,65" fill="white" />
              <polygon points="35,35 65,35 50,65" fill="white" />
              <polygon points="35,35 65,35 50,65" fill="white" />
              <polygon points="35,35 65,35 50,65" fill="white" />
            </mask>
          </defs>
        </svg>
        <div
          className="flowsign-loader-box"
          style={{
            mask: `url(#${maskId})`,
            WebkitMask: `url(#${maskId})`,
          }}
        />
      </div>
      <span className="sr-only">{label}</span>
    </div>
  )
}

export default Loader

