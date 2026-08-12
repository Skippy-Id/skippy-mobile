/**
 * Theme registry — kept separate from index.ts on purpose.
 *
 * tamagui.config.ts pulls the theme in through src/config/themes.ts, and the
 * Tamagui babel plugin evaluates that chain in a bare esbuild context at build
 * time. Importing only theme modules here keeps runtime-only dependencies
 * (Lingui macros, expo-asset) off that path.
 */
import { APP_BRAND } from './current'
import { APP_THEME as skippy } from './skippy/theme'
import type { Theme } from './types'

// Register a new brand's theme here.
const THEMES: Record<string, Theme> = {
  skippy,
}

const theme = THEMES[APP_BRAND]
if (!theme) {
  // Fail loudly: silently falling back would ship one brand's colours under
  // another brand's name.
  throw new Error(`Unknown EXPO_PUBLIC_APP_BRAND "${APP_BRAND}". Known brands: ${Object.keys(THEMES).join(', ')}.`)
}

export const APP_THEME: Theme = theme
