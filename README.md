<div align="center">
   <img src="apps/wallet/brands/skippy/assets/icon.png" alt="Skippy" height="176px" />
</div>

<h1 align="center"><b>Skippy Wallet</b></h1>

Skippy Wallet is the holder app for the [Skippy](https://skippy.id) platform. It
receives, stores and presents digital credentials issued by the Skippy hub, using
OpenID4VCI for issuance and OpenID4VP for presentation, over SD-JWT VC and mdoc.
Credentials are held on the device; keys stay in the secure element.

The app is white-label in two independent senses:

- **Build-time** — a brand is one folder under `apps/wallet/brands`. Copy it and
  you get a separately branded app, with its own name, icon, bundle id and store
  listing. See [`apps/wallet/brands/README.md`](apps/wallet/brands/README.md).
- **Runtime** — when the wallet is opened through a Skippy customer's link, it
  resolves that organisation's branding from the hub and re-skins the
  holder-facing surfaces. See `apps/wallet/src/brand`.

## Getting started

Requires **Node 22.21.1**, **pnpm 11.7** (via corepack), Xcode for iOS and Android
Studio + JDK 17 for Android. The wallet uses native modules that Expo Go cannot
load, so it always runs through a development build.

```bash
corepack enable
pnpm install
cd apps/wallet
cp .env.example .env.development   # then fill in as needed

pnpm prebuild                      # generates ios/ and android/
pnpm android                       # or: pnpm ios
```

To build a different brand, set `EXPO_PUBLIC_APP_BRAND` (and reset the Metro
cache — it is not keyed on the variable):

```bash
EXPO_PUBLIC_APP_BRAND=acme pnpm prebuild
EXPO_PUBLIC_APP_BRAND=acme pnpm android
```

## Repository layout

| Path | Contents |
| --- | --- |
| `apps/wallet` | the app: routing, screens, native config, brands |
| `apps/wallet/brands` | one folder per brand — identity, theme, copy, flags, trust |
| `apps/wallet/src/brand` | runtime tenant branding resolved from the Skippy hub |
| `packages/sdk` | wallet SDK: agent, OpenID4VC, secure storage, trust |
| `packages/ui` | Tamagui design system |
| `packages/app` | shared components, providers and hooks |
| `packages/translations` | Lingui catalogues |

## Documentation

- [`docs/STORE_RELEASE.md`](docs/STORE_RELEASE.md) — what is still needed to ship
  to the App Store and Play Store, and the go/no-go checklist
- [`docs/BACKEND.md`](docs/BACKEND.md) — how the wallet talks to the Skippy hub,
  including the universal-link setup the hub must serve
- [`docs/REBRAND.md`](docs/REBRAND.md) — what diverges from upstream and why

## Checks

```bash
pnpm types:check
pnpm style:check
```

## License and attribution

Licensed under the Apache License, Version 2.0 — see [LICENSE](LICENSE).

This project is a fork of the [Paradym Wallet](https://github.com/animo/paradym-wallet)
by Animo Solutions, also Apache-2.0. [NOTICE](NOTICE) records the fork point and
the modifications made. "Paradym" and "Animo" are marks of Animo Solutions and are
not used to endorse or promote this product.
