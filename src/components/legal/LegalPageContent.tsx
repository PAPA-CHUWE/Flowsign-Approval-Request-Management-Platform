"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { Printer, ArrowLeft } from "lucide-react"
import type { LegalDocument } from "@/lib/api/legal"

// ── Helpers ───────────────────────────────────────────────────────────────────

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
}

type Heading = { level: 2 | 3; text: string; id: string }

function extractHeadings(markdown: string): Heading[] {
  const result: Heading[] = []
  for (const line of markdown.split("\n")) {
    const m = line.match(/^(#{2,3}) (.+)$/)
    if (m) {
      const text = m[2].replace(/[*_`]/g, "")
      result.push({ level: m[1].length as 2 | 3, text, id: slugify(text) })
    }
  }
  return result
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

function childrenToText(children: React.ReactNode): string {
  if (typeof children === "string") return children
  if (typeof children === "number") return String(children)
  if (Array.isArray(children)) return children.map(childrenToText).join("")
  if (children && typeof children === "object" && "props" in (children as object)) {
    const el = children as React.ReactElement<{ children?: React.ReactNode }>
    return childrenToText(el.props?.children)
  }
  return ""
}

// ── Custom markdown components ────────────────────────────────────────────────

const md = {
  h1: ({ children }: React.ComponentPropsWithoutRef<"h1">) => {
    const id = slugify(childrenToText(children))
    return (
      <h1 id={id} className="font-serif text-[30px] font-normal tracking-[-0.02em] text-[#2C2C2A] mt-8 mb-4 leading-tight">
        {children}
      </h1>
    )
  },
  h2: ({ children }: React.ComponentPropsWithoutRef<"h2">) => {
    const id = slugify(childrenToText(children))
    return (
      <h2 id={id} className="text-[20px] font-bold text-[#2C2C2A] mt-10 mb-3 pb-2 border-b border-[#E8E6DE] scroll-mt-6">
        {children}
      </h2>
    )
  },
  h3: ({ children }: React.ComponentPropsWithoutRef<"h3">) => {
    const id = slugify(childrenToText(children))
    return (
      <h3 id={id} className="text-[16px] font-semibold text-[#2C2C2A] mt-6 mb-2 scroll-mt-6">
        {children}
      </h3>
    )
  },
  p: ({ children }: React.ComponentPropsWithoutRef<"p">) => (
    <p className="text-[15px] leading-[1.75] text-[#3D3C39] mb-4">{children}</p>
  ),
  ul: ({ children }: React.ComponentPropsWithoutRef<"ul">) => (
    <ul className="list-disc pl-5 mb-4 space-y-1">{children}</ul>
  ),
  ol: ({ children }: React.ComponentPropsWithoutRef<"ol">) => (
    <ol className="list-decimal pl-5 mb-4 space-y-1">{children}</ol>
  ),
  li: ({ children }: React.ComponentPropsWithoutRef<"li">) => (
    <li className="text-[15px] leading-[1.7] text-[#3D3C39]">{children}</li>
  ),
  strong: ({ children }: React.ComponentPropsWithoutRef<"strong">) => (
    <strong className="font-semibold text-[#2C2C2A]">{children}</strong>
  ),
  em: ({ children }: React.ComponentPropsWithoutRef<"em">) => (
    <em className="italic text-[#3D3C39]">{children}</em>
  ),
  a: ({ href, children }: React.ComponentPropsWithoutRef<"a">) => (
    <a href={href} className="text-[#0F6E56] font-medium hover:underline" target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  ),
  blockquote: ({ children }: React.ComponentPropsWithoutRef<"blockquote">) => (
    <blockquote className="border-l-4 border-[#0F6E56]/30 pl-4 my-4 italic text-[#5F5E5A]">
      {children}
    </blockquote>
  ),
  hr: () => <hr className="border-[#E8E6DE] my-8" />,
  code: ({ children }: React.ComponentPropsWithoutRef<"code">) => (
    <code className="bg-[#F1EFE8] text-[#2C2C2A] rounded px-1.5 py-0.5 text-[13px] font-mono">
      {children}
    </code>
  ),
  table: ({ children }: React.ComponentPropsWithoutRef<"table">) => (
    <div className="overflow-x-auto my-6">
      <table className="w-full text-[14px] border-collapse">{children}</table>
    </div>
  ),
  th: ({ children }: React.ComponentPropsWithoutRef<"th">) => (
    <th className="text-left text-[12px] font-bold text-[#5F5E5A] uppercase tracking-wide border-b border-[#E8E6DE] px-3 py-2 bg-[#FAFAF8]">
      {children}
    </th>
  ),
  td: ({ children }: React.ComponentPropsWithoutRef<"td">) => (
    <td className="border-b border-[#E8E6DE] px-3 py-2.5 text-[#3D3C39]">{children}</td>
  ),
}

// ── Component ─────────────────────────────────────────────────────────────────

interface Props {
  doc: LegalDocument
}

export function LegalPageContent({ doc }: Props) {
  const headings = useMemo(() => extractHeadings(doc.content), [doc.content])
  const [activeId, setActiveId] = useState<string>(headings[0]?.id ?? "")

  useEffect(() => {
    if (headings.length === 0) return
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
            break
          }
        }
      },
      { rootMargin: "-10% 0% -60% 0%" }
    )
    headings.forEach((h) => {
      const el = document.getElementById(h.id)
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [headings])

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8">

        {/* Top bar */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8 print:hidden">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#0F6E56] no-underline hover:underline"
          >
            <ArrowLeft size={14} strokeWidth={2.5} />
            Back to Flowsign
          </Link>

          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 rounded-[9px] border border-[#D3D1C7] bg-white px-3.5 py-2 text-[13px] font-medium text-[#5F5E5A] hover:border-[#0F6E56] hover:text-[#0F6E56] transition-colors duration-150 cursor-pointer self-start sm:self-auto"
          >
            <Printer size={14} strokeWidth={2} />
            Print / Download PDF
          </button>
        </div>

        {/* Title + version badge */}
        <div className="mb-8">
          <h1 className="font-serif text-[38px] sm:text-[48px] font-normal tracking-[-0.02em] text-[#2C2C2A] leading-tight mb-3">
            {doc.title}
          </h1>
          <div className="inline-flex items-center gap-2 rounded-full bg-[#E1F5EE] px-3.5 py-1.5">
            <span className="text-[12px] font-semibold text-[#0F6E56]">
              Version {doc.version}
            </span>
            <span className="w-[3px] h-[3px] rounded-full bg-[#1D9E75] shrink-0" />
            <span className="text-[12px] text-[#0F6E56]">
              Effective {formatDate(doc.effectiveDate)}
            </span>
          </div>
        </div>

        {/* Two-column layout */}
        <div className="flex gap-10 lg:gap-14 items-start">

          {/* Sticky TOC */}
          {headings.length > 0 && (
            <aside className="hidden lg:block w-[220px] shrink-0 sticky top-6 max-h-[calc(100vh-3rem)] overflow-y-auto print:hidden">
              <p className="text-[11px] font-bold tracking-[0.08em] uppercase text-[#B4B2A9] mb-4">
                Contents
              </p>
              <nav className="flex flex-col gap-0.5">
                {headings.map((h) => (
                  <a
                    key={h.id}
                    href={`#${h.id}`}
                    className={[
                      "block text-[13px] leading-[1.4] py-1 border-l-2 pl-3 no-underline transition-colors duration-150",
                      h.level === 3 ? "ml-3 text-[12px]" : "",
                      activeId === h.id
                        ? "text-[#0F6E56] font-semibold border-[#0F6E56]"
                        : "text-[#5F5E5A] hover:text-[#0F6E56] border-transparent",
                    ].join(" ")}
                    onClick={(e) => {
                      e.preventDefault()
                      document.getElementById(h.id)?.scrollIntoView({ behavior: "smooth" })
                    }}
                  >
                    {h.text}
                  </a>
                ))}
              </nav>
            </aside>
          )}

          {/* Main article */}
          <article className="min-w-0 flex-1">
            <div className="rounded-[18px] border border-[#E8E6DE] bg-white p-6 sm:p-10 shadow-[0_8px_36px_rgba(0,0,0,0.04)]">
              <ReactMarkdown remarkPlugins={[remarkGfm]} components={md}>
                {doc.content}
              </ReactMarkdown>
            </div>

            <p className="mt-6 text-center text-[13px] text-[#B4B2A9] print:hidden">
              Last updated: {formatDate(doc.effectiveDate)}
            </p>
          </article>
        </div>

      </div>
    </div>
  )
}
