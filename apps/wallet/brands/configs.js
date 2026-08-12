/**
 * Build-time brand registry, consumed by app.config.js.
 *
 * Kept as .js (not .ts) because Expo evaluates app.config.js in plain Node before
 * any TypeScript pipeline exists.
 */
import skippy from './skippy/config.js'

// Register a new brand's build config here.
const CONFIGS = {
  skippy,
}

export function getBrandConfig(name) {
  const config = CONFIGS[name]
  if (!config) {
    throw new Error(`Unknown APP_BRAND "${name}". Known brands: ${Object.keys(CONFIGS).join(', ')}.`)
  }
  return config
}

export const brandNames = Object.keys(CONFIGS)
