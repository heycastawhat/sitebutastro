import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { ConvexReactClient } from "convex/react";
import GuestbookApp from "./GuestbookApp";

// Initialize Convex client, using a fallback for build time
const convexUrl =
  (typeof process !== "undefined" && process.env.PUBLIC_CONVEX_URL) ||
  import.meta.env?.PUBLIC_CONVEX_URL ||
  "https://dummy.convex.cloud";

const convex = new ConvexReactClient(convexUrl as string);

export default function GuestbookWrapper() {
  return (
    <ConvexAuthProvider client={convex}>
      <GuestbookApp />
    </ConvexAuthProvider>
  );
}
