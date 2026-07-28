import type { ReactNode } from "react";

type Props = {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
};

export default function EmptyState({ icon, title, description, action }: Props) {
  return (
    <div className="bg-white border border-[#E2E8F0] rounded-xl p-16 text-center">
      <div className="w-12 h-12 bg-[#EBF1FF] rounded-xl flex items-center justify-center mx-auto mb-4">
        {icon}
      </div>
      <h3 className="font-semibold text-[#0D1B2A] mb-2">{title}</h3>
      <p className={`text-sm text-[#64748B] ${action ? "mb-6" : ""}`}>{description}</p>
      {action}
    </div>
  );
}
