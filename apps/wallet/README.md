<div align="center">
   <img src="brands/skippy/assets/icon.png" alt="Skippy" height="176px" style="border-radius: 15%;" />
</div>

<h1 align="center"><b>Skippy Wallet</b></h1>

The Expo React Native application. Despite what upstream's README claimed, most
feature code lives **here** in `src/features` — `packages/app` holds shared
components, providers and hooks, and `packages/sdk` holds the agent, OpenID4VC
and storage layers.

## Layout

| Path | Contents |
| --- | --- |
| `src/app` | expo-router routes, including `+native-intent.tsx` (deep links) |
| `src/features` | the screens: onboarding, receive, share, wallet, activity, menu |
| `src/brand` | runtime tenant branding resolved from the Skippy hub |
| `src/config` | thin re-export shims over the active brand |
| `brands` | build-time brands — see [brands/README.md](brands/README.md) |
| `scripts` | brand icon generation |
| `.maestro` | UI test flows (inherited from upstream; still point at upstream's issuer backend) |

## Development

```bash
cp .env.example .env.development
pnpm prebuild        # regenerate ios/ and android/ — required after any config change
pnpm android         # or: pnpm ios
```

`ios/` and `android/` are generated (Expo prebuild / CNG) and git-ignored — never
edit them by hand. Everything native flows from `app.config.js`,
`base.app.config.js` and the brand config — including Gradle's heap, which
`plugins/withGradleMemory.cjs` raises to 8 GB because the Expo default cannot dex
this project (see docs/REBRAND.md). A first Android build takes ~15-30 minutes.

Building another brand:

```bash
EXPO_PUBLIC_APP_BRAND=acme pnpm prebuild
EXPO_PUBLIC_APP_BRAND=acme pnpm android
```

Metro's cache is not keyed on `EXPO_PUBLIC_APP_BRAND`, so switching brands during
a running session needs `expo start -c`.

## Translations

```bash
pnpm translations:extract    # scans src/, brands/ and ../../packages
pnpm translations:compile
```

Compiled catalogues are formatted by Biome, so run `pnpm style:fix` from the repo
root afterwards.

## Further reading

- [`../../docs/STORE_RELEASE.md`](../../docs/STORE_RELEASE.md) — releasing to the stores
- [`../../docs/BACKEND.md`](../../docs/BACKEND.md) — hub integration and deep links
- [`../../docs/REBRAND.md`](../../docs/REBRAND.md) — divergence from upstream
