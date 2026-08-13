import { radius, size, space, zIndex } from '@tamagui/themes'
import { createTamagui, createTokens } from 'tamagui'
import { configInput, fontInter, hexColors } from '../../packages/ui/src/config/tamagui.config'
import { APP_THEME } from './src/config/themes'

const themeColors = APP_THEME

export const tokensInput = {
  color: hexColors,
  radius: {
    ...radius,
    // Tighter than upstream's pill-ish 16: squarer corners read as considered
    // rather than playful, which suits credentials.
    button: 10,
  },
  size,
  zIndex,
  space,
} as const

const tokens = createTokens({
  ...tokensInput,
  size: {
    ...tokensInput.size,
    buttonHeight: 56,
  },
  color: {
    ...hexColors, // Re-use existing colors for positive/warnings etc.
    background: hexColors.white,
    'grey-50': '#F5F7F8',
    'grey-100': '#EBF1F3',
    'grey-200': '#E5E9EC',
    'grey-300': '#D7DCE0',
    'grey-400': '#BFC5CB',
    'grey-500': '#839196',
    'grey-600': '#6D7581',
    'grey-700': '#656974',
    'grey-800': '#464B56',
    'grey-900': '#222222',
    ...themeColors,
  },
})

const config = createTamagui({
  ...configInput,
  tokens,
  fonts: {
    // Inter everywhere, matching the Skippy web app. Upstream pairs Open Sans
    // with Raleway headings, which is a large part of what makes the app read
    // as Paradym rather than Skippy.
    default: fontInter,
    heading: fontInter,
    // Somehow adding body font gives build errors?!
    body: fontInter,
  },
  themes: {
    light: {
      ...tokens.color,
      tableBackgroundColor: tokens.color['grey-50'],
      tableBorderColor: '#ffffff',
      idCardBackground: '#F1F2F0',
    },
  },
})

type ConfIg = typeof config
declare module 'tamagui' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface TamaguiCustomConfig extends ConfIg {}
}

export default config
