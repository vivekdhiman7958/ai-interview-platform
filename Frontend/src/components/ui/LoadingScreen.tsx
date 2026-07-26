import Spinner from "./Spinner";

type Props = {
  size?: "sm" | "md";
};

export default function LoadingScreen({ size = "sm" }: Props) {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
      <Spinner size={size} />
    </div>
  );
}
