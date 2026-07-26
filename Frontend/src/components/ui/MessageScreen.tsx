type Props = {
  message: string;
};

export default function MessageScreen({ message }: Props) {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
      <p className="text-[#64748B]">{message}</p>
    </div>
  );
}
