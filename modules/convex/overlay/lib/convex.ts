import { ConvexReactClient } from "convex/react";

// Cliente único do Convex; os providers (com ou sem auth) importam daqui.
const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
if (!convexUrl) {
  throw new Error(
    "NEXT_PUBLIC_CONVEX_URL is not set. Run `npx convex dev` to create .env.local.",
  );
}

export const convex = new ConvexReactClient(convexUrl);
