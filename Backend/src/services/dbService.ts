import { Database } from "bun:sqlite";

const db = new Database("interview.db");

type AccountTable = "companies" | "candidates";

export type AccountRow = {
  id: string;
  name: string;
  email: string;
  password: string;
};

export type PublicAccountRow = Omit<AccountRow, "password">;

export type JobRoleRow = {
  id: string;
  company_id: string;
  title: string;
  description: string;
  tech_stack: string;
  difficulty: string;
  num_questions: number;
  custom_questions: string;
};

export type InviteRow = {
  id: string;
  role_id: string;
  token: string;
};

export type SessionRow = {
  id: string;
  invite_id: string;
  candidate_id: string;
  github_username: string;
  created_at: string;
  ended_at: string | null;
  report: string | null;
};

const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS companies (
     id         TEXT PRIMARY KEY,
     name       TEXT NOT NULL,
     email      TEXT NOT NULL UNIQUE,
     password   TEXT NOT NULL,
     created_at TEXT NOT NULL
   )`,
  `CREATE TABLE IF NOT EXISTS job_roles (
     id               TEXT PRIMARY KEY,
     company_id       TEXT NOT NULL,
     title            TEXT NOT NULL,
     description      TEXT,
     tech_stack       TEXT NOT NULL,
     difficulty       TEXT NOT NULL,
     num_questions    INTEGER NOT NULL DEFAULT 5,
     custom_questions TEXT,
     created_at       TEXT NOT NULL,
     FOREIGN KEY (company_id) REFERENCES companies(id)
   )`,
  `CREATE TABLE IF NOT EXISTS invites (
     id         TEXT PRIMARY KEY,
     role_id    TEXT NOT NULL,
     token      TEXT NOT NULL UNIQUE,
     created_at TEXT NOT NULL,
     FOREIGN KEY (role_id) REFERENCES job_roles(id)
   )`,
  `CREATE TABLE IF NOT EXISTS candidates (
     id         TEXT PRIMARY KEY,
     name       TEXT NOT NULL,
     email      TEXT NOT NULL UNIQUE,
     password   TEXT NOT NULL,
     created_at TEXT NOT NULL
   )`,
  `CREATE TABLE IF NOT EXISTS sessions (
     id               TEXT PRIMARY KEY,
     invite_id        TEXT NOT NULL,
     candidate_id     TEXT NOT NULL,
     github_username  TEXT NOT NULL,
     created_at       TEXT NOT NULL,
     ended_at         TEXT,
     report           TEXT,
     FOREIGN KEY (invite_id)    REFERENCES invites(id),
     FOREIGN KEY (candidate_id) REFERENCES candidates(id)
   )`,
  `CREATE TABLE IF NOT EXISTS messages (
     id         INTEGER PRIMARY KEY AUTOINCREMENT,
     session_id TEXT NOT NULL,
     role       TEXT NOT NULL,
     content    TEXT NOT NULL,
     created_at TEXT NOT NULL,
     FOREIGN KEY (session_id) REFERENCES sessions(id)
   )`,
];

function now(): string {
  return new Date().toISOString();
}

export function initDB() {
  SCHEMA.forEach((statement) => db.run(statement));
  console.log("Database initialized");
}

function createAccount(
  table: AccountTable,
  id: string,
  name: string,
  email: string,
  password: string
) {
  db.run(
    `INSERT INTO ${table} (id, name, email, password, created_at) VALUES (?, ?, ?, ?, ?)`,
    [id, name, email, password, now()]
  );
}

function getAccountByEmail(table: AccountTable, email: string) {
  return db.query(`SELECT * FROM ${table} WHERE email = ?`).get(email) as
    | AccountRow
    | null;
}

export function createCompany(
  id: string,
  name: string,
  email: string,
  password: string
) {
  createAccount("companies", id, name, email, password);
}

export function getCompanyByEmail(email: string) {
  return getAccountByEmail("companies", email);
}

export function createCandidate(
  id: string,
  name: string,
  email: string,
  password: string
) {
  createAccount("candidates", id, name, email, password);
}

export function getCandidateByEmail(email: string) {
  return getAccountByEmail("candidates", email);
}

export function getCandidateById(id: string) {
  return db.query(`SELECT * FROM candidates WHERE id = ?`).get(id) as
    | PublicAccountRow
    | null;
}

export function createJobRole(
  id: string,
  companyId: string,
  title: string,
  description: string,
  techStack: string,
  difficulty: string,
  numQuestions: number,
  customQuestions: string
) {
  db.run(
    `INSERT INTO job_roles
       (id, company_id, title, description, tech_stack, difficulty, num_questions, custom_questions, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, companyId, title, description, techStack, difficulty, numQuestions, customQuestions, now()]
  );
}

