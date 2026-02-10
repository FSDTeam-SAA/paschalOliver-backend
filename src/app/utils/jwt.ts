import jwt from "jsonwebtoken";
import crypto from "crypto";

export function signAccessToken(payload: object) {
  return jwt.sign(payload, process.env.JWT_ACCESS_SECRET!, {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN || "15m",
  });
}

export function signRefreshToken(payload: object) {
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET!, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || "30d",
  });
}

export function sha256(input: string) {
  return crypto.createHash("sha256").update(input).digest("hex");
}
