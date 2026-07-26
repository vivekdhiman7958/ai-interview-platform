import api from "./api";
import type { AuthUser } from "../context/authContext";

export type AccountRole = AuthUser["role"];

export function dashboardPath(role: AccountRole): string {
  return `/${role}/dashboard`;
}

export async function authenticate(
  role: AccountRole,
  action: "login" | "register",
  credentials: { name?: string; email: string; password: string }
): Promise<AuthUser> {
  const res = await api.post(`/api/${role}/${action}`, credentials);
  const account = res.data[role] as { id: string; name: string; email: string };

  return {
    id: account.id,
    name: account.name,
    email: account.email,
    role,
    token: res.data.token,
  };
}
