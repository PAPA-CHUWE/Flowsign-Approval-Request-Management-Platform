import { cn } from "@/lib/utils"

interface LoaderProps {
  className?: string
  label?: string
}

export function Loader({ className, label = "Loading" }: LoaderProps) {
  return (
    <div
      role="status"
      aria-label={label}
      className={cn("flex items-center justify-center", className)}
    >
      <svg className="flowsign-spinner" viewBox="25 25 50 50" aria-hidden="true">
        <circle r="20" cy="50" cx="50" />
      </svg>
      <span className="sr-only">{label}</span>
    </div>
  )
}

