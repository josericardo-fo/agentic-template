---
paths:
  - "app/**"
  - "components/**"
  - "src/**/*.tsx"
  - "apps/web/**"
---

# Frontend rules

## Visual direction

- `DESIGN.md` is the locked direction. Read it before touching UI; every screen follows it.
- Design tokens only: colours, radii, spacing and fonts come from the CSS variables in `app/globals.css` (shadcn theme) through Tailwind classes like `bg-background` or `text-primary`. A new colour is a new token in `globals.css` and `DESIGN.md` first.
- Distinctive typography: one display face plus one text face, loaded with `next/font`, chosen to fit the product's adjectives in `DESIGN.md`.
- One coherent theme per product. Layout follows the content's hierarchy: vary card sizes and density, lead with the primary action, and pick accents from the locked palette.
- Use the `frontend-design` skill for aesthetic direction, and `impeccable` to review a finished screen (`/impeccable critique` for UX, `/impeccable audit` for accessibility, performance and responsiveness).
- Build from shadcn components (`pnpm dlx shadcn@latest add <name>`, guided by the `shadcn` skill) before writing custom ones.

## Verify before claiming done

Every UI change is verified in the running app with the `playwright-cli` skill, at 375, 768 and 1280 px wide. The CLI ships with the project's `@playwright/test`; run it from the web app's directory with `npx playwright cli` (or `playwright-cli` when installed globally):

```bash
npx playwright cli open http://localhost:3000/<route>
npx playwright cli resize 375 812 && npx playwright cli screenshot
npx playwright cli resize 768 1024 && npx playwright cli screenshot
npx playwright cli resize 1280 800 && npx playwright cli screenshot
```

Look at each screenshot. Done means: nothing overflows or overlaps at any width, `pnpm test:e2e` (axe) is green, and the screen matches `DESIGN.md`.

## Human-decision workflow

The human decides direction; you execute. Locking or changing `DESIGN.md` is the user's call, even when a ticket or spec seems to allow it: stop and ask. Run this when a project has no `DESIGN.md` direction yet or the user asks for a new look:

1. **Brief.** Ask, one at a time: purpose of the screen/product; audience; three adjectives; hard constraints (brand, accessibility, devices). Then ask for 2–3 reference sites; when there are none, suggest six (Godly, Land-book, Mobbin are good sources) and let the user pick.
2. **Three directions.** Use the `prototype` skill to build three visually distinct directions of the same key screen. Save each under `design/options/<a|b|c>/` with screenshots at 375 and 1280. Present them side by side; the user picks one or mixes.
3. **Lock.** Write the chosen tokens (palette, type scale, radius, spacing, motion) into `app/globals.css` and `DESIGN.md`. Build one sample page and get the user's approval.
4. **Per screen.** Implement → screenshots at the three widths → `pnpm test:e2e` (axe) → `/impeccable critique` and `/impeccable audit` → fix. Show the user the finished screen only.
5. **Feedback.** The user speaks in plain language. Your questions are A/B choices with screenshots ("denser list A or roomier B?"); translate the answer into CSS yourself.
6. **Lock approved screens** with a Playwright `toHaveScreenshot` baseline so CI holds them.
