# Divergence from upstream

This fork tracks [animo/paradym-wallet](https://github.com/animo/paradym-wallet).
Fork point: `2d68168863dd8e78f883b752f420dc46aa2d7108` (upstream `main`,
2026-07-22), tagged locally as `upstream-fork-point`.

Upstream is actively maintained, so the rebrand is deliberately **minimal-diff**:
everything users or app stores see is renamed; internal identifiers that never
surface are left alone so merges stay cheap. This file is both the map for
resolving those merges and the record of modifications Apache-2.0 §4(b) requires.

## Renamed

| Area | Upstream | Skippy |
| --- | --- | --- |
| App name | Paradym Wallet | Skippy Wallet |
| Bundle id / Android package | `id.paradym.wallet` | `id.skippy.wallet` |
| URL scheme | `id.animo.paradym` | `id.skippy.wallet` |
| Slug | `paradym-wallet` | `skippy-wallet` |
| Expo owner | `animo-id` | brand config (placeholder) |
| EAS project id | Animo's | brand config (placeholder) |
| Associated domains | `paradym.id`, `dev.paradym.id`, `paradymwallet.app` | `app.skippy.id` |
| App-link paths | `/invitation`, `/wallet/redirect`, `/oauth2/redirect` | + `/wallet` (brand-configurable) |
| Assets | `assets/paradym/` | `brands/skippy/assets/` |
| SDK setup module | `src/config/paradym.ts` | `src/config/sdkSetup.ts` |
| SDK options export | `paradymWalletSdkOptions` | `walletSdkOptions` |
| Wallet store id | `easypid-wallet` | `skippy-wallet` |
| Support contact | `ana@animo.id` | `brand.supportEmail` |
| Privacy policy | `paradym.id/wallet-privacy-policy` | `brand.privacyPolicyUrl` |
| Lingui brand ids | `paradymWallet.about.*` | `skippyWallet.about.*` |

## Visual identity

Colour and naming alone still left the app reading as Paradym, because the
*shapes* were unchanged. The design now diverges deliberately — the direction is
"calm and trustworthy": crisp type, generous whitespace, squarer corners, and
brand purple used as an accent rather than as large fields.

| Element | Upstream | Skippy |
| --- | --- | --- |
| Type | Open Sans body + Raleway headings | **Inter throughout**, matching the Skippy web app |
| Backdrop | hand-drawn organic blob, ~50% of the screen | `BrandBackdrop` — soft wash + concentric arcs echoing the Skippy mark |
| Home layout | centred hero, then a list | left-aligned column, labelled "Overview" section |
| Action tiles | solid black tile vs. white tile | two quiet white tiles; the primary one carries a filled accent icon well |
| Rows (`InfoButton`) | filled grey pill, `br $8` | white surface, hairline border, `br 14` |
| Primary button | near-black (`grey-900`), radius 16 | brand purple (`primary-500`), radius 10 |

Notes for future merges:

- `fontInter` was already exported by `packages/ui` and its OTFs already bundled,
  so the type swap added no dependencies — the wallet app was simply overriding
  the shared default.
- `Blob` is left untouched in `packages/ui` and merely unused, so upstream edits
  to it cannot conflict.
- `InfoButton` and `SolidButton` are shared components and were restyled
  deliberately, so the shape language carries to every screen that uses them.
  Expect conflicts there if upstream restyles them too; the Skippy side is the
  white/hairline/14 row and the purple primary button.
- `PeopleIcon` hardcoded `fill="black"` on every path, which silently overrode
  its own `color` prop. The fills are removed so the prop works; the default is
  unchanged, so nothing that relied on it moves.
- `BrandBackdrop` reads `primary-*` from the theme, so each white-label brand
  gets its own tint with no extra work.
- The logo sits on `brand.logoBackground` (`#0D1117`, matching the web app's
  `theme_color`), not on brand purple. Purple is the accent.
- Changing the icon artwork needs more than a rebuild: `<Image src="icon" />`
  resolves to the **native** icon resource and expo-image caches it with
  `cachePolicy="memory-disk"`, so an install over existing data keeps serving the
  old bitmap. Run `adb shell pm clear <app id>` (or reinstall clean) when
  verifying an icon change, or you will review a stale image.

## Restructured

- **`apps/wallet/brands/`** (new) — build-time brands. `app.config.js` is now a
  thin consumer of `brands/configs.js`; `base.app.config.js` takes `owner`,
  `adaptiveIconBackgroundColor` and `universalLinkPaths` as inputs instead of
  hardcoding Animo's values.
- **`src/config/{themes,copy,features}.ts`** are now re-export shims over the
  brand registry. Import sites across the app are untouched, which keeps the diff
  against upstream small.
- **`apps/wallet/src/brand/`** (new) — runtime tenant branding from the hub.
- **`src/constants.ts`** — upstream's ~20 demo trust anchors (Animo Playground,
  Bundesdruckerei, EUDI reference verifier, Docusign, Vodafone, LapID, Netlight,
  Paradym Playground, HvA, eduID, Legoland) are removed; anchors now come from the
  active brand. `eudiTrustList` and the dead `trustedEntityIds` export are gone.
- **`lingui.config.js`** — also scans `brands/`.

## Behaviour changes

- `FEATURES.DIDCOMM` is `false` and `didcommConfiguration` is omitted from the SDK
  options, so the DIDComm modules are never registered and no mediator is needed.
  `AI_ANALYSIS` and `CLOUD_HSM` remain `false`.
- The `eudi_rp_authentication` trust mechanism is not configured — it requires an
  EUDI trust list and Skippy is not part of that framework.
