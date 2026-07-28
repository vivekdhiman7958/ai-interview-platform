type Props = {
  onClick: () => void;
  label?: string;
};

export default function BackButton({ onClick, label = "← Back to dashboard" }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-sm text-[#64748B] hover:text-[#0D1B2A] transition"
    >
      {label}
    </button>
  );
}
