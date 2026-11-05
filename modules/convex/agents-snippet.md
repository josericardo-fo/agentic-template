# convex → AGENTS.md

Add to `{{EXTRA_COMMANDS}}`:

```markdown
- `npx convex dev`: runs the Convex backend (local deployment until the project is linked to the cloud) and regenerates `convex/_generated/`. Run it alongside `pnpm dev`.
```

Add to `{{EXTRA_INVARIANTS}}`:

```markdown
- All data access goes through Convex functions in `convex/`; rules in `.claude/rules/convex.md`. Commit `convex/_generated/` with the change that produced it.
- Business rules live in plain TS modules outside `convex/` (e.g. `lib/domain/`) with no Convex imports; Convex functions stay thin wrappers around them.
- E2E wipes the local Convex deployment before each run (`e2e/reset-convex.ts`): data entered by hand in local dev is lost. Tests run in parallel against that database, so each one creates its own data with unique names and never asserts global counts.
```
