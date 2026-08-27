# Shipping to the App Store and Play Store

Everything in the repo is wired except the values that can only come from your
Apple, Google and Expo accounts. Those are checked in as `__SKIPPY_TODO_*`
placeholders so they are impossible to miss:

```bash
grep -rn "__SKIPPY_TODO_" --exclude-dir=node_modules .
```

A store build must not go out while that returns anything.

## 1. Accounts to create (one-off, needs a human)

| # | Account | Yields |
| --- | --- | --- |
| 1 | [Apple Developer Program](https://developer.apple.com/programs/) — organisation enrolment, needs a D-U-N-S number | **Apple Team ID** |
| 2 | App Store Connect — new app record, bundle id `id.skippy.wallet` | **ascAppId** |
| 3 | [Google Play Console](https://play.google.com/console) ($25 one-off) — new app, then a service account with Play Developer API access | **`play-service-account.json`** |
| 4 | [Expo](https://expo.dev) — organisation, then `eas init` in `apps/wallet` | **owner** + **EAS project id** |

## 2. Where each value goes

| Value | File |
| --- | --- |
| Expo owner, EAS project id | `apps/wallet/brands/skippy/config.js` (or `EXPO_OWNER` / `EAS_PROJECT_ID` in the environment) |
| Apple Team ID, ascAppId, company name | `apps/wallet/eas.json` → `submit.production.ios` |
| Play service account key | `apps/wallet/secrets/play-service-account.json` (git-ignored) |
| Privacy policy URL | `apps/wallet/brands/skippy/copy.ts` |
| Trust anchors | `apps/wallet/brands/skippy/trust.ts` |

Signing credentials themselves stay in EAS — none are committed.

## 3. Universal links

`app.skippy.id` must serve `/.well-known/apple-app-site-association` and
`/.well-known/assetlinks.json`. Both files, and the nginx route that exposes them,
are prepared in the **skippy** monorepo — see [`BACKEND.md`](BACKEND.md).

Two values are only knowable after step 1:

- AASA needs `<TEAM_ID>.id.skippy.wallet`.
- assetlinks needs the SHA-256 fingerprint of the Android signing certificate:
  `eas credentials -p android` → Keystore → SHA-256.

Deploy these **early**. Apple's CDN caches AASA, so verification can lag hours
behind a change.

## 4. Trust anchors (hard gate)

`brands/skippy/trust.ts` ships with empty anchor lists. The wallet works — it
receives and presents — but every issuer and verifier renders as untrusted.
Populate it with the Skippy issuance root CA before submitting, or the store
build tells holders that Skippy's own credentials come from an unknown party.

## 5. Store listing

Prepare per store:

- **Name / subtitle**: "Skippy Wallet" — digital credential wallet.
- **Description**: receive, hold and present digital credentials; open standards
  (OpenID4VC, SD-JWT VC, mdoc); data stays on the device.
- **Screenshots**: iPhone 6.7" and 6.1" (`supportsTablet: false`, so no iPad set
  is required); Play needs a 1024×500 feature graphic plus phone screenshots.
- **Category**: Utilities. **Support URL** and **privacy policy URL**: required
  by both.
- **App Review notes**: a reviewer must be able to complete a real flow. Include a
  hosted Skippy credential-offer link (and a test PIN if the flow asks for one) —
  without it the app looks like an empty shell and gets rejected.

## 6. Privacy declarations

The app collects nothing for the developer: credentials, keys and activity stay on
the device, and there is no analytics SDK in the tree.

- **Apple App Privacy**: "Data Not Collected". Expo SDK 56 aggregates each
  library's `PrivacyInfo.xcprivacy` at build time.
- **Google Data Safety**: no data collected or shared; data encrypted in transit;
  the user can delete everything via wallet reset.
- **Export compliance**: `ITSAppUsesNonExemptEncryption` is `false` — the app uses
  only standard, publicly available cryptography (TLS, platform keystore, standard
  signature suites).
- **Permission strings** are declared in `base.app.config.js`: camera (scanning QR
  codes), Face ID (unlocking and signing), photo library (credential sharing).

## 7. Build and submit

```bash
cd apps/wallet
eas build --profile preview --platform all      # verify on real devices first
eas build --profile production --platform all
eas submit --profile production --platform ios
eas submit --profile production --platform android
```

`production` uses `autoIncrement` with `appVersionSource: "remote"`, so EAS owns
build numbers. Bump the user-facing version in `apps/wallet/package.json`.

## Go / no-go

- [ ] `grep -rn "__SKIPPY_TODO_" --exclude-dir=node_modules .` returns nothing
- [ ] Real trust anchors in `brands/skippy/trust.ts`
- [ ] AASA + assetlinks live on `app.skippy.id`, verified on a real device
- [ ] Privacy policy URL reachable
- [ ] `pnpm types:check` and `pnpm style:check` pass
- [ ] Preview build installed and exercised on a real iPhone and a real Android
- [ ] Issuance and presentation both verified against the production hub
- [ ] App Review notes include a working credential-offer link
