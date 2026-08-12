/**
 * Brand registry — everything the running app needs that varies per brand,
 * except the theme (see ./themes.ts for why that one is separate).
 */
import { APP_BRAND } from './current'
import {
  copy as skippyCopy,
  privacyPolicyUrl as skippyPrivacyPolicyUrl,
  productName as skippyProductName,
  supportEmail as skippySupportEmail,
  useAppIcon as skippyUseAppIcon,
} from './skippy/copy'
import { FEATURES as skippyFeatures } from './skippy/features'
import { trust as skippyTrust } from './skippy/trust'
import type { BrandTrust, Features } from './types'

export interface Brand {
  /** Wallet name shown to holders. Overridden at runtime by tenant branding. */
  productName: string
  supportEmail: string
  privacyPolicyUrl: string
  copy: typeof skippyCopy
  useAppIcon: () => ReturnType<typeof skippyUseAppIcon>
  features: Features
  trust: BrandTrust
}

// Register a new brand here (and in ./themes.ts and ./configs.js).
const BRANDS: Record<string, Brand> = {
  skippy: {
    productName: skippyProductName,
    supportEmail: skippySupportEmail,
    privacyPolicyUrl: skippyPrivacyPolicyUrl,
    copy: skippyCopy,
    useAppIcon: skippyUseAppIcon,
    features: skippyFeatures,
    trust: skippyTrust,
  },
}

const selected = BRANDS[APP_BRAND]
if (!selected) {
  throw new Error(`Unknown EXPO_PUBLIC_APP_BRAND "${APP_BRAND}". Known brands: ${Object.keys(BRANDS).join(', ')}.`)
}

export const brand: Brand = selected
export { APP_BRAND }
