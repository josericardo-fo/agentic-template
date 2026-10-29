# Module: convex

Convex for database, server functions, crons/scheduled functions, file storage and vector search. Requires a Node/pnpm project (the `web` and/or `mobile` module, applied first).

Variables (defined in the skill's "Layout"): `$MOD` is this module's directory, `$PROJECT` the repo root, `$WEB` / `$MOBILE` the app directories that exist. `convex/` always lives at `$PROJECT/convex`, shared by every app. Each command below states its directory.

## Docs to consult

- Index: https://docs.convex.dev/llms.txt. Every page is served as markdown by appending `.md` to its URL (e.g. https://docs.convex.dev/cli/local-deployments.md).
- `convex/_generated/ai/guidelines.md` (written by step 7) is the version-matched rule set; read it before writing Convex code.
- When a command below fails because the CLI changed, read `npx convex <cmd> --help` and the matching docs page, adapt, and **update this recipe** in the template repo.

## Cloud boundary

The scaffold creates **no Convex account, cloud project or login**. It runs Convex in *anonymous local deployment* mode: the backend runs on this machine, its state lives in `.convex/`, and `.env.local` points at `http://127.0.0.1:3210`. Every `npx convex` call below runs with `CONVEX_AGENT_MODE=anonymous` and stdin closed (`</dev/null`), so the CLI never prompts for login. The first run downloads the local backend binary (network, no account). Linking to a cloud project is the user's step (see "Next steps for the user").

## Scaffold

None: this module extends the app(s) already scaffolded.

## Steps

1. **Install** `convex` where the CLI runs and in every app that talks to Convex:
   ```bash
   cd "$PROJECT" && pnpm add convex          # single-app
   cd "$PROJECT" && pnpm add -w convex       # workspace (CLI at the root) ...
   cd "$WEB" && pnpm add convex              # ... plus each app dir that exists ($WEB, $MOBILE)
   ```
   Done when every listed `package.json` has `convex` in `dependencies`.
2. **AI files config**: guidelines only, no Convex agent skills (they add ~30 skills of context per session; the guidelines file plus the docs index cover the same ground). Write `$PROJECT/convex.json`:
   ```json
   {
     "$schema": "./node_modules/convex/schemas/convex.schema.json",
     "aiFiles": { "skills": { "agents": [] } }
   }
   ```
   Done when `jq -c .aiFiles "$PROJECT/convex.json"` prints `{"skills":{"agents":[]}}`.
3. **Overlay files**:
   ```bash
   cp -R "$MOD/overlay/convex/." "$PROJECT/convex/"
   mkdir -p "$PROJECT/.claude/rules" && cp "$MOD/rules/"*.md "$PROJECT/.claude/rules/"
   # web module only:
   mkdir -p "$WEB/lib" "$WEB/components" && cp "$MOD/overlay/lib/convex.ts" "$WEB/lib/" \
     && cp "$MOD/overlay/components/convex-client-provider.tsx" "$WEB/components/"
   ```
   Brings `convex/schema.ts`, `convex/health.ts`, `.claude/rules/convex.md`, and for web `lib/convex.ts` (the single `ConvexReactClient` and URL check) and `components/convex-client-provider.tsx`. Done when those files exist.
4. **Wire the provider** (web module only): in `$WEB/app/layout.tsx`, import `ConvexClientProvider` from `@/components/convex-client-provider` and wrap `{children}` inside `<body>` with it. Mobile wires its own provider (mobile step 6). Done when `layout.tsx` renders `<ConvexClientProvider>`.
5. **Ignore and exclude**:
   - Add `.convex/` to `$PROJECT/.gitignore` when absent (local backend state).
   - When `$PROJECT/biome.json` exists (single-app), add `"!convex/_generated"` to its `files.includes` when absent. This module is the only owner of that entry. In a workspace, root `convex/` sits outside every app's Biome scope.

   Done when each entry appears exactly once.
6. **Local deployment and types** (also pushes the functions once and exits):
   ```bash
   cd "$PROJECT" && CONVEX_AGENT_MODE=anonymous npx convex dev --once </dev/null
   ```
   The CLI names the URL variable after the framework in `$PROJECT/package.json`: `NEXT_PUBLIC_CONVEX_URL` (Next.js), `EXPO_PUBLIC_CONVEX_URL` (Expo), `CONVEX_URL` (workspace root). In a workspace, give each app its own `.env.local` from the root value:
   ```bash
   cd "$PROJECT" && url="$(sed -n 's/^CONVEX_URL=//p' .env.local)"
   [ -d "$WEB" ] && printf 'NEXT_PUBLIC_CONVEX_URL=%s\n' "$url" > "$WEB/.env.local"
   [ -d "$MOBILE" ] && printf 'EXPO_PUBLIC_CONVEX_URL=%s\n' "$url" > "$MOBILE/.env.local"
   ```
   Done when `$PROJECT/convex/_generated/api.d.ts` exists and every app has its URL variable in an `.env.local`. `convex/_generated/` is committed: it is what makes `pnpm check` pass on a fresh clone and in CI.
7. **Official guidelines**:
   ```bash
   cd "$PROJECT" && CONVEX_AGENT_MODE=anonymous npx convex ai-files install </dev/null
   cd "$PROJECT" && printf '@AGENTS.md\n' > CLAUDE.md
   ```
   The first command writes `convex/_generated/ai/guidelines.md` and a managed section in `AGENTS.md` that points agents at it; with step 2's config it installs no skills. It always appends the same section to `CLAUDE.md` too (the CLI has no flag to skip it), so the second command restores the single import. `npx convex ai-files status` then reports `CLAUDE.md: no Convex section present`; that is expected. Done when the guidelines file exists, `AGENTS.md` contains `convex-ai-start`, `CLAUDE.md` is exactly `@AGENTS.md`, and neither `.claude/skills/convex*` nor `.agents/` exists.
8. **`.env.example`** (`$PROJECT`): append
   ```
   # Convex (written to .env.local by `npx convex dev`; workspace apps get their own copy, see step 6)
   CONVEX_DEPLOYMENT=
   NEXT_PUBLIC_CONVEX_URL=
   NEXT_PUBLIC_CONVEX_SITE_URL=
   ```
   using the variable names step 6 produced (`.env.local` is the source of truth). Done when every variable in `.env.local` is listed.
9. **CI** (web module only), in `$PROJECT/.github/workflows/ci.yml`:
   - `check` job: add a job-level `env:` with `NEXT_PUBLIC_CONVEX_URL: https://placeholder.convex.cloud`, so `pnpm build` can prerender without a deployment.
   - `e2e` job: **no** placeholder (process env would override `.env.local` and the app would talk to a dead URL). Add this step right before `pnpm test:e2e`, so CI gets a real local deployment and writes `.env.local`:
     ```yaml
           - name: Convex local deployment
             working-directory: .
             run: CONVEX_AGENT_MODE=anonymous npx convex dev --once </dev/null
     ```
     Workspace: the CLI writes `CONVEX_URL` to the root `.env.local`, but the app reads `apps/web/.env.local`. Append to that `run:`:
     ```bash
     && printf 'NEXT_PUBLIC_CONVEX_URL=%s\n' "$(sed -n 's/^CONVEX_URL=//p' .env.local)" > apps/web/.env.local
     ```
   Done when only `check` carries the placeholder and `e2e` has the deployment step.
10. **Playwright starts the backend** (web module only): in `$WEB/playwright.config.ts`, turn `webServer` into an array and put this entry first, so `pnpm test:e2e` works without a manual `npx convex dev` and stops the backend when it ends:
    ```ts
    {
      // Backend Convex local (deployment anônimo); o Next lê a URL do .env.local
      command: "npx convex dev",
      cwd: ".", // workspace: "../.." (repo root, where convex/ lives)
      env: { CONVEX_AGENT_MODE: "anonymous" },
      url: "http://127.0.0.1:3210/version",
      reuseExistingServer: !isCI,
      timeout: 180_000,
    },
    ```
    Done when, with no backend running (port 3210 free), `cd "$WEB" && pnpm test:e2e` passes and port 3210 is free again afterwards.
11. **Gate**: `cd "$WEB" && pnpm exec biome check --write` (and the same in `$MOBILE` when it exists), then `cd "$PROJECT" && pnpm check`. Done when `pnpm check` exits 0.
12. **AGENTS.md**: merge `$MOD/agents-snippet.md` into `$PROJECT/AGENTS.md`. Done when its Convex command and invariant lines are present.

Done when `./scripts/check` and `./scripts/build` exit 0 in `$PROJECT` and `git status` shows `convex/_generated/` as files to commit.

## Next steps for the user (add to the skill's final list)

- `npx convex dev` (from the repo root) runs the local backend alongside the app's dev server (no account needed).
- To move to the cloud: `npx convex login`, then `npx convex dev --configure new` (creates the cloud project and rewrites `.env.local`; in a workspace, copy the new URL into each app's `.env.local`).
- Production on Vercel: set `CONVEX_DEPLOY_KEY` in Vercel and use `npx convex deploy --cmd 'pnpm build'` as the build command.
