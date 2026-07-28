type Props = {
  message: string;
  tone?: "error" | "warning";
  onDismiss?: () => void;
  className?: string;
};

const TONES = {
  error: {
    box: "bg-red-50 border-red-200",
    text: "text-red-600",
    button: "text-red-500 border-red-200",
  },
  warning: {
    box: "bg-yellow-50 border-yellow-200",
    text: "text-yellow-700",
    button: "text-yellow-700 border-yellow-200",
  },
};

export default function AlertBanner({
  message,
  tone = "error",
  onDismiss,
  className = "",
}: Props) {
  const style = TONES[tone];

  return (
    <div
      className={`${style.box} border rounded-lg px-4 py-2.5 flex items-center justify-between gap-4 ${className}`}
    >
      <p className={`text-sm ${style.text}`}>{message}</p>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className={`text-xs border px-2.5 py-1 rounded-md shrink-0 ${style.button}`}
        >
          Dismiss
        </button>
      )}
    </div>
  );
}
