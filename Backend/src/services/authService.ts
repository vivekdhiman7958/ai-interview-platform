import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";


const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_change_in_production";
const SALT_ROUNDS = 10;

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
      return jwt.verify(token, JWT_SECRET) as TokenPayload;
    } catch {
      return null;
    }
  }

export function extractToken(req: Request): string | null {
    const auth = req.headers.get("Authorization");
    if (!auth || !auth.startsWith("Bearer ")) return null;
    return auth.slice(7);
  }