import type { ReactNode } from "react";

type Props = {
  onClick: () => void;
  children: ReactNode;
  disabled?: boolean;
  className?: string;
};

export default function PrimaryButton({
  onClick,
  children,
  disabled = false,
  className = "",
}: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`w-full bg-[#0052FF] hover:bg-[#0046DD] text-white font-semibold text-sm rounded-lg transition disabled:opacity-60 disabled:cursor-not-allowed ${className || "py-2.5"}`}
    >
      {children}
    </button>
  );
}
