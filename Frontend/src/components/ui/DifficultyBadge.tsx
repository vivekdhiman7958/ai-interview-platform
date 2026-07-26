import { difficultyColor } from "../../utils/score";

type Props = {
  difficulty: string;
};

export default function DifficultyBadge({ difficulty }: Props) {
  return (
    <span
      className={`text-xs font-medium px-2.5 py-0.5 rounded-full capitalize shrink-0 ${difficultyColor(difficulty)}`}
    >
      {difficulty}
    </span>
  );
}
