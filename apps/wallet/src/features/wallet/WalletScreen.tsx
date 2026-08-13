import { BrandBackdrop } from '@app/components/BrandBackdrop'
import { Trans, useLingui } from '@lingui/react/macro'
import { useHaptics } from '@package/app'
import {
  AnimatedStack,
  CustomIcons,
  FlexPage,
  Heading,
  HeroIcons,
  IconContainer,
  Paragraph,
  ScrollView,
  Spacer,
  useSpringify,
  XStack,
  YStack,
} from '@package/ui'
import { useRefreshedDeferredCredentials } from '@paradym/wallet-sdk'
import { useRouter } from 'expo-router'
import { FadeIn } from 'react-native-reanimated'
import { useFeatureFlag } from '../../hooks/useFeatureFlag'
import { useRefreshPaymentTransactionStatuses } from '../../hooks/useRefreshPaymentTransactionStatuses'
import { ActionCard } from './components/ActionCard'
import { AllCardsCard } from './components/AllCardsCard'
import { InboxIcon } from './components/InboxIcon'
import { LatestActivityCard } from './components/LatestActivityCard'

export function WalletScreen() {
  const { push } = useRouter()
  const { withHaptics } = useHaptics()
  // The inbox is DIDComm-only (mediator messages), and its hooks require the
  // DIDComm record providers, which RecordProvider only mounts when the agent
  // has DIDComm modules — rendering the icon without them crashes the screen.
  const isInboxEnabled = useFeatureFlag('DIDCOMM')

  const pushToMenu = withHaptics(() => push('/menu'))
  const pushToScanner = withHaptics(() => push('/scan'))
  const pushToOffline = () => {
    withHaptics(() => push('/offline'))()
  }
  const { t } = useLingui()

  useRefreshedDeferredCredentials()
  useRefreshPaymentTransactionStatuses()

  return (
    <YStack pos="relative" fg={1} bg="$background">
      <YStack pos="absolute" t={0} l={0} r={0} h="44%">
        <BrandBackdrop />
      </YStack>

      <FlexPage fg={1} flex-1={false} bg="transparent">
        <XStack pt="$2" jc="space-between">
          <IconContainer bg="white" aria-label="Menu" icon={<HeroIcons.Menu />} onPress={pushToMenu} />
          {isInboxEnabled && <InboxIcon />}
        </XStack>

        <AnimatedStack fg={1} entering={useSpringify(FadeIn, 200)}>
          <ScrollView scrollEnabled={false} contentContainerStyle={{ fg: 1 }}>
            {/* Left-aligned so the eye lands in the same column all the way down
                the screen, rather than jumping from a centred hero into a list. */}
            <YStack fg={1} f={1} gap="$5" pt="$5">
              <YStack gap="$2">
                <Heading heading="h1" fontSize={34} lineHeight={38} letterSpacing={-0.8} numberOfLines={2}>
                  <Trans id="home.helloWithoutName">Hello!</Trans>
                </Heading>
                <Paragraph fontSize={16}>
                  <Trans id="home.receiveOrShare">Receive or share from your wallet</Trans>
                </Paragraph>
              </YStack>

              <XStack gap="$3">
                <ActionCard
                  variant="primary"
                  icon={<CustomIcons.Qr color="white" />}
                  title={t({ id: 'home.scanQrButton', message: 'Scan QR-code' })}
                  onPress={pushToScanner}
                />
                <ActionCard
                  variant="secondary"
                  icon={<CustomIcons.People size={24} color="$primary-500" />}
                  title={t({ id: 'home.presentInPersonButton', message: 'Present In-person' })}
                  onPress={pushToOffline}
                />
              </XStack>

              <YStack gap="$3" fg={1}>
                <Paragraph
                  fontSize={12}
                  letterSpacing={1.1}
                  fontWeight="$semiBold"
                  color="$grey-600"
                  textTransform="uppercase"
                >
                  <Trans id="home.overviewLabel">Overview</Trans>
                </Paragraph>
                <YStack gap="$3">
                  <LatestActivityCard />
                  <AllCardsCard />
                </YStack>
              </YStack>

              <Spacer />
            </YStack>
          </ScrollView>
        </AnimatedStack>
      </FlexPage>
    </YStack>
  )
}
