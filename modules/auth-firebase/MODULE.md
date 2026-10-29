# Module: auth-firebase

Login with Firebase Auth on the client; Convex verifies the Firebase ID token as a custom OIDC provider. Requires the `web` and `convex` modules, applied first. (Mobile reuses the same Convex side; see mobile step 6.)

Variables (defined in the skill's "Layout"): `$MOD` is this module's directory, `$PROJECT` the repo root, `$WEB` the web app's directory. Each command below states its directory.

## Status: not first-party

Convex has no official Firebase integration. This wiring uses Convex's generic OIDC support: the Firebase ID token has `iss = https://securetoken.google.com/<projectId>` and `aud = <projectId>`, which map to `domain` and `applicationID` in `convex/auth.config.ts`. It stays unproven for a project until the **smoke test** below passes with a real Firebase project. If the smoke test fails and debugging (https://docs.convex.dev/auth/debug.md) does not fix it, fall back to **Convex Auth** (https://labs.convex.dev/auth) or **Clerk** (https://docs.convex.dev/auth/clerk.md), and record the switch in an ADR.

## Docs to consult

- https://docs.convex.dev/auth/advanced/custom-auth.md: `auth.config.ts` shape and the `ConvexProviderWithAuth` / `useAuth` contract (`isLoading`, `isAuthenticated`, `fetchAccessToken({ forceRefreshToken })`).
- https://docs.convex.dev/auth/functions-auth.md: `ctx.auth.getUserIdentity()`.
- https://docs.convex.dev/production/environment-variables.md: deployment env vars are per deployment (dev, prod, local), so `FIREBASE_PROJECT_ID` is set on each.
- Firebase Web SDK: `onIdTokenChanged(auth, cb)` and `user.getIdToken(forceRefresh)` (check `node_modules/@firebase/auth/dist/auth-public.d.ts` for the installed signatures).

## Cloud boundary

The scaffold creates **no Firebase project** and **no Convex cloud project**. The Convex env var gets a placeholder (`demo-<slug>`) on the local deployment; the client treats missing Firebase config as "signed out", so `pnpm check`, `pnpm build` and `pnpm dev` work before the user creates the Firebase project.

## Scaffold

None: this module extends the web app and `convex/`.

## Steps

1. **Install**: `cd "$WEB" && pnpm add firebase`. Done when `$WEB/package.json` lists `firebase`.
2. **Placeholder for the Convex auth config** (local deployment only, no login):
   ```bash
   cd "$PROJECT" && CONVEX_AGENT_MODE=anonymous npx convex env set FIREBASE_PROJECT_ID demo-<slug> </dev/null
   ```
   `auth.config.ts` reads this deployment env var when the CLI pushes functions; while it is unset, `npx convex dev` refuses the push with `Environment variable FIREBASE_PROJECT_ID is used in auth config file but its value was not set`, and the file itself throws as a backstop. The deployment also rejects `npx convex env remove FIREBASE_PROJECT_ID` while `auth.config.ts` uses it. Done when `cd "$PROJECT" && CONVEX_AGENT_MODE=anonymous npx convex env get FIREBASE_PROJECT_ID </dev/null` prints `demo-<slug>`.
3. **Overlay files** (overwrites the convex module's `components/convex-client-provider.tsx` with the authenticated version, which reuses `lib/convex.ts`; `app/layout.tsx` stays as the convex module left it):
   ```bash
   cp -R "$MOD/overlay/convex/." "$PROJECT/convex/"
   cp -R "$MOD/overlay/lib" "$MOD/overlay/hooks" "$MOD/overlay/components" "$WEB/"
   mkdir -p "$PROJECT/.claude/rules" && cp "$MOD/rules/"*.md "$PROJECT/.claude/rules/"
   ```
   Brings `convex/auth.config.ts`, `convex/me.ts`, `lib/firebase.ts`, `hooks/use-auth-from-firebase.ts`, `components/convex-client-provider.tsx`, `.claude/rules/auth.md`. Done when those files exist.
4. **Push and regenerate types**: `cd "$PROJECT" && CONVEX_AGENT_MODE=anonymous npx convex dev --once </dev/null`. Done when `convex/_generated/api.d.ts` mentions `me`.
5. **`.env.example`** (`$PROJECT`): append
   ```
   # Firebase Web app config (Firebase console → Project settings → Your apps)
   NEXT_PUBLIC_FIREBASE_API_KEY=
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=
   NEXT_PUBLIC_FIREBASE_APP_ID=
   # Convex deployment env (npx convex env set FIREBASE_PROJECT_ID <projectId>)
   # FIREBASE_PROJECT_ID=
   ```
   Done when the block is present once.
6. **Gate**: `cd "$WEB" && pnpm exec biome check --write`, then `cd "$PROJECT" && pnpm check && pnpm build`. Done when both exit 0.
7. **AGENTS.md**: merge `$MOD/agents-snippet.md` into `$PROJECT/AGENTS.md`. Done when the auth invariant line is present.

Done when `./scripts/check` and `./scripts/build` exit 0 in `$PROJECT`.

## Smoke test (required before building features on auth)

Runs once the user has a Firebase project (next steps below):

1. Fill the four `NEXT_PUBLIC_FIREBASE_*` values in `.env.local` and run `npx convex env set FIREBASE_PROJECT_ID <projectId>`.
2. Enable a sign-in provider (Google is simplest) in the Firebase console; add `localhost` to Authorized domains.
3. Run `npx convex dev` and `pnpm dev`. Temporarily render a button calling `signInWithGoogle()` from `lib/firebase.ts` and the result of `useQuery(api.me.viewer)`.
4. Pass: after sign-in, `viewer` returns a non-null identity whose `issuer` is `https://securetoken.google.com/<projectId>`. Fail: `null` after sign-in → check `iss`/`aud` of the token at jwt.io against `auth.config.ts`.

Done when the pass condition holds.

## Next steps for the user (add to the skill's final list)

- Log in to Firebase once: `! npx firebase-tools login` (no global install). After that the agent can run the CLI steps below.
- CLI, from `$PROJECT` (Spark plan is enough for Auth; `<projectId>` must be globally unique):
  ```bash
  npx firebase-tools projects:create <projectId> --display-name "<slug>"
  npx firebase-tools apps:create WEB "<slug>-web" --project <projectId>
  npx firebase-tools apps:sdkconfig WEB --project <projectId>   # copy apiKey, authDomain, projectId, appId into .env.local
  ```
- Console (one-time, needs the OAuth consent screen for Google): Authentication → Sign-in method → enable a provider; check that `localhost` is in Authorized domains.
- Convex: `npx convex env set FIREBASE_PROJECT_ID <projectId>`. On the local deployment this needs no Convex login; repeat it on each cloud deployment (dev after linking, and production) only if the project moves to the cloud.
- Run the smoke test above.
