import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { ConvexReactClient } from "convex/react";
import GuestbookApp from "./GuestbookApp";

const convexUrl = import.meta.env.PUBLIC_CONVEX_URL;

const convex = new ConvexReactClient(convexUrl as string);

export default function GuestbookWrapper() {
  return (
    <ConvexAuthProvider client={convex}>
      <GuestbookApp />
    </ConvexAuthProvider>
  );
}
