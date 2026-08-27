import { trustedDidEntities, trustedOpenId4VciIssuerEntities, trustedX509Entities } from '@app/constants'
import type { SetupParadymWalletSdkOptions } from '@paradym/wallet-sdk'
import { LogLevel } from '@paradym/wallet-sdk'
import { brand } from '../../brands'

export const walletSdkOptions: SetupParadymWalletSdkOptions = {
  // On-disk wallet store id. Upstream pins this to 'easypid-wallet' to keep its
  // existing installs readable; Skippy ships as a new app with no prior installs,
  // so it owns its own namespace.
  id: 'skippy-wallet',
  logging: {
    // Trace logging records credential contents. Keep it to dev builds so a store
    // build never writes holder data to the device log.
    level: __DEV__ ? LogLevel.Trace : LogLevel.Warn,
    trace: __DEV__,
    traceLimit: 1000,
  },
  openId4VcConfiguration: {
    getTrustedCertificatesForVerification: (_agentContext, { certificateChain, verification }) => {
      if (verification.type === 'credential') {
        return [certificateChain[certificateChain.length - 1].toString('pem')]
      }

      // Allow any actor for auth requests for now
      if (verification.type === 'oauth2SecuredAuthorizationRequest') {
        return [certificateChain[certificateChain.length - 1].toString('pem')]
      }

      return undefined
    },
  },
  trustMechanisms: [
    // 'eudi_rp_authentication' is intentionally absent: it requires an EUDI trust
    // list, and Skippy is not part of that framework.
    { trustMechanism: 'x509', trustedX509Entities },
    { trustMechanism: 'did', trustedDidEntities },
    { trustMechanism: 'none', trustedEntities: trustedOpenId4VciIssuerEntities },
    { walletTrustedEntity: brand.trust.walletTrustedEntity },
  ],
  // didcommConfiguration is omitted on purpose — the SDK then skips the DIDComm
  // modules entirely, so no mediator is required. See brands/skippy/features.ts.
}
