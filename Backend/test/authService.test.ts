import { describe, expect, test } from "bun:test";
import jwt from "jsonwebtoken";
import {
  extractToken,
  generateToken,
  hashPassword,
  verifyPassword,
  verifyToken,
} from "../src/services/authService";

describe("hashPassword / verifyPassword", () => {
  test("hash is not the plaintext and is salted", async () => {
    const hash = await hashPassword("correct horse");
    expect(hash).not.toBe("correct horse");
    expect(await hashPassword("correct horse")).not.toBe(hash);
  });

  test("verifies a matching password", async () => {
    const hash = await hashPassword("correct horse");
    expect(await verifyPassword("correct horse", hash)).toBe(true);
  });

  test("rejects a wrong password", async () => {
    const hash = await hashPassword("correct horse");
    expect(await verifyPassword("wrong horse", hash)).toBe(false);
  });
});

describe("generateToken / verifyToken", () => {
  test("round-trips the payload", () => {
    const token = generateToken({
      id: "candidate-1",
      email: "a@b.com",
      role: "candidate",
    });
    const payload = verifyToken(token);
    expect(payload).not.toBeNull();
    expect(payload?.id).toBe("candidate-1");
    expect(payload?.email).toBe("a@b.com");
    expect(payload?.role).toBe("candidate");
  });

  test("returns null for a malformed token", () => {
    expect(verifyToken("not-a-jwt")).toBeNull();
  });

  test("returns null for a token signed with another secret", () => {
    const token = jwt.sign({ id: "x", email: "a@b.com", role: "company" }, "other_secret");
    expect(verifyToken(token)).toBeNull();
  });

  test("returns null for an expired token", () => {
    const token = jwt.sign(
      { id: "x", email: "a@b.com", role: "company" },
      process.env.JWT_SECRET as string,
      { expiresIn: -10 }
    );
    expect(verifyToken(token)).toBeNull();
  });
});

describe("extractToken", () => {
  const withAuth = (value?: string) =>
    new Request("http://localhost/api", {
      headers: value ? { Authorization: value } : {},
    });

  test("returns the bearer token", () => {
    expect(extractToken(withAuth("Bearer abc.def.ghi"))).toBe("abc.def.ghi");
  });

  test("returns null when the header is missing", () => {
    expect(extractToken(withAuth())).toBeNull();
  });

  test("returns null for a non-bearer scheme", () => {
    expect(extractToken(withAuth("Basic abc"))).toBeNull();
  });
});
