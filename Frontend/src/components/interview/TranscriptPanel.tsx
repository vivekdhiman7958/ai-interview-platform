import type { TranscriptMessage } from "../../types/interview";

type Props = {
  messages: TranscriptMessage[];
  candidateInitial: string;
};

export default function TranscriptPanel({ messages, candidateInitial }: Props) {
  return (
    <div className="bg-white border border-[#E2E8F0] rounded-xl p-6">
      <h2 className="text-sm font-semibold text-[#0D1B2A] mb-5">Interview transcript</h2>
      <div className="flex flex-col gap-4">
        {messages.map((m) => (
          <div key={m.id} className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 ${
              m.role === "assistant"
                ? "bg-[#EBF1FF] text-[#0052FF]"
                : "bg-[#F1F5F9] text-[#64748B]"
            }`}>
              {m.role === "assistant" ? "AI" : candidateInitial}
            </div>
            <div className={`max-w-[75%] rounded-xl px-4 py-3 text-sm leading-relaxed ${
              m.role === "assistant"
                ? "bg-[#F8FAFC] text-[#0D1B2A]"
                : "bg-[#EBF1FF] text-[#0D1B2A]"
            }`}>
              {m.content}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
