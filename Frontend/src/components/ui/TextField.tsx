import type { ReactNode } from "react";
import { fieldClass, labelClass } from "./fieldStyles";

type Props = {
  label: ReactNode;
  value: string | number;
  onChange: (value: string) => void;
  type?: "text" | "email" | "password" | "number";
  placeholder?: string;
  onEnter?: () => void;
  min?: number;
  max?: number;
  hint?: ReactNode;
};

export default function TextField({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  onEnter,
  min,
  max,
  hint,
}: Props) {
  return (
    <div>
      <label className={labelClass}>{label}</label>
      {hint}
      <input
        aria-label={typeof label === "string" ? label : undefined}
        type={type}
        placeholder={placeholder}
        value={value}
        min={min}
        max={max}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (onEnter && e.key === "Enter") onEnter();
        }}
        className={fieldClass}
      />
    </div>
  );
}
