---
paths:
  - "convex/**"
  - "**/lib/firebase.ts"
  - "**/hooks/use-auth-from-firebase.ts"
  - "**/components/convex-client-provider.tsx"
---

# Auth rules (Firebase → Convex OIDC)

- The user's identity on the server is `await ctx.auth.getUserIdentity()`; its `subject` is the Firebase UID and `tokenIdentifier` is the stable key to store on user-owned documents. A function that needs a user throws when the identity is `null`.
- The client authenticates Convex only through `ConvexProviderWithAuth` + `useAuthFromFirebase`; `fetchAccessToken` returns `user.getIdToken(forceRefreshToken)`. Keep it that way so token refresh keeps working.
- `convex/auth.config.ts` must match the token exactly: `domain` = `https://securetoken.google.com/<projectId>` (the `iss`), `applicationID` = `<projectId>` (the `aud`). The project id comes from the Convex env var `FIREBASE_PROJECT_ID`.
- Firebase web config (`NEXT_PUBLIC_FIREBASE_*`) is public by design; admin credentials (service accounts) stay outside this repo and the client.
- In the UI, gate content with Convex's `<Authenticated>`, `<Unauthenticated>`, `<AuthLoading>` or `useConvexAuth()`, so a screen only queries user data once Convex has accepted the token.