export function getRolesByCompany(companyId: string) {
  return db.query(
    `SELECT * FROM job_roles WHERE company_id = ? ORDER BY created_at DESC`
  ).all(companyId) as JobRoleRow[];
}

export function getRolesById(roleId: string) {
  return db.query(`SELECT * FROM job_roles WHERE id = ?`).get(roleId) as
    | JobRoleRow
    | null;
}

export function updateJobRole(
  id: string,
  title: string,
  description: string,
  techStack: string,
  difficulty: string,
  numQuestions: number,
  customQuestions: string
) {
  db.run(
    `UPDATE job_roles 
     SET title = ?, description = ?, tech_stack = ?, difficulty = ?, 
         num_questions = ?, custom_questions = ?
     WHERE id = ?`,
    [title, description, techStack, difficulty, numQuestions, customQuestions, id]
  );
}

export function deleteJobRole(id: string) {
  db.run(`DELETE FROM invites WHERE role_id = ?`, [id]);
  db.run(`DELETE FROM job_roles WHERE id = ?`, [id]);
}

export function createInvite(id: string, roleId: string, token: string) {
  db.run(
    `INSERT INTO invites (id, role_id, token, created_at) VALUES (?, ?, ?, ?)`,
    [id, roleId, token, now()]
  );
}

export function getInviteByToken(token: string) {
  return db.query(`SELECT * FROM invites WHERE token = ?`).get(token) as
    | InviteRow
    | null;
}

export function getInviteById(id: string) {
  return db.query(`SELECT * FROM invites WHERE id = ?`).get(id) as
    | InviteRow
    | null;
}

export function createSession(
  id: string,
  inviteId: string,
  candidateId: string,
  githubUsername: string
) {
  db.run(
    `INSERT INTO sessions (id, invite_id, candidate_id, github_username, created_at)
     VALUES (?, ?, ?, ?, ?)`,
    [id, inviteId, candidateId, githubUsername, now()]
  );
}

export function endSession(sessionId: string) {
  db.run(`UPDATE sessions SET ended_at = ? WHERE id = ?`, [now(), sessionId]);
}

export function saveReport(sessionId: string, report: string) {
  db.run(`UPDATE sessions SET report = ? WHERE id = ?`, [report, sessionId]);
}

export function saveMessage(
  sessionId: string,
  role: "user" | "assistant",
  content: string
) {
  db.run(
    `INSERT INTO messages (session_id, role, content, created_at)
     VALUES (?, ?, ?, ?)`,
    [sessionId, role, content, now()]
  );
}

export function getSessionsByCandidate(candidateId: string) {
  return db.query(
    `SELECT s.*, r.title as role_title, c.name as company_name, i.id as invite_id
     FROM sessions s
     JOIN invites i   ON s.invite_id   = i.id
     JOIN job_roles r ON i.role_id     = r.id
     JOIN companies c ON r.company_id  = c.id
     WHERE s.candidate_id = ?
     ORDER BY s.created_at DESC`
  ).all(candidateId);
}

export function getSessionsByRole(roleId: string) {
  return db.query(
    `SELECT s.*, cd.name as candidate_name, cd.email as candidate_email
     FROM sessions s
     JOIN invites i   ON s.invite_id   = i.id
     JOIN candidates cd ON s.candidate_id = cd.id
     WHERE i.role_id = ?
     ORDER BY s.created_at DESC`
  ).all(roleId);
}

export function getSessionById(sessionId: string) {
  return db.query(`SELECT * FROM sessions WHERE id = ?`).get(sessionId) as
    | SessionRow
    | null;
}

export function getMessagesBySession(sessionId: string) {
  return db.query(
    `SELECT * FROM messages WHERE session_id = ? ORDER BY created_at ASC`
  ).all(sessionId);
}

export function getCompletedSessionByInviteAndCandidate(
  inviteId: string,
  candidateId: string
) {
  return db.query(
    `SELECT * FROM sessions 
     WHERE invite_id = ? AND candidate_id = ? AND ended_at IS NOT NULL`
  ).get(inviteId, candidateId) as SessionRow | null;
}
