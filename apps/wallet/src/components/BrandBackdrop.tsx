import { View } from 'react-native'
import Svg, { Circle, Defs, LinearGradient, Rect, Stop } from 'react-native-svg'
import { useTheme } from 'tamagui'

interface BrandBackdropProps {
  /** Fraction of the backdrop height the tinted wash covers before it fades out. */
  intensity?: number
}

/**
 * Quiet brand field behind the welcome and wallet screens.
 *
 * Replaces upstream's hand-drawn organic blob — that shape is Animo's, and a
 * large saturated field is also the opposite of what a credential wallet should
 * feel like. This is a soft vertical wash with concentric arcs echoing the
 * Skippy mark's swirl, kept faint so type and cards stay the loudest thing on
 * screen.
 *
 * Colours come from theme tokens, so every white-label brand gets its own tint
 * without touching this file.
 */
export function BrandBackdrop({ intensity = 1 }: BrandBackdropProps) {
  const theme = useTheme()
  const wash = theme['primary-100'].val as string
  const arc = theme['primary-300'].val as string
  const ground = theme.background.val as string

  return (
    <View style={{ width: '100%', height: '100%' }} pointerEvents="none">
      <Svg width="100%" height="100%" viewBox="0 0 393 420" preserveAspectRatio="xMidYMin slice" fill="none">
        <Defs>
          <LinearGradient id="skippyWash" x1="0" y1="0" x2="0" y2="420" gradientUnits="userSpaceOnUse">
            <Stop offset="0" stopColor={wash} stopOpacity={0.9 * intensity} />
            <Stop offset="0.55" stopColor={wash} stopOpacity={0.35 * intensity} />
            <Stop offset="1" stopColor={ground} stopOpacity={0} />
          </LinearGradient>
        </Defs>

        <Rect x="0" y="0" width="393" height="420" fill="url(#skippyWash)" />

        {/* Concentric arcs, centred off-canvas so only their sweep is visible —
            the swirl implied rather than drawn. */}
        {[62, 108, 158, 212].map((r, i) => (
          <Circle
            key={r}
            cx={330}
            cy={92}
            r={r}
            stroke={arc}
            strokeWidth={1.25}
            strokeOpacity={(0.5 - i * 0.09) * intensity}
            fill="none"
          />
        ))}
      </Svg>
    </View>
  )
}
