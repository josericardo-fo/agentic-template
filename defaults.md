# Stack defaults

The template owner's preferred stack. `/new-project` proposes these when the user has no stack in mind. Delete or replace this file to use the template with other preferences; without it, the skill recommends a stack from the idea.

| Need | Default |
|---|---|
| Language | TypeScript end to end (Python only when the core is data/ML) |
| Web | `web` (Next.js) |
| Mobile | `mobile` (Expo) |
| Persistent data | `convex` |
| Login | `auth-firebase` |
| Public API outside the database | `api` (Hono) |
| Schedules/background | `automation` |
| AI | `ai` |
| Hosting | Vercel Hobby (personal); Cloudflare or Vercel Pro (commercial) |

Alternatives already ruled out (list them in the ADR): Supabase/Neon, Clerk, TanStack Start.
