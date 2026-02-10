import axios from "axios";

export async function verifyFacebookAccessToken(accessToken: string) {
  const appId = process.env.FACEBOOK_APP_ID!;
  const appSecret = process.env.FACEBOOK_APP_SECRET!;
  const appAccessToken = `${appId}|${appSecret}`;

  // verify token belongs to your app
  const debugRes = await axios.get("https://graph.facebook.com/debug_token", {
    params: { input_token: accessToken, access_token: appAccessToken },
  });

  const data = debugRes.data?.data;
  if (!data?.is_valid) throw new Error("Invalid Facebook token");

  // fetch profile
  const meRes = await axios.get("https://graph.facebook.com/me", {
    params: {
      access_token: accessToken,
      fields: "id,name,email,picture.type(large)",
    },
  });

  const me = meRes.data;

  return {
    providerUserId: String(me.id),
    email: me.email || "",
    emailVerified: true,
    name: me.name,
    avatarUrl: me.picture?.data?.url,
  };
}
