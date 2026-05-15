interface SettingsSectionHeadingProps {
  title: string;
  description?: string;
}

export function SettingsSectionHeading({ title, description }: SettingsSectionHeadingProps) {
  return (
    <div className="mb-6">
      <h2 className="text-[17px] font-semibold text-[#2C2C2A]">{title}</h2>
      {description && (
        <p className="mt-0.5 text-[13px] text-[#888780]">{description}</p>
      )}
    </div>
  );
}
