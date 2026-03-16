import { convexAuth } from "@convex-dev/auth/server";
import GitHub from "@auth/core/providers/github";
import type { OIDCConfig } from "@auth/core/providers";

function HackClub(): OIDCConfig<any> {
  return {
    id: "hackclub",
    name: "Hack Club",
    type: "oidc",
    issuer: "https://auth.hackclub.com",
    clientId: process.env.AUTH_HACKCLUB_ID,
    clientSecret: process.env.AUTH_HACKCLUB_SECRET,
    authorization: {
      params: { scope: "openid email" },
    },
    profile(profile) {
      return {
        id: profile.sub,
        name: profile.name ?? profile.preferred_username ?? "Hack Clubber",
        email: profile.email,
        image: profile.picture,
      };
    },
  };
}

export const { auth, signIn, signOut, store } = convexAuth({
  providers: [GitHub, HackClub],
});
