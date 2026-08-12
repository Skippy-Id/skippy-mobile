/**
 * Test-only module resolver.
 *
 * The app imports relative modules without a file extension (the Metro/babel
 * convention), which bare Node ESM will not resolve. This hook retries a failed
 * relative resolution with .ts / .tsx / /index.ts so the same source can run
 * under `node --test` without extensions being added everywhere for the tests'
 * benefit.
 */
import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

export async function resolve(specifier, context, next) {
  if (!specifier.startsWith('.')) return next(specifier, context)
  try {
    return await next(specifier, context)
  } catch (error) {
    const base = new URL(specifier, context.parentURL).href
    for (const candidate of [`${base}.ts`, `${base}.tsx`, `${base}/index.ts`]) {
      if (existsSync(fileURLToPath(candidate))) return next(candidate, context)
    }
    throw error
  }
}
