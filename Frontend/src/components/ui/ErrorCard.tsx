type Props = {
  message: string;
  actionLabel?: string;
  onAction?: () => void;
};

export default function ErrorCard({
  message,
  actionLabel = "Try again",
  onAction = () => window.location.reload(),
}: Props) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
      <p className="text-sm text-red-600 mb-4">{message}</p>
      <button
        type="button"
        onClick={onAction}
        className="text-sm font-semibold text-white bg-[#0052FF] px-4 py-2 rounded-lg"
      >
        {actionLabel}
      </button>
    </div>
  );
}
