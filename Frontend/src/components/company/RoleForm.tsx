import { useState } from "react";
import ErrorBanner from "../ui/ErrorBanner";
import PrimaryButton from "../ui/PrimaryButton";
import TextField from "../ui/TextField";
import { fieldClass, labelClass } from "../ui/fieldStyles";
import type { RoleFormValues } from "../../types/interview";

type Props = {
  values: RoleFormValues;
  onChange: (values: RoleFormValues) => void;
  onSubmit: () => void;
  submitLabel: string;
  submittingLabel: string;
  submitting: boolean;
  error?: string;
  withPlaceholders?: boolean;
  customQuestionsHint?: string;
};

export default function RoleForm({
  values,
  onChange,
  onSubmit,
  submitLabel,
  submittingLabel,
  submitting,
  error,
  withPlaceholders = false,
  customQuestionsHint,
}: Props) {
  const [newQuestion, setNewQuestion] = useState("");

  function addQuestion() {
    if (!newQuestion.trim()) return;
    onChange({
      ...values,
      custom_questions: [...values.custom_questions, newQuestion.trim()],
    });
    setNewQuestion("");
  }

  function removeQuestion(index: number) {
    onChange({
      ...values,
      custom_questions: values.custom_questions.filter((_, i) => i !== index),
    });
  }

  const placeholder = (text: string) => (withPlaceholders ? text : undefined);

  return (
    <div className="bg-white border border-[#E2E8F0] rounded-xl p-8">
      {error && <ErrorBanner message={error} className="mb-6" />}

      <div className="flex flex-col gap-5">
        <TextField
          label={<>Job title <span className="text-red-500">*</span></>}
          value={values.title}
          placeholder={placeholder("e.g. Frontend Engineer")}
          onChange={(title) => onChange({ ...values, title })}
        />

        <div>
          <label className={labelClass}>Description</label>
          <textarea
            aria-label="Description"
            placeholder={placeholder("e.g. React-heavy role, 2+ years experience required")}
            value={values.description}
            onChange={(e) => onChange({ ...values, description: e.target.value })}
            rows={3}
            className={`${fieldClass} resize-none`}
          />
        </div>

        <TextField
          label={<>Tech stack <span className="text-red-500">*</span></>}
          value={values.tech_stack}
          placeholder={placeholder("e.g. React, TypeScript, Node.js, PostgreSQL")}
          onChange={(tech_stack) => onChange({ ...values, tech_stack })}
        />

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Difficulty</label>
            <select
              aria-label="Difficulty level"
              value={values.difficulty}
              onChange={(e) => onChange({ ...values, difficulty: e.target.value })}
              className={`${fieldClass} bg-white`}
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>

          <TextField
            label="Number of questions"
            type="number"
            min={1}
            max={10}
            value={values.num_questions}
            onChange={(value) => onChange({ ...values, num_questions: Number(value) })}
          />
        </div>

        <div>
          <label className={labelClass}>
            Custom questions
            <span className="text-[#94A3B8] font-normal ml-1">(optional)</span>
          </label>
          {customQuestionsHint && (
            <p className="text-xs text-[#94A3B8] mb-3">{customQuestionsHint}</p>
          )}

          {values.custom_questions.length > 0 && (
            <div className="flex flex-col gap-2 mb-3">
              {values.custom_questions.map((q, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg px-3.5 py-2.5"
                >
                  <span className="text-xs text-[#94A3B8] mt-0.5 shrink-0">{i + 1}.</span>
                  <span className="text-sm text-[#0D1B2A] flex-1">{q}</span>
                  <button
                    type="button"
                    aria-label={`Remove question ${i + 1}`}
                    onClick={() => removeQuestion(i)}
                    className="text-[#94A3B8] hover:text-red-500 transition shrink-0"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-2">
            <input
              type="text"
              aria-label="New custom question"
              placeholder="Type a custom question and press Add"
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addQuestion()}
              className={`${fieldClass} flex-1`}
            />
            <button
              type="button"
              onClick={addQuestion}
              className="bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#0D1B2A] text-sm font-medium px-4 py-2.5 rounded-lg transition"
            >
              Add
            </button>
          </div>
        </div>

        <PrimaryButton onClick={onSubmit} disabled={submitting} className="py-3 mt-2">
          {submitting ? submittingLabel : submitLabel}
        </PrimaryButton>
      </div>
    </div>
  );
}
