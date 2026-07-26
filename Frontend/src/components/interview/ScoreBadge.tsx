import { scoreBadgeColor } from "../../utils/score";

type Props = {
  score: number | null;
};

export default function ScoreBadge({ score }: Props) {
  if (score === null) return <span className="text-xs text-[#94A3B8]">—</span>;

  return (
    <span className={`text-sm font-semibold px-2 py-0.5 rounded-lg ${scoreBadgeColor(score)}`}>
      {score}/10
    </span>
  );
}
