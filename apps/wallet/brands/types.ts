import type { TrustedDidEntity, TrustedEntity, TrustedOpenId4VciEntity, TrustedX509Entity } from '@paradym/wallet-sdk'

export interface Theme {
  'primary-50': string
  'primary-100': string
  'primary-200': string
  'primary-300': string
  'primary-400': string
  'primary-500': string
  'primary-600': string
  'primary-700': string
  'primary-800': string
  'primary-900': string
  'feature-300': string
  'feature-400': string
  'feature-500': string
  'feature-600': string
  'feature-700': string
}

export type ThemeKey = keyof Theme

export interface Features {
  AI_ANALYSIS: boolean
  DIDCOMM: boolean
  CLOUD_HSM: boolean
}

export type FeatureKey = keyof Features

/** Trust anchors a brand accepts. Empty arrays mean "trust nothing" — the wallet
 * will still receive and present, but every party shows as untrusted. */
export interface BrandTrust {
  trustedX509Entities: TrustedX509Entity[]
  trustedDidEntities: TrustedDidEntity[]
  trustedOpenId4VciIssuerEntities: TrustedOpenId4VciEntity[]
  /** How this wallet identifies itself to verifiers/issuers. */
  walletTrustedEntity: TrustedEntity
}
