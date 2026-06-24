import jwt, { type SignOptions } from "jsonwebtoken";
import type { JwtPayload, MemberRole } from "./types.js";

export function signAccessToken(
  payload: Omit<JwtPayload, "iat" | "exp">,
  secret: string,
  expiresIn: SignOptions["expiresIn"] = "15m"
): string {
  return jwt.sign(payload, secret, { expiresIn });
}

export function signRefreshToken(
  userId: string,
  secret: string,
  expiresIn: SignOptions["expiresIn"] = "7d"
): string {
  return jwt.sign({ sub: userId, type: "refresh" }, secret, { expiresIn });
}

export function verifyAccessToken(token: string, secret: string): JwtPayload {
  return jwt.verify(token, secret) as JwtPayload;
}

export function verifyRefreshToken(token: string, secret: string): { sub: string } {
  const payload = jwt.verify(token, secret) as { sub: string; type?: string };
  if (payload.type !== "refresh") {
    throw new Error("Invalid refresh token");
  }
  return { sub: payload.sub };
}

export function canManageMembers(role: MemberRole): boolean {
  return role === "OWNER" || role === "ADMIN";
}

export function canWriteProductData(role: MemberRole): boolean {
  return role !== "VIEWER";
}
