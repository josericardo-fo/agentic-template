# convex → AGENTS.md

Add to `{{EXTRA_COMMANDS}}`:

```markdown
- `npx convex dev`: runs the Convex backend (local deployment until the project is linked to the cloud) and regenerates `convex/_generated/`. Run it alongside `pnpm dev`.
```

Add to `{{EXTRA_INVARIANTS}}`:

```markdown
- All data access goes through Convex functions in `convex/`; rules in `.claude/rules/convex.md`. Commit `convex/_generated/` with the change that produced it.
```
