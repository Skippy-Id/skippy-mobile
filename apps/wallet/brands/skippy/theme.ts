import { buildAppTheme } from '../ramp'

// Skippy brand colours, matching packages/skippy-web (primary #6B3FA0 "eminence",
// secondary #D4A017 amber).
export const APP_THEME = buildAppTheme({
  primary: '#6B3FA0',
  feature: '#D4A017',
})

/**
 * Ground the logo sits on. Skippy's mark is white on near-black — the same
 * colour as the web app's `theme_color` — not on brand purple. Purple is the
 * accent; the logo lockup is black.
 */
export const LOGO_BACKGROUND = '#0D1117'
