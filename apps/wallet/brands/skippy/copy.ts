import { defineMessage } from '@lingui/core/macro'
import { useAssets } from 'expo-asset'

export const productName = 'Skippy Wallet'
export const supportEmail = 'support@skippy.id'
// __SKIPPY_TODO_PRIVACY_URL__ — must be live before store submission; both stores
// require a reachable privacy policy URL.
export const privacyPolicyUrl = 'https://skippy.id/privacy'

export const copy = {
  about: {
    description: defineMessage({
      id: 'skippyWallet.about.description',
      message:
        'Skippy Wallet lets you receive, hold and share digital credentials. Built on open standards (OpenID4VC), it is based on the Paradym Wallet by Animo Solutions, available under Apache 2.0.',
      comment: 'About screen description text for the Skippy wallet',
    }),
    emailHeader: defineMessage({
      id: 'skippyWallet.about.emailHeader',
      message: 'Reach out from Skippy Wallet',
      comment: 'Email subject when contacting support from Skippy wallet',
    }),
  },
}

export function useAppIcon() {
  const [assets] = useAssets([require('./assets/icon.png')])
  return assets?.[0]
}
