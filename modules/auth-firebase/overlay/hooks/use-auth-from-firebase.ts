"use client";

import { onIdTokenChanged, type User } from "firebase/auth";
import { useCallback, useEffect, useMemo, useState } from "react";
import { getFirebaseAuth } from "@/lib/firebase";

// Ponte entre o Firebase Auth e o contrato `useAuth` do ConvexProviderWithAuth.
export function useAuthFromFirebase() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const auth = getFirebaseAuth();
    if (auth === null) {
      setIsLoading(false);
      return;
    }
    return onIdTokenChanged(auth, (nextUser) => {
      setUser(nextUser);
      setIsLoading(false);
    });
  }, []);

  const fetchAccessToken = useCallback(
    async ({ forceRefreshToken }: { forceRefreshToken: boolean }) => {
      if (user === null) return null;
      return user.getIdToken(forceRefreshToken);
    },
    [user],
  );

  return useMemo(
    () => ({ isLoading, isAuthenticated: user !== null, fetchAccessToken }),
    [isLoading, user, fetchAccessToken],
  );
}
