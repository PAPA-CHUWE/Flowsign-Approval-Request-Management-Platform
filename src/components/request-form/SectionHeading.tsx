interface SectionHeadingProps {
  title: string
  badge?: string
}

export function SectionHeading({ title, badge }: SectionHeadingProps) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-[15px] font-bold text-[#2C2C2A] tracking-[-0.01em]">
        {title}
      </h3>
      {badge && (
        <span className="text-[11px] text-[#B4B2A9] font-normal">{badge}</span>
      )}
    </div>
  )
}
