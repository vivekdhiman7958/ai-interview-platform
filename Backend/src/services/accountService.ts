import {
  createCompany,
  getCompanyByEmail,
  createCandidate,
  getCandidateByEmail,
} from "./dbService";
import {
  hashPassword,
  verifyPassword,
  generateToken,
  type TokenPayload,
} from "./authService";
import { json } from "../utils/http";

type AccountRole = TokenPayload["role"];

const accounts = {
  company: { create: createCompany, getByEmail: getCompanyByEmail },
  candidate: { create: createCandidate, getByEmail: getCandidateByEmail },
} satisfies Record<AccountRole, unknown>;

export async function registerAccount(
  req: Request,
  role: AccountRole
): Promise<Response> {
  const body = (await req.json()) as {
    name?: string;
    email?: string;
    password?: string;
  };

  if (!body.name || !body.email || !body.password) {
    return json({ error: "name, email and password are required" }, 400);
  }

  const { create, getByEmail } = accounts[role];
  if (getByEmail(body.email)) {
    return json({ error: "Email already registered" }, 409);
  }

  const id = crypto.randomUUID();
  create(id, body.name, body.email, await hashPassword(body.password));

  const token = generateToken({ id, email: body.email, role });
  return json(
    { token, [role]: { id, name: body.name, email: body.email } },
    201
  );
}

export async function loginAccount(
  req: Request,
  role: AccountRole
): Promise<Response> {
  const body = (await req.json()) as { email?: string; password?: string };

  if (!body.email || !body.password) {
    return json({ error: "email and password are required" }, 400);
  }

  const account = accounts[role].getByEmail(body.email);
  if (!account || !(await verifyPassword(body.password, account.password))) {
    return json({ error: "Invalid credentials" }, 401);
  }

  const token = generateToken({ id: account.id, email: account.email, role });
  return json({
    token,
    [role]: { id: account.id, name: account.name, email: account.email },
  });
}
