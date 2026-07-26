import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";


const MIN_SECRET_LENGTH = 32;
const SALT_ROUNDS = 10;

const rawSecret = process.env.JWT_SECRET;
if (!rawSecret || rawSecret.length < MIN_SECRET_LENGTH) {
  throw new Error(
    `JWT_SECRET must be set to a random string of at least ${MIN_SECRET_LENGTH} characters`
  );
}
const JWT_SECRET: string = rawSecret;

export type TokenPayload={
    id:string;
    email:string;
    role:"company" | "candidate"
}

export async function hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, SALT_ROUNDS);
  }

export async function verifyPassword(password: string, hash: string ): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

export function generateToken(payload: TokenPayload): string {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
  }

export function verifyToken(token: string): TokenPayload | null {
    try {
      const decoded = jwt.verify(token, JWT_SECRET, { algorithms: ["HS256"] }) as
        | jwt.JwtPayload
        | string;
      if (typeof decoded !== "object" || decoded === null) {
        return null;
      }
      const { id, email, role } = decoded as Record<string, unknown>;
      if (
        typeof id !== "string" ||
        typeof email !== "string" ||
        (role !== "company" && role !== "candidate")
      ) {
        return null;
      }
      return { id, email, role };
    } catch {
      return null;
    }
  }

export function extractToken(req: Request): string | null {
    const auth = req.headers.get("Authorization");
    if (!auth || !auth.startsWith("Bearer ")) return null;
    return auth.slice(7);
  }