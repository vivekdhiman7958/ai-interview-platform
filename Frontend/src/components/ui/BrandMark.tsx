type Props = {
  size?: "sm" | "md" | "lg";
};

const SIZES = {
  sm: { box: "w-6 h-6 rounded-md", icon: 12, label: "text-sm" },
  md: { box: "w-7 h-7 rounded-lg", icon: 14, label: "" },
  lg: { box: "w-8 h-8 rounded-lg", icon: 16, label: "text-lg" },
};

export default function BrandMark({ size = "md" }: Props) {
  const { box, icon, label } = SIZES[size];

  return (
    <div className="flex items-center gap-2">
      <div className={`${box} bg-[#0052FF] flex items-center justify-center`}>
        <svg width={icon} height={icon} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
          <line x1="6" y1="4" x2="6" y2="20" /><line x1="10" y1="8" x2="10" y2="16" />
          <line x1="14" y1="5" x2="14" y2="19" /><line x1="18" y1="9" x2="18" y2="15" />
        </svg>
      </div>
      <span className={`font-bold text-[#0D1B2A] ${label}`}>InterviewAI</span>
    </div>
  );
}
