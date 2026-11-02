---
paths:
  - "convex/**"
---

# Convex rules

Read `convex/_generated/ai/guidelines.md` before writing Convex code; it overrides training-data habits. For deeper workflows (crons, migrations, components), fetch the matching page from https://docs.convex.dev/llms.txt.

- **Validators everywhere.** Every query, mutation and action declares `args` with `v.*` validators, and `returns` too. Internal-only logic uses `internalQuery` / `internalMutation` / `internalAction`.
- **Access checks inside the function.** Derive the caller from `await ctx.auth.getUserIdentity()`; the user id never comes from an argument. Check ownership of every document read or written by id before returning or changing it.
- **Indexes over filters.** Query with `.withIndex(...)` on an index declared in `convex/schema.ts`; bound result sets with `.take(n)` or pagination.
- **Secrets on the server.** API keys live in Convex environment variables (`npx convex env set`), read via `process.env` inside actions. Client code sees only `NEXT_PUBLIC_*` values, which are public by definition.
- **Thin functions.** A handler only validates, checks access, loads documents, calls domain code and writes the result. Business rules live in plain TS modules outside `convex/` (e.g. `lib/domain/` at the repo root) that never import from `convex/` or the Convex SDK, so they are unit-tested without a backend and survive a database change.
- **Schema first.** A new table or field starts in `convex/schema.ts`; keep `npx convex dev` running so `_generated/` stays current, and commit it.
