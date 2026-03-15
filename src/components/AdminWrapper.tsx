import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { ConvexReactClient } from "convex/react";
import AdminPanel from "./AdminPanel";

const convexUrl = import.meta.env.PUBLIC_CONVEX_URL;

const convex = new ConvexReactClient(convexUrl as string);

export default function AdminWrapper() {
  return (
    <ConvexAuthProvider client={convex}>
      <AdminPanel />
    </ConvexAuthProvider>
  );
}
