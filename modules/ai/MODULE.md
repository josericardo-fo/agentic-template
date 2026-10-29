# Module: ai (recipe)

LLM features: streaming chat/UI, agentic backends, retrieval.

Variables (defined in the skill's "Layout"): `$PROJECT` is the repo root, `$WEB` the web app's directory. Commands run in `$PROJECT` unless they say otherwise.

## Docs to consult

- Vercel AI SDK: https://ai-sdk.dev/llms.txt
- Claude / Anthropic SDKs: https://docs.claude.com/llms.txt. Load the `claude-api` skill before writing model-calling code: it carries the current model ids and pricing.
- Convex Agent component: https://docs.convex.dev/agents/getting-started.md; vector search: https://docs.convex.dev/search/vector-search.md

## Pick the library

- **Streaming UI in the web app**: Vercel AI SDK (`ai` + `@ai-sdk/react` + a provider package such as `@ai-sdk/anthropic`).
- **Agentic backend** (tools, multi-step loops, long tasks): Claude Agent SDK (`@anthropic-ai/claude-agent-sdk`) or the Anthropic SDK (`@anthropic-ai/sdk`) with tool use.
- **Agents/RAG on Convex**: `@convex-dev/agent` (threads, tools, memory); retrieval with Convex vector search.
- Models: the latest Claude models, with the model id taken from the `claude-api` skill at implementation time.

## Scaffold

None: this module adds code to the existing app and `convex/`.

## Steps

1. **Keys on the server only**: the user runs `npx convex env set ANTHROPIC_API_KEY ...`; calls happen in Convex actions or server routes. Add the variable name to `.env.example` with an empty value. Done when `.env.example` lists it and no client file reads it.
2. **Spend limit**: the user sets a monthly limit in the provider console; code enforces per-user quotas (a `usage` table checked before each call) and caps `max_tokens` on every request. Done when a unit test shows a call over quota is rejected.
3. **Minimal evals**: `evals/` with 10–20 representative inputs and assertions (exact match, schema validity, or an LLM-judge rubric). A `pnpm eval` script runs them; it stays out of `check` (cost, network) and runs before changing prompts or models. Done when `pnpm eval` exists and runs.
4. **Offline gate**: tests in `check` mock the model client, so the gate runs without network. Done when `pnpm check` passes with the network off.
5. **Streaming UI** follows the web module's frontend rules (loading, error and empty states visible in screenshots). Done when screenshots of the three states exist.

Done when `./scripts/check` passes in `$PROJECT` with mocked model calls and `pnpm eval` runs green against the real API once the user sets the key.

## Next steps for the user

- Create the API key, set the spend limit in the provider console, then `npx convex env set ANTHROPIC_API_KEY <key>`.
