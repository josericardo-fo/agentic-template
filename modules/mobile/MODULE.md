# Module: mobile (recipe)

Expo + EAS app with NativeWind v4, React Native Reusables, `@expo/ui` for native controls and the Convex React Native client. Verification through Expo web + `playwright-cli`; Maestro for device E2E.

Variables (defined in the skill's "Layout"): `$MOD` is this module's directory, `$PROJECT` the repo root, `$MOBILE` the Expo app's directory (`$PROJECT` in a mobile-only project, `$PROJECT/apps/mobile` in a workspace). Every step runs in `$MOBILE` unless it says otherwise.

## Docs to consult

- https://docs.expo.dev/llms.txt (Expo docs index for agents) and the skills brought by the Expo plugin below.
- NativeWind **v4** install guide: https://www.nativewind.dev/docs/getting-started/installation (v5 is pre-release; stay on v4).
- React Native Reusables: https://reactnativereusables.com/docs
- `@expo/ui`: https://docs.expo.dev/versions/latest/sdk/ui/
- Convex React Native: https://docs.convex.dev/quickstart/react-native.md
- When a command below changed, read the tool's `--help`/docs, adapt, and **update this recipe**.

## Scaffold

Creates `$MOBILE`, which must not exist yet. Run from its parent:

```bash
cd "$(dirname "$MOBILE")" && pnpm create expo-app@latest "$(basename "$MOBILE")" --template default --no-agents-md --yes
```

`--no-agents-md` skips Expo's `AGENTS.md`/`.claude/settings.json`: the base owns those files and the Expo plugin (step 1) brings the Expo agent guidance. Then reset the starter and fold the scaffolder's leftovers into the repo:

```bash
cd "$MOBILE" && rm -rf .git                      # the scaffolder runs git init; the repo root owns git
cd "$MOBILE" && printf 'n\n' | node scripts/reset-project.js && rm -rf scripts && npm pkg delete scripts.reset-project
rm -rf "$MOBILE/pnpm-workspace.yaml" "$MOBILE/pnpm-lock.yaml"   # workspace only
cd "$PROJECT" && pnpm install                    # workspace only
```

`reset-project` replaces the demo screens with a minimal `src/app/` (`index.tsx`, `_layout.tsx`): the demo code fails `tsc --noEmit` on SDK 58, and the project starts from a clean slate anyway. Expo Router's screens live in `$MOBILE/src/app/`.

Done when `$MOBILE/package.json` lists `expo` and `expo-router`, `$MOBILE/src/app/_layout.tsx` exists, and `$MOBILE/.git` does not.

## Steps

1. **Expo agent tooling** (skills), project scope so it lands in `$PROJECT/.claude/settings.json`:
   ```bash
   cd "$PROJECT" && claude plugin install expo@claude-plugins-official --scope project
   ```
   If it reports `Plugin "expo" not found`, refresh the catalog with `claude plugin marketplace update claude-plugins-official` (or `claude plugin marketplace add anthropics/claude-plugins-official` when the marketplace is missing) and retry. Done when `jq '.enabledPlugins' "$PROJECT/.claude/settings.json"` lists `expo@claude-plugins-official`.
2. **NativeWind v4 + Tailwind v3** (NativeWind v4 requires Tailwind 3): follow the v4 install guide in `$MOBILE`; pin `nativewind@^4`. Done when a `className` on the home screen changes its style in Expo web.
3. **React Native Reusables**: run its CLI init in `$MOBILE`, then add components on demand (it is the shadcn equivalent; same token names as the web theme). Done when the init exits 0 and one component renders.
4. **`@expo/ui`** for native pickers, switches and sheets where platform look matters: `cd "$MOBILE" && pnpm expo install @expo/ui`. Done when it is in `$MOBILE/package.json`.
5. **Convex** (when the convex module is selected, it installs the package and writes `EXPO_PUBLIC_CONVEX_URL`): wrap the root layout (`$MOBILE/src/app/_layout.tsx`) in `ConvexProvider` with a `ConvexReactClient` built from `process.env.EXPO_PUBLIC_CONVEX_URL`. Auth with Firebase on mobile uses `@react-native-firebase/auth` or the JS SDK with `initializeAuth` + AsyncStorage persistence; the `useAuthFromFirebase` contract from `auth-firebase` stays the same. Done when the home screen renders inside the provider.
6. **Gate**: TypeScript strict + `noUncheckedIndexedAccess` in `$MOBILE/tsconfig.json`; Biome (`cd "$MOBILE" && pnpm add -D @biomejs/biome vitest && pnpm exec biome init`), Vitest (or `jest-expo` for component tests). Scripts: `typecheck` = `tsc --noEmit`, `lint` = `biome check`, `test` = `vitest run --passWithNoTests` (until the first test exists), `check` = `pnpm typecheck && pnpm lint && pnpm test`; then `pnpm exec biome check --write` once to normalize the starter. Done when `cd "$MOBILE" && pnpm check` exits 0 (in a workspace, also `cd "$PROJECT" && pnpm check`).
7. **Rules**:
   ```bash
   mkdir -p "$PROJECT/.claude/rules" && cp "$MOD/rules/mobile.md" "$PROJECT/.claude/rules/"
   ```
   The shipped `paths:` match the workspace layout (`apps/mobile/**`). Mobile-only project: replace the `paths:` list with `"src/**"`. Done when the frontmatter matches the layout.
8. **E2E**: Maestro flows under `$MOBILE/.maestro/` (`maestro test .maestro/`) for device runs; CI uses Expo web + Playwright for the fast path. EAS Build/Update in CI only after the user runs `eas init` (needs an Expo account). Done when one Maestro flow file exists for the home screen.

Done when `./scripts/check` passes in `$PROJECT` and `cd "$MOBILE" && pnpm expo start --web` renders the home screen in `playwright-cli`.

## Next steps for the user

- `eas login` + `eas init` (Expo account; free tier has 15 iOS + 15 Android builds/month).
- `eas build --profile development` for a dev client on a device.
