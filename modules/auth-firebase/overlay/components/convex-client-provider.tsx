"use client";

import { ConvexProviderWithAuth } from "convex/react";
import type { ReactNode } from "react";
import { useAuthFromFirebase } from "@/hooks/use-auth-from-firebase";
import { convex } from "@/lib/convex";

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  return (
    <ConvexProviderWithAuth client={convex} useAuth={useAuthFromFirebase}>
      {children}
    </ConvexProviderWithAuth>
  );
}
