type Props = {
  message: string;
  className?: string;
};

export default function ErrorBanner({ message, className = "" }: Props) {
  return (
    <div
      className={`bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3 ${className}`}
    >
      {message}
    </div>
  );
}
