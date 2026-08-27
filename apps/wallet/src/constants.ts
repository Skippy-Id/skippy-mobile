import ExpoConstants from 'expo-constants'
import { brand } from '../brands'

export const mediatorDid = ExpoConstants.expoConfig?.extra?.mediatorDid
export const appScheme = ExpoConstants.expoConfig?.scheme as string
export const allowedRedirectBaseUrls = ExpoConstants.expoConfig?.extra?.allowedRedirectBaseUrls as string[] | undefined

/** Base URL of the Skippy hub this build talks to (see brands/<brand>/config.js). */
export const skippyHubUrl = ExpoConstants.expoConfig?.extra?.skippyHubUrl as string | undefined

// Secure-enclave key aliases. The EASYPID_ prefix is an upstream name kept as-is:
// it is an internal key alias, never shown to users, and renaming it would only
// add churn against upstream. See docs/REBRAND.md.
export const EASYPID_WALLET_PID_PIN_KEY_ID = 'EASYPID_WALLET_PID_PIN_KEY_ID_NO_BIOMETRICS'
export const EASYPID_WALLET_INSTANCE_LONG_TERM_AES_KEY_ID = 'EASYPID_WALLET_INSTANCE_LONG_TERM_AES_KEY_ID'

export const walletClient = {
  clientId: appScheme,
  // Take first redirect if available
  redirectUri: allowedRedirectBaseUrls?.[0] ?? `${appScheme}:///wallet/redirect`,
}

// Trust anchors come from the active brand. Upstream's demo anchors (Animo
// Playground, Bundesdruckerei, EUDI reference verifier, Docusign, …) are removed
// deliberately — see brands/skippy/trust.ts.
export const { trustedX509Entities, trustedDidEntities, trustedOpenId4VciIssuerEntities } = brand.trust

// https://github.com/eu-digital-identity-wallet/eudi-doc-architecture-and-reference-framework/blob/main/docs/annexes/annex-3/annex-3.01-pid-rulebook.md#221-eu-wide-attestation-type-and-namespace-for-pid
export const pidSchemes = {
  sdJwtVcVcts: ['urn:eudi:pid:1'],
  msoMdocDoctypes: ['eu.europa.ec.eudi.pid.1'],
}

export const mdlSchemes = {
  mdlMdocDoctypes: ['org.iso.18013.5.1.mDL'],
}
