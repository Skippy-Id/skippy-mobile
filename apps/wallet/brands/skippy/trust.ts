import type { BrandTrust } from '../types'

/**
 * Trust anchors for the Skippy wallet.
 *
 * Upstream shipped ~20 demo anchors (Animo Playground, Bundesdruckerei, EUDI
 * reference verifier, Docusign, Vodafone, …). Those are removed: a Skippy build
 * must not vouch for third-party demo issuers.
 *
 * These lists are intentionally empty until the skippy-agent issuance chain is
 * finalised. With no anchors the wallet still receives and presents credentials,
 * but every counterparty renders as untrusted in the UI. Populate before store
 * submission — see docs/STORE_RELEASE.md.
 *
 * __SKIPPY_TODO_ROOT_CA_PEM__ — add the Skippy issuance root CA here, e.g.
 *
 *   trustedX509Entities: [
 *     {
 *       entityId: 'app.skippy.id',
 *       name: 'Skippy',
 *       certificate: `-----BEGIN CERTIFICATE-----\n…\n-----END CERTIFICATE-----`,
 *       url: 'https://skippy.id',
 *       logoUri: 'https://app.skippy.id/pwa-192x192.png',
 *       demo: false,
 *     },
 *   ]
 */
export const trust: BrandTrust = {
  trustedX509Entities: [],
  trustedDidEntities: [],
  trustedOpenId4VciIssuerEntities: [],
  walletTrustedEntity: {
    organizationName: 'Skippy Wallet',
    entityId: '__',
    logoUri: require('./assets/icon.png'),
    uri: 'https://skippy.id',
  },
}
