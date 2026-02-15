import { OAuth2Client } from 'google-auth-library';
import AppError from '../error/appError';

const audience = [
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_ANDROID_CLIENT_ID,
  process.env.GOOGLE_IOS_CLIENT_ID,
].filter((value): value is string => Boolean(value));

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

  if (audience.length === 0) {
    throw new AppError(500, 'Missing env: GOOGLE_CLIENT_ID');
  }

  const ticket = await client.verifyIdToken({ idToken, audience });

  const payload = ticket.getPayload();

  if (!payload || !payload.sub) {
    throw new AppError(401, 'Invalid Google token');
  }

  const profile: GoogleProfile = {
    providerUserId: payload.sub,
  };

  if (payload.email) profile.email = payload.email;
  if (typeof payload.email_verified === 'boolean') {
    profile.emailVerified = payload.email_verified;
  }
  if (payload.name) profile.name = payload.name;
  if (payload.picture) profile.avatarUrl = payload.picture;

  return profile;
}
