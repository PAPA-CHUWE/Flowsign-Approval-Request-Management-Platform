export function formatDisplayDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value))
}

export function formatTicketDate(iso: string) {
  return new Date(iso)
    .toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
    .toUpperCase()
    .replace(/ /g, ".")
}

export function formatRelativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime()
  const diffMins = Math.floor(diffMs / 60_000)
  if (diffMins < 1) return "just now"
  if (diffMins < 60) return `${diffMins}m ago`
  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `${diffHours}h ago`
  const diffDays = Math.floor(diffHours / 24)
  if (diffDays === 1) return "1 day ago"
  if (diffDays < 7) return `${diffDays} days ago`
  const diffWeeks = Math.floor(diffDays / 7)
  if (diffWeeks === 1) return "1 week ago"
  return `${diffWeeks} weeks ago`
}
