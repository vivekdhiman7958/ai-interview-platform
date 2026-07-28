type Props = {
  message: string;
  actionLabel?: string;
  onAction?: () => void;
};

export default function MessageScreen({ message, actionLabel, onAction }: Props) {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="text-[#64748B]">{message}</p>
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="text-sm font-semibold text-white bg-[#0052FF] px-4 py-2 rounded-lg"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
