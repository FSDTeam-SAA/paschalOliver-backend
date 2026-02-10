import { OAuth2Client } from 'google-auth-library';
import AppError from '../error/appError';

// Collect all possible client IDs (web, android, ios)
const audience = [
  process.env.GOOGLE_CLIENT_ID
].filter(Boolean); // removes undefined values

if (audience.length === 0) {
  throw new Error(
    'Missing env:  GOOGLE_ANDROID_CLIENT_ID',
  );
}

// ✅ Create client WITHOUT hardcoding a single client ID
const client = new OAuth2Client();

export type GoogleProfile = {
  providerUserId: string;
  email?: string;
  emailVerified?: boolean;
  name?: string;
  avatarUrl?: string;
};

export async function verifyGoogleIdToken(
  idToken: string,
): Promise<GoogleProfile> {
  if (!idToken) {
    throw new AppError(400, 'Google ID token is required');
  }

  const ticket = await client.verifyIdToken({
    idToken,
    audience, // ✅ accepts tokens from Web / Android / iOS
  });

  const payload = ticket.getPayload();

  if (!payload || !payload.sub) {
    throw new AppError(401, 'Invalid Google token');
  }

  return {
    providerUserId: payload.sub,
    email: payload.email,
    emailVerified: payload.email_verified,
    name: payload.name,
    avatarUrl: payload.picture,
  };
}
