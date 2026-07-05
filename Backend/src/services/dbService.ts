import { Database } from "bun:sqlite";

const db = new Database("interview.db");

export function initDB(){
    db.run(`
        CREATE TABLE IF NOT EXISTS companies (
          id         TEXT PRIMARY KEY,
          name       TEXT NOT NULL,
          email      TEXT NOT NULL UNIQUE,
          password   TEXT NOT NULL,
          created_at TEXT NOT NULL
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS job_roles (
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
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS invites (
          id         TEXT PRIMARY KEY,
          role_id    TEXT NOT NULL,
          token      TEXT NOT NULL UNIQUE,
          created_at TEXT NOT NULL,
          FOREIGN KEY (role_id) REFERENCES job_roles(id)
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS candidates (
          id         TEXT PRIMARY KEY,
          name       TEXT NOT NULL,
          email      TEXT NOT NULL UNIQUE,
          password   TEXT NOT NULL,
          created_at TEXT NOT NULL
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS sessions (
          id               TEXT PRIMARY KEY,
          invite_id        TEXT NOT NULL,
          candidate_id     TEXT NOT NULL,
          github_username  TEXT NOT NULL,
          created_at       TEXT NOT NULL,
          ended_at         TEXT,
          report           TEXT,
          FOREIGN KEY (invite_id)    REFERENCES invites(id),
          FOREIGN KEY (candidate_id) REFERENCES candidates(id)
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS messages (
          id         INTEGER PRIMARY KEY AUTOINCREMENT,
          session_id TEXT NOT NULL,
          role       TEXT NOT NULL,
          content    TEXT NOT NULL,
          created_at TEXT NOT NULL,
          FOREIGN KEY (session_id) REFERENCES sessions(id)
        )
    `);

    console.log("Database initialized");
}

export function createCompany(
    id: string,
    name: string,
    email: string,
    password: string
  ) {
    db.run(
      `INSERT INTO companies (id, name, email, password, created_at) VALUES (?, ?, ?, ?, ?)`,
      [id, name, email, password, new Date().toISOString()]
    );
  }

export function getCompanyByEmail(email: string) {
    return db.query(
      `SELECT * FROM companies WHERE email = ?`
    ).get(email) as {
      id: string;
      name: string;
      email: string;
      password: string;
    } | null;
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
      [id, companyId, title, description, techStack, difficulty, numQuestions, customQuestions, new Date().toISOString()]
    );
  }

export function getRolesByCompany(companyId: string) {
    return db.query(
      `SELECT * FROM job_roles WHERE company_id = ? ORDER BY created_at DESC`
    ).all(companyId) as {
      id: string;
      company_id: string;
      title: string;
      description: string;
      tech_stack: string;
      difficulty: string;
      num_questions: number;
      custom_questions: string;
    }[];
  }

export function getRolesById(roleId:string){
    return db.query(
        `SELECT * FROM job_roles WHERE id=?`
    ).get(roleId) as {
        id:string;
        company_id:string;
        title:string;
        description:string;
        tech_stack:string;
        difficulty:string;
        num_questions:number;
        custom_questions:string;
    }|null;
}

export function createInvite(id:string, roleId:string, token:string){
    db.run(
        `INSERT INTO invites (id,role_id,token,created_at) VALUES (?,?,?,?)`,
        [id, roleId, token, new Date().toISOString()]
    );
}

export function getInviteByToken(token:string){
    return db.query(
        `SELECT * FROM invites WHERE token = ?`
    ).get(token) as {
        id:string;
        role_id:string;
        token:string;
    } |null;
}

export function createCandidate(
    id: string,
    name: string,
    email: string,
    password: string
  ) {
    db.run(
      `INSERT INTO candidates (id, name, email, password, created_at)
       VALUES (?, ?, ?, ?, ?)`,
      [id, name, email, password, new Date().toISOString()]
    );
  }

  
export function getCandidateByEmail(email: string) {
    return db.query(
      `SELECT * FROM candidates WHERE email = ?`
    ).get(email) as {
      id: string;
      name: string;
      email: string;
      password: string;
    } | null;
  }

export function getCandidateById(id: string) {
    return db.query(
      `SELECT * FROM candidates WHERE id = ?`
    ).get(id) as {
      id: string;
      name: string;
      email: string;
    } | null;
  }
  

export function createSession(
  id: string,
  inviteId: string,
  candidateId: string,
  githubUsername: string
){
    db.run(
        `INSERT INTO sessions (id, invite_id, candidate_id, github_username, created_at)
         VALUES (?, ?, ?, ?, ?)`,
        [id, inviteId, candidateId, githubUsername, new Date().toISOString()]
      );
}

export function endSession(sessionId: string) {
    db.run(
      `UPDATE sessions SET ended_at = ? WHERE id = ?`,
      [new Date().toISOString(), sessionId]
    );
  }
  
export function saveReport(sessionId: string, report: string) {
    db.run(
      `UPDATE sessions SET report = ? WHERE id = ?`,
      [report, sessionId]
    );
  }

export function saveMessage(
    sessionId: string,
    role: "user" | "assistant",
    content: string
  ) {
    db.run(
      `INSERT INTO messages (session_id, role, content, created_at)
       VALUES (?, ?, ?, ?)`,
      [sessionId, role, content, new Date().toISOString()]
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
    return db.query(
      `SELECT * FROM sessions WHERE id = ?`
    ).get(sessionId) as {
      id: string;
      invite_id: string;
      candidate_id: string;
      github_username: string;
      created_at: string;
      ended_at: string | null;
      report: string | null;
    } | null;
  }


export function getMessagesBySession(sessionId: string) {
    return db.query(
      `SELECT * FROM messages WHERE session_id = ? ORDER BY created_at ASC`
    ).all(sessionId);
  }
  

export function getInviteById(id: string) {
    return db.query(
      `SELECT * FROM invites WHERE id = ?`
    ).get(id) as {
      id: string;
      role_id: string;
      token: string;
    } | null;
  }

  export function getCompletedSessionByInviteAndCandidate(
    inviteId: string,
    candidateId: string
  ) {
    return db.query(
      `SELECT * FROM sessions 
       WHERE invite_id = ? AND candidate_id = ? AND ended_at IS NOT NULL`
    ).get(inviteId, candidateId) as {
      id: string;
      invite_id: string;
      candidate_id: string;
      report: string | null;
    } | null;
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