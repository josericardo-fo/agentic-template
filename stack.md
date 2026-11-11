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
| Lint/format and tests | Biome; Vitest; Playwright + axe |
| Hosting | Vercel Hobby (personal); Cloudflare or Vercel Pro (commercial) |

Ruled out (list in the ADR alternatives): Supabase/Neon, Clerk, TanStack Start.

Architecture preference: Convex functions stay thin (validate, check access, call domain code); business rules live in plain TS with no Convex imports.

Access control (OWASP A01, no scanner catches it): every public Convex function checks access, and the caller's identity comes from `ctx.auth.getUserIdentity()`, never from an argument.

## Gotchas

- **Node**: align `@types/node` with the `.nvmrc` major (`create-next-app` pins `^20`).
- **Convex without an account**: run every CLI call as `CONVEX_AGENT_MODE=anonymous npx convex dev --once </dev/null` (closed stdin, so it never prompts for login). Linking to the cloud is the user's step.
- **Convex in CI**: the job that builds needs a placeholder `NEXT_PUBLIC_CONVEX_URL` so `next build` can prerender.
- **Convex agent files**: `npx convex ai-files install` appends a `convex-ai-start` block to both `AGENTS.md` and `CLAUDE.md`. Keep the `AGENTS.md` one at the end; delete the `CLAUDE.md` one so it stays `@AGENTS.md`.
- **Firebase Auth into Convex** has no official integration; use Convex OIDC with `domain` = `https://securetoken.google.com/<projectId>` and `applicationID` = `<projectId>`. Not yet validated: prove it with a real project (after sign-in, a query sees `ctx.auth.getUserIdentity()` with that issuer; `null` means an `iss`/`aud` mismatch).
- **Biome**: exclude `.claude`, `convex/_generated`, `playwright-report` and `test-results` in `files.includes`; vendored skills and generated code fail lint.
- **Web UI plugins**: enable `frontend-design@claude-plugins-official` and `impeccable` (from `pbakaus/impeccable`) with `--scope project`.
