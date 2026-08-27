# Talking to the Skippy backend

The wallet speaks plain OpenID4VC, so most of it needs no Skippy-specific code.
Three things are Skippy-specific: which hub it points at, which links it claims,
and the tenant-branding lookup.

## Services

| Service | Role |
| --- | --- |
| **skippy-hub** | tenant API, holder sessions, wallet access tokens, public brand |
| **skippy-agent** | the OpenID4VC endpoints proper — `/oid4vci/*` (issuance) and `/siop/*` (presentation) |

Both sit behind `app.skippy.id`. The wallet's hub base URL comes from
`brands/<brand>/config.js` → `extraConfig.skippyHubUrl`, overridable per build with
`EXPO_PUBLIC_SKIPPY_HUB_URL`, and is read in app code as `skippyHubUrl`
(`src/constants.ts`).

For local development: the iOS simulator can reach `http://localhost:<port>`; the
Android emulator reaches the host as `http://10.0.2.2:<port>`.

## Links the wallet claims

Custom schemes (registered in `base.app.config.js`, unchanged from upstream):

```
openid-credential-offer://   openid4vp://   openid-vc://   haip://
eudi-openid4vp://            mdoc-openid4vp://             openid://
id.skippy.wallet://          (this brand's own scheme)
```

Universal / app links on `app.skippy.id` — `/wallet`, `/invitation`,
`/oauth2/redirect` (`universalLinkPaths` in the brand config).

Incoming links are parsed by `src/app/+native-intent.tsx`, which routes credential
offers to the receive flow and authorization requests to the share flow. That
function is deliberately synchronous — making it async broke deep links on cold
start upstream, so do not add awaits to it.

## Runtime tenant branding

`src/brand` resolves an organisation's white-label branding so holder-facing
surfaces match whoever issued the credential.

```
GET {skippyHubUrl}/app/v1/public/brand?token=<wallet access token>
```

Unauthenticated, rate-limited, and it answers `{ "data": null }` for an unknown or
expired token or an org without branding. On the hub this is gated by the
`BRANDING` feature flag.

The token is read only from `https://` links whose host matches the **build-time**
hub and whose path starts with `/wallet` — never from the link's own origin, so a
hostile link cannot aim the wallet (or the token) at another server. The response
is validated before use: logos must be absolute `https` URLs, colours must parse,
strings are length-capped. Results are cached in MMKV and cleared on wallet reset.

Colours go through `brands/ramp.ts`, the same maths as
`packages/skippy-web/src/util/brand.ts`, so a colour set in the Skippy dashboard
renders identically on web and mobile.

## What the hub side still needs

Universal links require an association file per platform, served from
`app.skippy.id` itself. This is prepared in the **skippy** monorepo on branch
`feat/wallet-app-links`:

- `packages/skippy-web/public/.well-known/apple-app-site-association`
- `packages/skippy-web/public/.well-known/assetlinks.json`
- a content-type fix in `packages/skippy-web/server.mjs`

nginx needs **no** change: the `app.skippy.id` block falls through to
`location /`, which proxies to skippy-web, and Vite copies `public/` verbatim
(dot-directories included) into `build/`.

`server.mjs` did need one. It picks the content type from the file extension and
otherwise falls back to `application/octet-stream` — but
`apple-app-site-association` has no extension by design, and Apple rejects
anything that is not `application/json`. Without the fix universal links fail
while the file appears to be served correctly.

Two values in those files can only be filled in once the store accounts exist:
the **Apple Team ID**, and the **SHA-256 fingerprint** of the Android signing
certificate (`eas credentials -p android`). Deploy early — Apple's CDN caches the
AASA, so verification lags a change by hours.

Verify once deployed:

```bash
curl -sI https://app.skippy.id/.well-known/apple-app-site-association | grep -i content-type
curl -s  https://app.skippy.id/.well-known/assetlinks.json | head
```

Optionally, `buildOpenIdCredentialWalletMetadata`
(`packages/skippy-hub/src/controllers/openidvc/openidvcHolder.ts`) can advertise
the native scheme alongside the existing web wallet — additive, and not required
for issuance or presentation to work.

## Verifying end to end

1. Run the hub and agent locally; point the app at them with
   `EXPO_PUBLIC_SKIPPY_HUB_URL`.
2. Create a credential offer (hub API or the Skippy web app).
3. Open the offer on the device:
   ```bash
   xcrun simctl openurl booted "openid-credential-offer://?credential_offer_uri=..."
   adb shell am start -a android.intent.action.VIEW -d "openid-credential-offer://?credential_offer_uri=..."
   ```
4. Accept it, and confirm the credential renders in the wallet.
5. Create a verification request and present against it — the hub should report the
   presentation verified.
