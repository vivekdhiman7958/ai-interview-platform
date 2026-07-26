import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import BrandMark from "./BrandMark";
import ErrorBanner from "./ErrorBanner";

type FooterLink = {
  prompt: string;
  to: string;
  label: string;
};

type Props = {
  title: string;
  subtitle: string;
  error?: string;
  footerLinks: FooterLink[];
  children: ReactNode;
};

export default function AuthLayout({
  title,
  subtitle,
  error,
  footerLinks,
  children,
}: Props) {
  return (
    <div
      className="min-h-screen bg-[#F8FAFC] flex items-center justify-center px-4"
      style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
    >
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <BrandMark size="lg" />
        </div>

        <div className="bg-white border border-[#E2E8F0] rounded-xl p-8 shadow-sm">
          <h1 className="text-2xl font-bold text-[#0D1B2A] mb-1 tracking-tight">
            {title}
          </h1>
          <p className="text-sm text-[#64748B] mb-6">{subtitle}</p>

          {error && <ErrorBanner message={error} className="mb-5" />}

          <div className="flex flex-col gap-4">{children}</div>

          {footerLinks.map((link, index) => (
            <p
              key={link.to}
              className={`text-sm text-center text-[#64748B] ${index === 0 ? "mt-6" : "mt-2"}`}
            >
              {link.prompt}{" "}
              <Link to={link.to} className="text-[#0052FF] font-medium hover:underline">
                {link.label}
              </Link>
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}
