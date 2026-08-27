import type { Features } from '../types'

export const FEATURES = {
  // Over-asking analysis calls an Animo-hosted service; no Skippy equivalent.
  AI_ANALYSIS: false,
  // DIDComm needs a mediator to act as the wallet's inbox. Skippy runs none, and
  // the Skippy hub issues/verifies over OpenID4VC only.
  DIDCOMM: false,
  // Requires a Wallet Service Provider (remote HSM); keys stay on-device instead.
  CLOUD_HSM: false,
} satisfies Features
