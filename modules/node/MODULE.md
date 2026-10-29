# Module: node (toolchain)

Node + pnpm toolchain behind the base's fixed-name commands: `scripts/check` → `pnpm check`, `scripts/build` → `pnpm build` (when the script exists), `scripts/setup` → `pnpm install --frozen-lockfile`, `scripts/fmt` → Biome. Also pins Node (`.nvmrc`) and pnpm (`packageManager`), adds the CI toolchain steps and the `npm` Dependabot ecosystem.

Applied implicitly, first in order, whenever `web`, `mobile` or `api` is selected; the user does not pick it.

Variables (defined in the skill's "Layout"): `$MOD` is this module's directory, `$PROJECT` the repo root. Every step runs in `$PROJECT`. The scripts work for both layouts: in a workspace the root `package.json` fans `check` and `build` out to the apps.

## Docs to consult

- https://pnpm.io/package_json#packagemanager and https://github.com/pnpm/action-setup
- https://github.com/actions/setup-node (`node-version-file`, `cache: pnpm`)

## Scaffold

None. The app modules create `package.json`; this module only wires the toolchain around it.

## Steps (after the base is applied)

1. **Overlay** (replaces the base's stub `scripts/check`):
   ```bash
   cp -R "$MOD/overlay/." "$PROJECT/" && chmod +x "$PROJECT/scripts/"*
   ```
   Done when `$PROJECT/.nvmrc` exists and `scripts/check`, `scripts/build`, `scripts/setup`, `scripts/fmt` are executable.
2. **Pin pnpm** for CI (`pnpm/action-setup` reads it):
   ```bash
   cd "$PROJECT" && npm pkg set packageManager="pnpm@$(pnpm -v)"
   ```
   Done when `jq -r .packageManager "$PROJECT/package.json"` prints `pnpm@…`.
3. **CI**: insert the steps in `$MOD/ci-toolchain.yml` into the `check` job of `$PROJECT/.github/workflows/ci.yml`, right below the `# toolchain steps (inserted by modules)` marker (keep the marker and the snippet's indentation). Done when `ci.yml` has `pnpm/action-setup` before the `Setup` step.
4. **Dependabot**: add an `npm` entry to `updates:` in `$PROJECT/.github/dependabot.yml`, same shape as the `github-actions` one (`directory: /`, weekly, `minor-and-patch` group). Done when `grep -c 'package-ecosystem: npm' "$PROJECT/.github/dependabot.yml"` prints `1`.

Done when every step above holds. The app modules that follow define the `check` and `build` scripts; the skill's gate step runs `./scripts/check` and `./scripts/build`.

## Next steps for the user

None.
