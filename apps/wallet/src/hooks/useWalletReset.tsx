import { useClearRuntimeBrand } from '@app/brand'
import { resetWalletServiceProviderState } from '@app/crypto/WalletServiceProviderClient'
import { useLingui } from '@lingui/react/macro'
import { useHaptics } from '@package/app'
import { commonMessages } from '@package/translations'
import { useParadym } from '@paradym/wallet-sdk'
import { useRouter } from 'expo-router'
import { useCallback } from 'react'
import { Alert } from 'react-native'

export const useWalletReset = () => {
  const router = useRouter()
  const { withHaptics } = useHaptics()
  const { t } = useLingui()
  const paradym = useParadym('unlocked')
  const clearRuntimeBrand = useClearRuntimeBrand()

  const onResetWallet = withHaptics(
    useCallback(() => {
      Alert.alert(t(commonMessages.reset), t(commonMessages.confirmResetWallet), [
        {
          text: t(commonMessages.cancel),
          style: 'cancel',
        },
        {
          text: t(commonMessages.yes),
          onPress: withHaptics(async () => {
            await paradym.reset()
            await resetWalletServiceProviderState()
            // Drop the cached tenant brand too, so a reset wallet comes back as
            // the plain Skippy app rather than the last customer's branding.
            clearRuntimeBrand()
            router.replace('/onboarding?reset=true')
          }),
        },
      ])
    }, [router, withHaptics, t, clearRuntimeBrand])
  )

  return onResetWallet
}
