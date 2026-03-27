import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { ConvexReactClient } from "convex/react";
import LinksApp from "./LinksApp";

const convexUrl = import.meta.env.PUBLIC_CONVEX_URL;
const convex = new ConvexReactClient(convexUrl as string);

export default function LinksWrapper() {
  return (
    <ConvexAuthProvider client={convex}>
      <LinksApp />
    </ConvexAuthProvider>
  );
}
