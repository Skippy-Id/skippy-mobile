import { AnimatedStack, Heading, Stack, useScaleAnimation, YStack } from '@package/ui'
import type { ReactNode } from 'react'

interface ActionCardProps {
  variant?: 'primary' | 'secondary'
  icon: ReactNode
  title: string
  onPress: () => void
}

/**
 * Home-screen action tile.
 *
 * Both tiles are the same quiet surface; the primary one is distinguished by a
 * filled accent icon well rather than by inverting the whole card. Upstream
 * contrasts a solid black tile against a white one, which shouts louder than a
 * credential wallet needs to.
 */
export function ActionCard({ icon, title, onPress, variant = 'primary' }: ActionCardProps) {
  const { pressStyle, handlePressIn, handlePressOut } = useScaleAnimation({ scaleInValue: 0.97 })

  const spaceIndex = title.lastIndexOf(' ')
  const titleParts = spaceIndex ? [title.slice(0, spaceIndex), title.slice(spaceIndex)] : [title]

  return (
    <AnimatedStack
      style={pressStyle}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
      jc="space-between"
      bg="$white"
      bw={1}
      borderColor="$grey-100"
      br={16}
      p="$3.5"
      fg={1}
      gap="$5"
      accessible={true}
      accessibilityRole="button"
      aria-label={title}
    >
      <Stack w={40} h={40} br={12} ai="center" jc="center" bg={variant === 'primary' ? '$primary-500' : '$primary-100'}>
        {icon}
      </Stack>
      <YStack>
        {titleParts.map((word) => (
          <Heading key={word} color="$grey-900" heading="h3" letterSpacing={-0.3}>
            {word}
          </Heading>
        ))}
      </YStack>
    </AnimatedStack>
  )
}
