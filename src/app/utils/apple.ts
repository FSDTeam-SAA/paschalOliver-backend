import { createRemoteJWKSet, jwtVerify } from "jose";

const appleJWKS = createRemoteJWKSet(new URL("https://appleid.apple.com/auth/keys"));

export async function verifyAppleIdentityToken(identityToken: string) {
  const audience = process.env.APPLE_AUDIENCE!;
  const issuer = process.env.APPLE_ISSUER || "https://appleid.apple.com";

  const { payload } = await jwtVerify(identityToken, appleJWKS, {
    audience,
    issuer,
  });

  if (!payload.sub) throw new Error("Invalid Apple token");

  const email = payload.email as string | undefined;
  const emailVerified =
    payload.email_verified === "true" || payload.email_verified === true;

  return {
    providerUserId: String(payload.sub),
    email: email || "",
    emailVerified: !!emailVerified,
    name: undefined as string | undefined,
    avatarUrl: undefined as string | undefined,
  };
}
