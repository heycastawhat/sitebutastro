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
      return {
        id: profile.id ?? profile.sub,
        name: profile.name ?? "Hack Clubber",
        email: profile.email,
        image: profile.avatar,
      };
    },
  };
}

export const { auth, signIn, signOut, store } = convexAuth({
  providers: [GitHub, HackClub],
});
