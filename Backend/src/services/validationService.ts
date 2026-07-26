export const MAX_NAME_LENGTH = 120;
export const MAX_EMAIL_LENGTH = 254;
export const MAX_PASSWORD_LENGTH = 200;
export const MIN_PASSWORD_LENGTH = 8;
export const MAX_TEXT_LENGTH = 2000;
export const MAX_CUSTOM_QUESTIONS = 20;
export const MAX_TRANSCRIPT_MESSAGE_LENGTH = 5000;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/;
const GITHUB_USERNAME_PATTERN = /^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$/;

export function isNonEmptyString(value: unknown, maxLength: number): value is string {
  return typeof value === "string" && value.trim().length > 0 && value.length <= maxLength;
}

export function isValidEmail(email: unknown): email is string {
  return (
    typeof email === "string" &&
    email.length <= MAX_EMAIL_LENGTH &&
    EMAIL_PATTERN.test(email)
  );
}

export function isValidPassword(password: unknown): password is string {
  return (
    typeof password === "string" &&
    password.length >= MIN_PASSWORD_LENGTH &&
    password.length <= MAX_PASSWORD_LENGTH
  );
}

export function isValidGithubUsername(username: unknown): username is string {
  return typeof username === "string" && GITHUB_USERNAME_PATTERN.test(username);
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function sanitizeCustomQuestions(questions: unknown): string[] {
  if (!Array.isArray(questions)) return [];
  return questions
    .filter((q): q is string => typeof q === "string" && q.trim().length > 0)
    .slice(0, MAX_CUSTOM_QUESTIONS)
    .map((q) => q.slice(0, MAX_TEXT_LENGTH));
}
