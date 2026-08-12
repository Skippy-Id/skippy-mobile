/**
 * Build-time identity for the Skippy brand. Consumed by app.config.js and merged
 * into the shared Expo config by base.app.config.js.
 *
 * Placeholders marked __SKIPPY_TODO_* must be replaced with real values before a
 * store build — `pnpm brand:check` fails while any remain.
 */
export default {
  name: 'Skippy Wallet',
  slug: 'skippy-wallet',
  // Custom URL scheme. Matches the bundle id so it is globally unique.
  scheme: 'id.skippy.wallet',
  bundleId: 'id.skippy.wallet',

  // Expo/EAS account details — see docs/STORE_RELEASE.md step 4.
  owner: process.env.EXPO_OWNER ?? '__SKIPPY_TODO_EXPO_OWNER__',
  projectId: process.env.EAS_PROJECT_ID ?? '__SKIPPY_TODO_EAS_PROJECT_ID__',

  icon: './brands/skippy/assets/icon.png',
  // NOTE: android requires paths referenced directly in code to only contain
  // _ a-Z 0-9, so we use _ for all files
  adaptiveIcon: './brands/skippy/assets/adaptive_icon.png',
  adaptiveIconBackgroundColor: '#6B3FA0',
  splash: './brands/skippy/assets/splash.png',
  splashIcon: './brands/skippy/assets/splash_icon.png',
  assets: ['./brands/skippy/assets/icon.png'],

  // Universal links. Requires apple-app-site-association + assetlinks.json served
  // from https://app.skippy.id/.well-known/ (skippy monorepo, see docs/BACKEND.md).
  associatedDomains: ['app.skippy.id'],
  universalLinkPaths: ['/wallet', '/invitation', '/oauth2/redirect'],

  // DIDComm is disabled for Skippy (no mediator), so no `didcomm` scheme here.
  additionalInvitationSchemes: [],

  extraConfig: {
    skippyHubUrl: process.env.EXPO_PUBLIC_SKIPPY_HUB_URL ?? 'https://app.skippy.id',
    allowedRedirectBaseUrls: ['https://app.skippy.id/wallet/redirect'],
  },
}
