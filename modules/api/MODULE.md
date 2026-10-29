# Module: api (recipe)

A public HTTP API outside Convex, built with Hono.

Variables (defined in the skill's "Layout"): `$PROJECT` is the repo root, `$API` the API's directory (`$PROJECT` in an API-only project, `$PROJECT/apps/api` in a workspace). Steps run in `$API` unless they say otherwise.

## When to apply

Start with **Convex HTTP actions** (`convex/http.ts`, https://docs.convex.dev/functions/http-actions.md): webhooks, small public endpoints and callbacks fit there with no extra deployable. Apply this module only when the API needs something Convex cannot give: long-running requests, a runtime or library Convex does not support, OpenAPI-first contracts for third parties, or hosting on Cloudflare Workers next to other services. Record the reason in an ADR.

## Docs to consult

- https://hono.dev/llms.txt (Hono docs for agents); https://hono.dev/docs/getting-started/basic
- For typed clients: Hono RPC (`hc`) or oRPC (https://orpc.unnoq.com).

## Scaffold

Creates `$API`, which must not exist yet. Run from its parent and pick the target runtime (`cloudflare-workers` for commercial/free hosting, `nodejs` for the homelab):

```bash
cd "$(dirname "$API")" && pnpm create hono@latest "$(basename "$API")"
```

Done when `$API/package.json` lists `hono`.

## Steps

1. Validation on every route with `@hono/zod-validator` (or Valibot); generate OpenAPI with `@hono/zod-openapi` when external consumers exist. Done when every route declares a validator.
2. Tests: Vitest calling `app.request()` directly (no server needed); one contract test per public route. Done when each public route has a passing test.
3. Gate: add `typecheck`, `lint` (Biome), `test` and `check` scripts. In a workspace the root `check` runs it (`pnpm -r check`). Done when `cd "$PROJECT" && pnpm check` runs the API's checks and exits 0.
4. To call Convex from the API, use `ConvexHttpClient` with the deployment URL; keep auth checks inside Convex functions. Done when any Convex call goes through `ConvexHttpClient`.

Done when `pnpm check` passes and `pnpm dev` answers `GET /health` with 200.

## Next steps for the user

- Cloudflare: `pnpm wrangler login`, then `pnpm wrangler deploy`. Homelab: deploy the Node build as a container in Coolify.
