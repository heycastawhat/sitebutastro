import { convexAuth } from "@convex-dev/auth/server";
import GitHub from "@auth/core/providers/github";
import type { OAuthConfig } from "@auth/core/providers";

function HackClub(): OAuthConfig<any> {
  return {
    id: "hackclub",
    name: "Hack Club",
    type: "oauth",
    authorization: {
      url: "https://auth.hackclub.com/oauth/authorize",
      params: { scope: "email name" },
    },
    token: "https://auth.hackclub.com/oauth/token",
    userinfo: "https://auth.hackclub.com/api/v1/me",
    clientId: process.env.AUTH_HACKCLUB_ID,
    clientSecret: process.env.AUTH_HACKCLUB_SECRET,
    profile(profile) {
      const user = profile.identity ?? profile;
      return {
        id: user.id,
        name: [user.first_name, user.last_name].filter(Boolean).join(" ") || "Hack Clubber",
        email: user.primary_email ?? user.email,
      };
    },
  };
}

export const { auth, signIn, signOut, store } = convexAuth({
  providers: [GitHub, HackClub],
});
