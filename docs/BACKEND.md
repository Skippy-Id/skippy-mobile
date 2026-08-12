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

Universal links require two files on `app.skippy.id`, which the hub does not serve
yet — `packages/nginx/nginx.conf` matches an explicit path allowlist with no
`/.well-known/` route. In the **skippy** monorepo:

1. `packages/skippy-web/public/.well-known/apple-app-site-association` — no file
   extension, served as `application/json`, over HTTPS, no redirects:

   ```json
   {
     "applinks": {
       "details": [
         {
           "appIDs": ["<TEAM_ID>.id.skippy.wallet"],
           "components": [{ "/": "/wallet/*" }, { "/": "/invitation/*" }]
         }
       ]
     }
   }
   ```

2. `packages/skippy-web/public/.well-known/assetlinks.json`:

   ```json
   [
     {
       "relation": ["delegate_permission/common.handle_all_urls"],
       "target": {
         "namespace": "android_app",
         "package_name": "id.skippy.wallet",
         "sha256_cert_fingerprints": ["<SHA256 from `eas credentials -p android`>"]
       }
     }
   ]
   ```

3. An nginx `location ^~ /.well-known/ { ... }` in the `app.skippy.id` server
   block, proxying to skippy-web.

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
