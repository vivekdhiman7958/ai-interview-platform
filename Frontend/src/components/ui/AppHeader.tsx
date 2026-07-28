import type { ReactNode } from "react";
import BrandMark from "./BrandMark";

type Props = {
  children?: ReactNode;
};

export default function AppHeader({ children }: Props) {
  return (
    <header className="bg-white border-b border-[#E2E8F0] px-8 py-4 flex items-center justify-between">
      <BrandMark />
      <div className="flex items-center gap-4">{children}</div>
    </header>
  );
}
