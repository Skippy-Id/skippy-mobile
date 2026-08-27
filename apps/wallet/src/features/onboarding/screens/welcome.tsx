import { BrandBackdrop } from '@app/components/BrandBackdrop'
import { useLingui } from '@lingui/react/macro'
import { Button, FlexPage, Heading, Image, Paragraph, Stack, XStack, YStack } from '@package/ui'
import ExpoConstants from 'expo-constants'
import { brand } from '../../../../brands'

export interface OnboardingWelcomeProps {
  goToNextStep: () => void
}

export default function OnboardingWelcome({ goToNextStep }: OnboardingWelcomeProps) {
  const { t } = useLingui()

  const introText = t({
    id: 'onboardingWelcome.description',
    message: 'This is your digital wallet. With it, you can store and share information about yourself.',
    comment: 'Intro paragraph on the welcome screen',
  })

  const getStartedLabel = t({
    id: 'onboardingWelcome.getStarted',
    message: 'Get Started',
    comment: 'Button label to begin onboarding from the welcome screen',
  })

  return (
    <YStack fg={1} pos="relative">
      <YStack pos="absolute" t={0} l={0} r={0} h="58%">
        <BrandBackdrop />
      </YStack>

      <FlexPage fg={1} jc="space-between" backgroundColor="$transparent">
        {/* Left-aligned mark and title: the app introduces itself the way a
            document does, rather than as a centred splash. */}
        <YStack fg={1} jc="center" gap="$6">
          <Stack
            br={20}
            ov="hidden"
            bg={brand.logoBackground}
            w={72}
            h={72}
            shadowOffset={{ width: 0, height: 10 }}
            shadowColor="$grey-900"
            shadowOpacity={0.18}
            shadowRadius={24}
          >
            <Image height={72} width={72} src="icon" />
          </Stack>

          <YStack gap="$3">
            <Heading heading="h1" fontSize={34} letterSpacing={-0.8}>
              {ExpoConstants.expoConfig?.name}
            </Heading>
            <Paragraph fontSize={17} maxWidth={320}>
              {introText}
            </Paragraph>
          </YStack>
        </YStack>

        <XStack gap="$2">
          <Button.Solid flexGrow={1} onPress={goToNextStep}>
            {getStartedLabel}
          </Button.Solid>
        </XStack>
      </FlexPage>
    </YStack>
  )
}
