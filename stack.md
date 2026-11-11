# Stack defaults and gotchas

Owner's preferred stack. Propose it when the user has no stack in mind. Use the official scaffolder and current docs (context7) for every tool; this file holds only preferences and facts that cost time to find.

| Need | Default |
|---|---|
| Language | TypeScript end to end (Python only when the core is data/ML) |
| Web | Next.js |
| Mobile | Expo |
| Persistent data | Convex |
| Login | Firebase Auth |
| Public API outside the database | Hono |
| Schedules/background | Convex crons |
| AI | Vercel AI SDK; Claude via the `claude-api` skill |
| Hosting | Vercel Hobby (personal); Cloudflare or Vercel Pro (commercial) |

Ruled out (list in the ADR alternatives): Supabase/Neon, Clerk, TanStack Start.

## Gotchas

- **Node toolchain**: `.nvmrc` + `packageManager` (`pnpm@$(pnpm -v)`) in `package.json`. `scripts/check` is `exec pnpm check`, `scripts/build` is `exec pnpm run --if-present build`, `scripts/setup` is `exec pnpm install --frozen-lockfile`. CI `check` job: `pnpm/action-setup@v4` then `actions/setup-node@v4` with `node-version-file: .nvmrc` and `cache: pnpm`, before the Setup step. Align `@types/node` with the `.nvmrc` major (`create-next-app` pins `^20`).
- **Workspace** (two or more apps): pnpm workspace with apps under `apps/`; `convex/` stays at the root; root `check`/`build` fan out with `pnpm -r --if-present`.
- **Convex without an account**: run every CLI call as `CONVEX_AGENT_MODE=anonymous npx convex dev --once </dev/null` (closed stdin, so it never prompts for login). State lives in `.convex/`, `.env.local` points at `127.0.0.1:3210`. Linking to the cloud is the user's step.
- **Convex agent files**: `npx convex ai-files install` (stdin closed) writes `convex/_generated/ai/guidelines.md`, installs `convex-*` skills and appends a `convex-ai-start` block to both `AGENTS.md` and `CLAUDE.md`. Keep the `AGENTS.md` block at the end; delete the `CLAUDE.md` one so it stays `@AGENTS.md`.
- **Convex env in CI**: the `check` job needs a placeholder `NEXT_PUBLIC_CONVEX_URL` so `pnpm build` can prerender. The `e2e` job gets no placeholder (it would override `.env.local`); it starts a local deployment instead.
- **Convex e2e**: Playwright `webServer` starts the backend; `globalSetup` wipes the local deployment before each run. Tests share one database, so each creates uniquely named data and never asserts global counts.
- **Thin Convex functions**: handlers validate, check access, call domain code. Business rules live in plain TS (`lib/domain/`) with no Convex imports. Every function declares `args` and `returns` validators; the caller comes from `ctx.auth.getUserIdentity()`, never from an argument. Commit `convex/_generated/`.
- **Firebase Auth into Convex** has no official integration; use Convex OIDC. `convex/auth.config.ts`: `domain` = `https://securetoken.google.com/<projectId>` (the `iss`), `applicationID` = `<projectId>` (the `aud`), project id from Convex env `FIREBASE_PROJECT_ID`. Client: `ConvexProviderWithAuth` whose `fetchAccessToken` returns `user.getIdToken(forceRefresh)`. Unproven until the smoke test passes with a real project: after sign-in a `viewer` query returns an identity with that issuer. `null` means `iss`/`aud` mismatch. `NEXT_PUBLIC_FIREBASE_*` are public; never commit service accounts.
- **Web UI**: enable plugins `frontend-design` (`frontend-design@claude-plugins-official`) and `impeccable` (from `pbakaus/impeccable`) in project settings (`--scope project`). Unit tests with Vitest; e2e + axe with `@playwright/test`, whose `playwright cli install --skills` writes the `playwright-cli` skill, no global install. Lock visual decisions in `DESIGN.md`. Add `!.claude`, `!convex/_generated`, `!playwright-report`, `!test-results` to Biome `files.includes` (vendored skills and generated code fail lint) and the Playwright output dirs to `.gitignore`.
- **Next.js agent rules**: `create-next-app` writes an `AGENTS.md` holding a managed `nextjs-agent-rules` block, which `next dev` re-adds when missing. Keep it verbatim at the end of the final `AGENTS.md`.
- **AI keys** stay server-side (`npx convex env set ANTHROPIC_API_KEY`); enforce per-user quotas and cap `max_tokens`.
