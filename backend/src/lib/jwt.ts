import jwt from "jsonwebtoken";

const secret = process.env.JWT_SECRET ?? "dev-only-secret";

export type JwtPayload = { sub: string; role: string };

export function signAccessToken(payload: JwtPayload): string {
  return jwt.sign(payload, secret, { expiresIn: "7d" });
}

export function verifyAccessToken(token: string): JwtPayload {
  const decoded = jwt.verify(token, secret) as JwtPayload;
  return decoded;
}
