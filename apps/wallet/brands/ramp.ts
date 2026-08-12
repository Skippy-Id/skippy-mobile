/**
 * Colour maths for brand themes, ported from the Skippy web app's brand utility
 * (packages/skippy-web/src/util/brand.ts) so a colour configured in the Skippy
 * dashboard renders the same ramp on web and on mobile.
 *
 * Used twice: once at build time by each brand's theme.ts, and again at runtime
 * by the tenant branding provider (src/brand) — same input, same output.
 */
import type { Theme } from './types'

export interface Rgb {
  r: number
  g: number
  b: number
}

const WHITE: Rgb = { r: 255, g: 255, b: 255 }
const BLACK: Rgb = { r: 0, g: 0, b: 0 }

function clampByte(n: number): number {
  return Math.max(0, Math.min(255, Math.round(n)))
}

/** Parse `#RGB`, `#RRGGBB` (with or without `#`) or an `r g b` / `r,g,b` triplet. */
export function parseColor(input?: string | null): Rgb | null {
  if (!input) return null
  const raw = String(input).trim()
  if (!raw) return null

  const parts = raw.split(/[\s,]+/).filter(Boolean)
  if (parts.length === 3 && parts.every((p) => /^\d{1,3}$/.test(p))) {
    return { r: clampByte(+parts[0]), g: clampByte(+parts[1]), b: clampByte(+parts[2]) }
  }

  let hex = raw.replace(/^#/, '')
  if (/^[0-9a-fA-F]{3}$/.test(hex)) {
    hex = hex
      .split('')
      .map((c) => c + c)
      .join('')
  }
  if (/^[0-9a-fA-F]{6}$/.test(hex)) {
    return {
      r: Number.parseInt(hex.slice(0, 2), 16),
      g: Number.parseInt(hex.slice(2, 4), 16),
      b: Number.parseInt(hex.slice(4, 6), 16),
    }
  }
  return null
}

export function mix(base: Rgb, target: Rgb, t: number): Rgb {
  return {
    r: clampByte(base.r * (1 - t) + target.r * t),
    g: clampByte(base.g * (1 - t) + target.g * t),
    b: clampByte(base.b * (1 - t) + target.b * t),
  }
}

export function toHex({ r, g, b }: Rgb): string {
  return `#${[r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('')}`.toUpperCase()
}

type MixStep = { white?: number; black?: number }

// The UI treats `primary-500` as the action colour (buttons, links), so the brand's
// own primary anchors at 500 — unlike the web ramp, where the anchor is 700.
const PRIMARY_MIX: Record<string, MixStep> = {
  '50': { white: 0.95 },
  '100': { white: 0.88 },
  '200': { white: 0.75 },
  '300': { white: 0.58 },
  '400': { white: 0.32 },
  '500': {},
  '600': { black: 0.12 },
  '700': { black: 0.26 },
  '800': { black: 0.42 },
  '900': { black: 0.55 },
}

const FEATURE_MIX: Record<string, MixStep> = {
  '300': { white: 0.58 },
  '400': { white: 0.32 },
  '500': {},
  '600': { black: 0.14 },
  '700': { black: 0.28 },
}

// feature-500 is used as accent *text* on white (see ActivityRowItem), so a raw
// mid-tone accent (e.g. Skippy's #D4A017 amber) would fail WCAG AA. Darken the
// supplied accent before building its ramp; 0.34 keeps Skippy's amber just past
// the 4.5:1 AA threshold.
const FEATURE_DARKEN = 0.34

function applyStep(base: Rgb, step: MixStep): Rgb {
  if (step.white != null) return mix(base, WHITE, step.white)
  if (step.black != null) return mix(base, BLACK, step.black)
  return base
}

export interface BrandColors {
  /** Brand primary — lands on `primary-500`. */
  primary: string
  /** Accent colour — darkened, then lands on `feature-500`. */
  feature: string
}

/** Build the full Tamagui theme token set from two brand colours. */
export function buildAppTheme({ primary, feature }: BrandColors): Theme {
  const primaryRgb = parseColor(primary)
  if (!primaryRgb) throw new Error(`Invalid brand primary colour: ${primary}`)
  const featureRgb = parseColor(feature)
  if (!featureRgb) throw new Error(`Invalid brand feature colour: ${feature}`)

  const featureBase = mix(featureRgb, BLACK, FEATURE_DARKEN)

  const theme = {} as Record<string, string>
  for (const [shade, step] of Object.entries(PRIMARY_MIX)) {
    theme[`primary-${shade}`] = toHex(applyStep(primaryRgb, step))
  }
  for (const [shade, step] of Object.entries(FEATURE_MIX)) {
    theme[`feature-${shade}`] = toHex(applyStep(featureBase, step))
  }
  return theme as unknown as Theme
}
