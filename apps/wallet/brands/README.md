# Brands

A brand is one folder in here. Everything that differs between white-label builds
of this wallet lives in it — identity, colours, copy, feature flags, trust anchors
and assets. `brands/skippy` is the reference brand; copy it to make another.

Two independent axes compose:

| Variable | Chooses | Example |
| --- | --- | --- |
| `EXPO_PUBLIC_APP_BRAND` | which brand | `skippy` |
| `APP_VARIANT` | which environment | `development` → `.dev` suffix |

`EXPO_PUBLIC_APP_BRAND=skippy APP_VARIANT=development` builds
`id.skippy.wallet.dev`, named "Skippy Wallet (Dev)".

## Files in a brand

| File | Loaded by | Purpose |
| --- | --- | --- |
| `config.js` | `app.config.js` (Node, build time) | name, slug, scheme, bundle id, icons, EAS ids, associated domains |
| `theme.ts` | `../themes.ts` → `tamagui.config.ts` | colour tokens, built from two brand colours via `../ramp.ts` |
| `copy.ts` | `../index.ts` | product name, support email, privacy URL, Lingui-defined brand strings |
| `features.ts` | `../index.ts` | per-brand feature flags |
| `trust.ts` | `../index.ts` | trust anchors and the wallet's own trusted-entity identity |
| `assets/` | `config.js`, `copy.ts`, `trust.ts` | icon, adaptive icon, splash |

## Adding a brand

1. `cp -r brands/skippy brands/<name>`
2. Replace `assets/` with the new brand's artwork. Keep the filenames — Android
   requires paths referenced from code to contain only `_ a-z A-Z 0-9`. Sizes:
   `icon.png` and `adaptive_icon.png` 1024×1024, `splash.png` 2568×5556.
   `scripts/generate-brand-icons.mjs` composes all of them from one SVG mark.
3. Edit `config.js` (name, slug, scheme, bundleId, associatedDomains, EAS ids) and
   `copy.ts` (product name, support email, privacy URL, message ids).
4. Set the brand's colours in `theme.ts`. `buildAppTheme` takes a primary and an
   accent and derives the full ramp; the accent is darkened for WCAG AA because
   `feature-500` is used as text.
5. Register it in **three** places:
   - `brands/configs.js` — build-time config
   - `brands/themes.ts` — theme
   - `brands/index.ts` — everything else
6. Give the new Lingui ids translations: `pnpm translations:extract` then
   `pnpm translations:compile`.
7. Build it: `EXPO_PUBLIC_APP_BRAND=<name> pnpm prebuild && EXPO_PUBLIC_APP_BRAND=<name> pnpm android`

Registration is deliberately explicit rather than a directory scan: Metro cannot
resolve a dynamic `import()` path, and an unknown brand name should fail the build
loudly rather than silently fall back to another brand's colours.

Switching `EXPO_PUBLIC_APP_BRAND` needs a Metro cache reset (`expo start -c`) —
the cache is not keyed on the variable.

## Build-time vs runtime branding

This folder is **build-time** branding: it decides what the app *is* — its name,
icon, bundle id and store listing. Shipping a new brand means shipping a new app.

**Runtime** branding is separate (`src/brand`). A Skippy customer configures
branding on their organisation in the dashboard, and when the wallet opens one of
that customer's links it re-skins the holder-facing surfaces to their brand. The
build-time brand is always the fallback.

Use build-time branding for a customer who wants their own app in the stores; use
runtime branding to reflect whose credentials a holder is currently dealing with
inside the Skippy app.
