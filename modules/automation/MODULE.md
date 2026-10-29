# Module: automation (recipe)

Scheduled and background work.

Variables (defined in the skill's "Layout"): `$PROJECT` is the repo root; `convex/` lives at `$PROJECT/convex`. Commands run in `$PROJECT`.

## Docs to consult

- https://docs.convex.dev/scheduling/cron-jobs.md and https://docs.convex.dev/scheduling/scheduled-functions.md
- https://docs.convex.dev/testing/convex-test.md (unit tests for jobs)
- `convex/_generated/ai/guidelines.md` (installed by the convex module) before writing any Convex code.

## Pick the runtime

1. **Default: Convex.** Crons (`convex/crons.ts`) and scheduled functions (`ctx.scheduler.runAfter` / `runAt`) cover recurring jobs, delayed work and retries, typed and in the same deployment.
2. **Durable multi-step flows** on Convex: the Workflow component (`@convex-dev/workflow`, https://www.convex.dev/components/workflow); check https://www.convex.dev/components before hand-rolling one.
3. **Long-running services or visual automations** (scrapers, bots, always-on agents, integrations with many SaaS nodes): the user's homelab. **n8n** for visual flows, **Coolify** to run a container. Record the choice in an ADR; these live outside this repo's deployable unless the service code is here.

## Scaffold

None: jobs live in `convex/` (Convex default) or outside the repo (homelab).

## Steps (Convex default)

1. Create `convex/crons.ts` with `cronJobs()`; each job calls an `internalMutation` or `internalAction`, so only the scheduler can trigger it. Done when `npx convex dev --once` accepts the file.
2. Make every job idempotent (safe to run twice) and bounded (process a page per run, reschedule the rest). Done when a unit test runs the job twice and asserts the same end state.
3. Unit-test the job's logic with `convex-test`; add it to the `check` gate. Done when `pnpm check` runs and passes that test.
4. Alerting: on failure, write to a `jobRuns` table or send an email (Resend) from the action. Done when a forced failure in a test leaves a `jobRuns` row (or the email call is asserted on a mock).

Done when `pnpm check` passes and the job appears under Schedules in the Convex dashboard of the local deployment (`npx convex dashboard`).

## Next steps for the user

- Homelab path: create the n8n workflow or Coolify service; store its credentials in the homelab, outside this repo.