- SDK trace logging is dev-only. Upstream logs at `LogLevel.Trace` unconditionally,
  which writes credential contents to the device log in a store build.

## Fixed while forking

- `src/app/+native-intent.tsx` short-circuited on the literal string
  `'id.animo.paradym:///'`, which silently breaks under any other scheme. It now
  derives from `appScheme`.
- The `pidSetup.enableBiometrics` copy hardcoded "Paradym Wallet". It is now
  brand-neutral under a new message id (`…subtitleV2`), since the existing
  translations named a specific product.
- The wallet home screen crashed with DIDComm disabled: `WalletScreen` renders
  `InboxIcon` unconditionally, whose hooks need the DIDComm record providers that
  `RecordProvider` only mounts when the agent has DIDComm modules. Upstream ships
  `DIDCOMM: true`, so this path was never exercised. The icon is now gated on the
  `DIDCOMM` feature flag — the inbox is a mediator-message concept and has no
  meaning without DIDComm.
- The keychain biometry capability probe (`Keychain.getSecurityLevel` with
  `securityLevel: SECURE_HARDWARE`) can throw on devices without Keymaster
  hardware instead of reporting "unavailable". That exception propagated into the
  secure-unlock initialization query, which react-query swallows — leaving the
  app on a permanent blank screen with no error anywhere. The probe now fails
  safe (`false` = biometrics unavailable) and initialization failures are logged.
- The Android build could not complete with Expo's default `-Xmx2048m`:
  `:app:mergeExtDexDebug` fails after ~30 minutes with a
  `DexArchiveMergerException` whose message is empty — an OOM in the dex merge
  worker. Measured on a 16 GB machine: 2 GB fails, 8 GB succeeds (build then
  takes ~16 min). `plugins/withGradleMemory.cjs` sets it, as a config plugin
  rather than an edit to `android/gradle.properties`, which prebuild regenerates.

## CI replaced

Upstream's pipelines target Animo's accounts and infrastructure, so they are
removed rather than left to fail:

- `continuous-deployment-sdk.yaml` — ran `changesets publish` on every push to
  `main`, publishing `@paradym/wallet-sdk` to npm. We do not publish that package.
- `continuous-deployment.yaml` — EAS builds via Animo's Expo account. Replaced by
  `eas-build.yaml` (our profiles, `EXPO_TOKEN`, brand input, manual submission).
- `e2e-maestro-tests.yaml` and `apps/wallet/.eas/workflows/` — drive Maestro
  against Paradym's hosted issuer backend using `paradym_api_key`.
- `claude.yml` — Animo's GitHub app integration.

`continuous-integration.yaml` is kept and extended: it pins Node 22.21.1, resolves
every registered brand's Expo config (catching a half-registered brand without
paying for a native build) and reports unresolved `__SKIPPY_TODO_` placeholders.

The `.maestro` flows themselves are kept — they are useful UI tests — but they
still target upstream's issuer backend and need rewriting against Skippy before
they will pass. Their `appId` is updated to `id.skippy.wallet.preview`.

## Deliberately NOT renamed

Renaming these would touch 150+ files and turn every upstream merge into a
conflict, for no user-visible gain:

- The workspace package `@paradym/wallet-sdk` and its exported identifiers
  (`ParadymWalletSdk`, `useParadym`, `ParadymWallet*Error`, …).
- `@animo-id/*` and `@owf/*` npm dependency names.
- `EASYPID_WALLET_PID_PIN_KEY_ID` / `EASYPID_WALLET_INSTANCE_LONG_TERM_AES_KEY_ID`
  — secure-enclave key aliases, never shown to users.
- The legacy cleanup path `wallet/paradym-wallet-<v>` in
  `WalletServiceProviderClient.ts`; it only removes an orphan directory that never
  exists in a Skippy install.
- Dead endpoints behind disabled flags: `OverAskingApi` (`funke.animo.id`) and the
  Wallet Service Provider default (`wsp.funke.animo.id`). Unreachable while
  `AI_ANALYSIS` and `CLOUD_HSM` are false.
- `LICENSE`, `packages/sdk/LICENSE` and `patches/` — must stay byte-identical.

## Known issues (inherited from upstream, observed on-device)

- **Interrupted onboarding cannot recover without a data wipe.** If the app dies
  between wallet-store creation and `hasFinishedOnboarding` being persisted, the
  next launch redirects to `/onboarding?reset=true`. That reset regenerates the
  wallet-key **salt** but leaves the existing **Askar store** on disk, so every
  subsequently chosen PIN derives a key that cannot open the old store — Askar
  logs `Incorrect key for store` and onboarding fails with
  `ParadymWalletAuthenticationInvalidPinError`, forever. Recovery requires
  clearing app data. The reset path should delete the store (or reuse the salt);
  needs a careful fix upstream because deleting a store is data-destructive.

## Syncing with upstream

```bash
git fetch upstream
git checkout -b chore/upstream-sync-$(date +%Y%m)
git merge upstream/main
```

Merge rather than rebase, so the fork point stays meaningful. Expect conflicts in
`app.config.js`, `base.app.config.js`, `src/constants.ts`, `src/config/*` and
`eas.json` — the table above says what the Skippy side of each should look like.
After merging, re-run `pnpm types:check`, `pnpm style:check` and a prebuild.

## Toolchain baseline

Verified on: Node 22.21.1, pnpm 11.7.0, JDK 17 (Zulu 17.0.7), Android SDK with
`minSdk 26` / `compileSdk 36`. Upstream's iOS setup expects Xcode 26.4.
