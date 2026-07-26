type Props = {
  size?: "sm" | "md" | "lg";
  className?: string;
};

const SIZES = {
  sm: "w-6 h-6 border-2",
  md: "w-8 h-8 border-4",
  lg: "w-14 h-14 border-4",
};

export default function Spinner({ size = "sm", className = "" }: Props) {
  return (
    <div
      className={`${SIZES[size]} border-[#0052FF] border-t-transparent rounded-full animate-spin ${className}`}
    />
  );
}
