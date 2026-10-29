---
paths:
  - "apps/mobile/**"
---

# Mobile rules (Expo)

- Install native-touching packages with `pnpm expo install <pkg>` so versions match the Expo SDK; consult the Expo skills/docs for the installed SDK before using an API.
- Styling with NativeWind v4 classes on the shared tokens; React Native Reusables first for components, `@expo/ui` when a control should look native on the platform.
- Safe areas, keyboard avoidance and touch targets ≥ 44 pt on every screen.
- Verify every UI change: run `pnpm expo start --web`, then `playwright-cli` screenshots at 375 and 768 px; for platform-specific behaviour, run the Maestro flow on a simulator.
- Secrets stay out of the app bundle: `EXPO_PUBLIC_*` values are public; anything secret lives in Convex env vars.
