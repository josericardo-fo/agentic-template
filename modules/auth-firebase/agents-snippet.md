# auth-firebase → AGENTS.md

Add to `{{EXTRA_INVARIANTS}}`:

```markdown
- Auth: Firebase Auth on the client, verified by Convex as an OIDC provider (`convex/auth.config.ts`). Server code trusts only `ctx.auth.getUserIdentity()`; rules in `.claude/rules/auth.md`.
```
